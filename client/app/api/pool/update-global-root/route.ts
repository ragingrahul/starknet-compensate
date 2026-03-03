/**
 * POST /api/pool/update-global-root
 *
 * Coordinator endpoint.  Aggregates all pending company roots into a global
 * L2 Merkle tree (BN254 Poseidon, depth 8) and returns the new global root.
 *
 * The coordinator must then call update_global_root(globalRoot) on the
 * ShieldedPool contract and pass the transaction hash to the confirm sub-route.
 *
 * After calling this endpoint the DB is updated with:
 *   - pool_global_roots  row (with member_roots JSON)
 *   - pool_submitted_roots.pool_global_root_id and l2_leaf_index
 *   - period_leaves.path_L2_elements, path_L2_indices, global_root
 *
 * Body:
 *   coordinatorSecret — a shared secret to authenticate the coordinator
 *                       (use COORDINATOR_SECRET env var in production)
 *   onChainTxHash     — optional, tx hash of a previously submitted on-chain call
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const DEPTH_L2 = 8;
const L2_TREE_SIZE = 2 ** DEPTH_L2; // 256

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Simple shared-secret auth for the coordinator
    const coordinatorSecret = body.coordinatorSecret as string | undefined;
    if (coordinatorSecret !== process.env.COORDINATOR_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onChainTxHash = body.onChainTxHash as string | undefined;

    const supabase = createServiceClient();

    // Fetch all submitted roots not yet batched into a global root
    const { data: pending, error: pendingErr } = await supabase
      .from("pool_submitted_roots")
      .select(
        "id, company_id, period_db_id, period_on_chain_id, root, total_amount, token_address, companies(admin_wallet_address)",
      )
      .is("pool_global_root_id", null)
      .order("created_at", { ascending: true })
      .limit(L2_TREE_SIZE);

    if (pendingErr) {
      return NextResponse.json(
        { error: "Failed to fetch pending roots", details: pendingErr.message },
        { status: 500 },
      );
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json(
        { message: "No pending roots to batch" },
        { status: 200 },
      );
    }

    // -----------------------------------------------------------------------
    // Build L2 Merkle tree (BN254 Poseidon, depth 8)
    // -----------------------------------------------------------------------
    const poseidonLite = await import("poseidon-lite");
    const { poseidon2 } = poseidonLite;

    // L2 leaves = company roots as BigInts
    const l2Leaves = pending.map((r) => BigInt(r.root));
    const paddedL2Leaves = [...l2Leaves];
    while (paddedL2Leaves.length < L2_TREE_SIZE) {
      paddedL2Leaves.push(0n);
    }

    // Build the tree
    const l2Layers: bigint[][] = [paddedL2Leaves];
    for (let d = 0; d < DEPTH_L2; d++) {
      const prev = l2Layers[d];
      const next: bigint[] = [];
      for (let i = 0; i < prev.length; i += 2) {
        next.push(poseidon2([prev[i], prev[i + 1]]));
      }
      l2Layers.push(next);
    }
    const globalRoot = l2Layers[DEPTH_L2][0];
    const globalRootHex = "0x" + globalRoot.toString(16);

    // Extract L2 path for each company root
    function getL2Path(leafIndex: number): {
      pathElements: string[];
      pathIndices: number[];
    } {
      let idx = leafIndex;
      const pathElements: string[] = [];
      const pathIndices: number[] = [];
      for (let d = 0; d < DEPTH_L2; d++) {
        const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
        pathElements.push("0x" + l2Layers[d][siblingIdx].toString(16));
        pathIndices.push(idx % 2);
        idx = Math.floor(idx / 2);
      }
      return { pathElements, pathIndices };
    }

    // -----------------------------------------------------------------------
    // Persist global root record
    // -----------------------------------------------------------------------
    const memberRoots = pending.map((r, idx) => ({
      submitted_root_id: r.id,
      company_id: r.company_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      company_wallet: (r.companies as any)?.admin_wallet_address ?? "",
      period_db_id: r.period_db_id,
      period_on_chain_id: r.period_on_chain_id,
      root: r.root,
      l2_index: idx,
    }));

    const { data: globalRootRow, error: grErr } = await supabase
      .from("pool_global_roots")
      .insert({
        root: globalRootHex,
        member_roots: memberRoots,
        on_chain_tx: onChainTxHash ?? null,
      })
      .select()
      .single();

    if (grErr) {
      // If root already exists (coordinator retrying), fetch it
      if (grErr.code === "23505") {
        const { data: existing } = await supabase
          .from("pool_global_roots")
          .select("*")
          .eq("root", globalRootHex)
          .single();
        return NextResponse.json({
          globalRoot: globalRootHex,
          count: pending.length,
          alreadyExists: true,
          id: existing?.id,
        });
      }
      return NextResponse.json(
        { error: "Failed to save global root", details: grErr.message },
        { status: 500 },
      );
    }

    // -----------------------------------------------------------------------
    // Update pool_submitted_roots with their L2 positions
    // -----------------------------------------------------------------------
    for (let i = 0; i < pending.length; i++) {
      await supabase
        .from("pool_submitted_roots")
        .update({
          pool_global_root_id: globalRootRow.id,
          l2_leaf_index: i,
        })
        .eq("id", pending[i].id);
    }

    // -----------------------------------------------------------------------
    // Update period_leaves with L2 path data for each period
    // -----------------------------------------------------------------------
    for (let i = 0; i < pending.length; i++) {
      const { pathElements, pathIndices } = getL2Path(i);

      await supabase
        .from("period_leaves")
        .update({
          path_L2_elements: pathElements,
          path_L2_indices: pathIndices,
          global_root: globalRootHex,
        })
        .eq("period_id", pending[i].period_db_id);

      // Mark the period as frozen (available for claims)
      await supabase
        .from("payroll_periods")
        .update({
          state: "frozen",
          freeze_tx_hash: onChainTxHash ?? null,
          frozen_at: new Date().toISOString(),
        })
        .eq("id", pending[i].period_db_id);
    }

    return NextResponse.json({
      globalRoot: globalRootHex,
      count: pending.length,
      globalRootId: globalRootRow.id,
      memberRoots,
    });
  } catch (err) {
    console.error("Error updating global root:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/pool/update-global-root
 * Confirm the on-chain tx hash after a global root was submitted on-chain.
 * Body: { globalRootId, onChainTxHash, coordinatorSecret }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.coordinatorSecret !== process.env.COORDINATOR_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("pool_global_roots")
      .update({ on_chain_tx: body.onChainTxHash })
      .eq("id", body.globalRootId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error confirming global root tx:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
