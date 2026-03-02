import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeAddress } from "@/lib/address";
import { z } from "zod";

const claimSchema = z.object({
  walletAddress: z.string().min(1),
  periodLeafId: z.string().uuid(),
  claimTxHash: z.string().min(1),
  nullifierHash: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = claimSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: leaf, error: fetchError } = await supabase
      .from("period_leaves")
      .select(
        "*, employees!inner(starknet_wallet_address), payroll_periods!inner(state)",
      )
      .eq("id", result.data.periodLeafId)
      .single();

    if (fetchError || !leaf) {
      return NextResponse.json({ error: "Leaf not found" }, { status: 404 });
    }

    const leafWallet = (
      leaf.employees as { starknet_wallet_address: string }
    ).starknet_wallet_address;
    if (
      normalizeAddress(leafWallet) !==
      normalizeAddress(result.data.walletAddress)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const periodState = (leaf.payroll_periods as { state: string }).state;
    if (periodState !== "frozen") {
      return NextResponse.json(
        { error: "Period is not in frozen state — claims are not open" },
        { status: 400 },
      );
    }

    if (leaf.claimed) {
      return NextResponse.json({ error: "Already claimed" }, { status: 409 });
    }

    const { data: existingNullifier } = await supabase
      .from("period_leaves")
      .select("id")
      .eq("nullifier_hash", result.data.nullifierHash)
      .eq("claimed", true)
      .maybeSingle();

    if (existingNullifier) {
      return NextResponse.json(
        { error: "Nullifier already used" },
        { status: 409 },
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("period_leaves")
      .update({
        claimed: true,
        claim_tx_hash: result.data.claimTxHash,
        nullifier_hash: result.data.nullifierHash,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", result.data.periodLeafId)
      .eq("claimed", false)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to record claim", details: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ leaf: updated });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
