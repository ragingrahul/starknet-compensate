import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { z } from "zod";

const createPeriodSchema = z.object({
  walletAddress: z.string().min(1),
  periodId: z.string().min(1),
  label: z.string().optional(),
  employeeIds: z.array(z.string().uuid()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createPeriodSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 },
      );
    }

    const company = await getCompanyByWallet(result.data.walletAddress);
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Fetch selected employees
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", company.id)
      .in("id", result.data.employeeIds)
      .eq("status", "active");

    if (empError || !employees?.length) {
      return NextResponse.json(
        { error: "No valid employees found" },
        { status: 400 },
      );
    }

    // Fetch token decimals to scale salary values to on-chain amounts
    let tokenDecimals = 18;
    if (company.token_contract_address) {
      try {
        const RPC_URL =
          process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
          "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";
        const decRes = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "starknet_call",
            params: {
              request: {
                contract_address: company.token_contract_address,
                entry_point_selector:
                  "0x004c4fb1ab068f6039d5780c68dd0fa2f8742cceb3426d19667778ca7f3518a9",
                calldata: [],
              },
              block_id: "latest",
            },
          }),
        });
        const decJson = await decRes.json();
        if (decJson.result?.[0]) {
          tokenDecimals = Number(BigInt(decJson.result[0]));
        }
      } catch {
        // Fall back to 18 decimals
      }
    }
    const scaleFactor = 10n ** BigInt(tokenDecimals);

    const poseidonLite = await import("poseidon-lite");
    const { poseidon2, poseidon8 } = poseidonLite;

    const DOMAIN_LEAF = BigInt("0x504159524f4c4c5f4c454146");
    const DEPTH = 16;
    const TREE_SIZE = 2 ** DEPTH;

    // Company's admin wallet as the circuit company_id (felt252)
    const companyIdBig = BigInt(company.admin_wallet_address);

    // Build leaf entries and compute hashes for the SHIELDED circuit:
    //   leaf = poseidon8(DOMAIN_LEAF, secret_hash, amount_low, amount_high,
    //                   period_id, company_id, leaf_nonce, recipient)
    const periodId = result.data.periodId;
    const leafEntries = employees.map((emp, index) => {
      const amountBig = BigInt(Math.round(emp.salary)) * scaleFactor;
      const amountLow =
        amountBig & BigInt("0xffffffffffffffffffffffffffffffff");
      const amountHigh = amountBig >> 128n;
      const nonce = emp.leaf_nonce_counter ?? 0;
      // secret_hash = poseidon2(DOMAIN_SECRET, secret_hash_stored)
      // NOTE: emp.secret_hash is already poseidon2(DOMAIN_SECRET, raw_secret)
      //       so we pass it directly as the secret_hash in the leaf.
      const secretHash = BigInt(emp.secret_hash);
      const recipient = BigInt(emp.starknet_wallet_address);

      const leafHash = poseidon8([
        DOMAIN_LEAF,
        secretHash,
        amountLow,
        amountHigh,
        BigInt(periodId),
        companyIdBig,
        BigInt(nonce),
        recipient,
      ]);

      return {
        employeeId: emp.id,
        leafIndex: index,
        leafHash,
        amount: amountBig.toString(),
        nonce,
        // Store recipient directly (not as a Poseidon commitment)
        recipientCommitment: emp.starknet_wallet_address,
        amountLow,
        amountHigh,
      };
    });

    // Build Merkle tree
    const paddedLeaves = leafEntries.map((e) => e.leafHash);
    while (paddedLeaves.length < TREE_SIZE) {
      paddedLeaves.push(0n);
    }

    const layers: bigint[][] = [paddedLeaves];
    for (let d = 0; d < DEPTH; d++) {
      const prev = layers[d];
      const next: bigint[] = [];
      for (let i = 0; i < prev.length; i += 2) {
        next.push(poseidon2([prev[i], prev[i + 1]]));
      }
      layers.push(next);
    }
    const root = layers[DEPTH][0];

    // Extract Merkle proofs for each leaf
    const leavesWithProofs = leafEntries.map((entry) => {
      let idx = entry.leafIndex;
      const pathElements: string[] = [];
      const pathIndices: number[] = [];
      for (let d = 0; d < DEPTH; d++) {
        const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
        pathElements.push("0x" + layers[d][siblingIdx].toString(16));
        pathIndices.push(idx % 2);
        idx = Math.floor(idx / 2);
      }
      return { ...entry, pathElements, pathIndices };
    });

    const totalGross = leafEntries
      .reduce((acc, e) => acc + BigInt(e.amount), 0n)
      .toString();

    // Insert payroll_period row
    const { data: period, error: periodError } = await supabase
      .from("payroll_periods")
      .insert({
        company_id: company.id,
        period_id: periodId,
        label: result.data.label ?? null,
        merkle_root: "0x" + root.toString(16),
        total_gross: totalGross,
        state: "draft",
      })
      .select()
      .single();

    if (periodError) {
      return NextResponse.json(
        { error: "Failed to create period", details: periodError.message },
        { status: 500 },
      );
    }

    // Bulk insert period_leaves
    const leafRows = leavesWithProofs.map((leaf) => ({
      period_id: period.id,
      employee_id: leaf.employeeId,
      leaf_index: leaf.leafIndex,
      leaf_hash: "0x" + leaf.leafHash.toString(16),
      amount: leaf.amount,
      nonce: leaf.nonce,
      recipient_commitment: leaf.recipientCommitment,
      path_elements: leaf.pathElements,
      path_indices: leaf.pathIndices,
    }));

    const { error: leafError } = await supabase
      .from("period_leaves")
      .insert(leafRows);

    if (leafError) {
      return NextResponse.json(
        { error: "Failed to insert leaves", details: leafError.message },
        { status: 500 },
      );
    }

    // Increment leaf_nonce_counter for each employee
    for (const emp of employees) {
      await supabase
        .from("employees")
        .update({ leaf_nonce_counter: (emp.leaf_nonce_counter ?? 0) + 1 })
        .eq("id", emp.id);
    }

    return NextResponse.json(
      {
        period,
        merkleRoot: "0x" + root.toString(16),
        totalGross,
        leafCount: leafEntries.length,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating period:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json(
        { error: "wallet query param required" },
        { status: 400 },
      );
    }

    const company = await getCompanyByWallet(wallet);
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("payroll_periods")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch periods", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ periods: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
