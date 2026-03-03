/**
 * GET /api/pool/merkle-path
 *
 * Returns the complete two-level Merkle path for a period leaf so the employee
 * can generate a shielded ZK proof:
 *   L1 path:  leaf → company_root   (stored in period_leaves at period creation)
 *   L2 path:  company_root → global_root  (stored after coordinator update)
 *
 * Query params:
 *   wallet         — employee's Starknet wallet address
 *   periodLeafId   — UUID of the specific period_leaves row (optional if companyId+periodId set)
 *   companyId      — company admin wallet address (optional alternative lookup)
 *   periodOnChainId — on-chain period_id string (optional alternative lookup)
 *
 * Returns:
 *   {
 *     leafIndex, amount, nonce,
 *     pathL1: string[], indicesL1: number[],   // L1: leaf → company_root
 *     pathL2: string[], indicesL2: number[],   // L2: company_root → global_root
 *     globalRoot: string,                      // hex, BN254 Poseidon (may > felt252)
 *     companyRoot: string,                     // hex, company's L1 root
 *     periodOnChainId: string,                 // e.g. "1"
 *     companyId: string,                       // company admin wallet (circuit private input)
 *     token: string,                           // ERC20 token address
 *   }
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const wallet = searchParams.get("wallet");
    const periodLeafId = searchParams.get("periodLeafId");
    const companyIdParam = searchParams.get("companyId");
    const periodOnChainIdParam = searchParams.get("periodOnChainId");

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet query param required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    let leafQuery = supabase
      .from("period_leaves")
      .select(
        `
        id,
        leaf_index,
        leaf_hash,
        amount,
        nonce,
        path_elements,
        path_indices,
        path_L2_elements,
        path_L2_indices,
        global_root,
        claimed,
        payroll_periods (
          id,
          period_id,
          merkle_root,
          state,
          company_id,
          companies (
            admin_wallet_address,
            token_contract_address
          )
        ),
        employees (
          starknet_wallet_address
        )
      `,
      )
      .eq("employees.starknet_wallet_address", wallet)
      .eq("claimed", false);

    if (periodLeafId) {
      leafQuery = leafQuery.eq("id", periodLeafId);
    } else if (companyIdParam && periodOnChainIdParam) {
      // Look up the period by company wallet + on-chain period_id
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("admin_wallet_address", companyIdParam)
        .single();

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 },
        );
      }

      const { data: period } = await supabase
        .from("payroll_periods")
        .select("id")
        .eq("company_id", company.id)
        .eq("period_id", periodOnChainIdParam)
        .single();

      if (!period) {
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 },
        );
      }

      leafQuery = leafQuery.eq("period_id", period.id);
    }

    const { data: leaves, error: leafErr } = await leafQuery;

    if (leafErr) {
      return NextResponse.json(
        { error: "Failed to fetch leaves", details: leafErr.message },
        { status: 500 },
      );
    }

    // Filter to leaves belonging to this wallet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myLeaves = (leaves ?? []).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (l: any) => l.employees?.starknet_wallet_address === wallet,
    );

    if (myLeaves.length === 0) {
      return NextResponse.json(
        { error: "No claimable leaves found for this wallet" },
        { status: 404 },
      );
    }

    // Return structured paths for each leaf
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = myLeaves.map((leaf: any) => {
      const period = leaf.payroll_periods;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const company = period?.companies as any;

      if (!leaf.path_L2_elements || !leaf.global_root) {
        return {
          leafId: leaf.id,
          error:
            "L2 path not yet available — coordinator has not updated global root for this period",
          periodState: period?.state,
        };
      }

      return {
        leafId: leaf.id,
        leafIndex: leaf.leaf_index,
        amount: leaf.amount,
        nonce: leaf.nonce,
        // L1 path (leaf → company_root)
        pathL1: leaf.path_elements as string[],
        indicesL1: leaf.path_indices as number[],
        // L2 path (company_root → global_root)
        pathL2: leaf.path_L2_elements as string[],
        indicesL2: leaf.path_L2_indices as number[],
        globalRoot: leaf.global_root as string,
        companyRoot: period?.merkle_root as string,
        periodOnChainId: period?.period_id as string,
        companyId: company?.admin_wallet_address as string,
        token: company?.token_contract_address as string,
      };
    });

    return NextResponse.json({ paths: result });
  } catch (err) {
    console.error("Error fetching merkle path:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
