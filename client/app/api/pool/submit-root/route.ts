/**
 * POST /api/pool/submit-root
 *
 * Called by the employer after depositing funds on-chain via deposit_funds().
 * Records the company's Merkle root in the pool_submitted_roots table so the
 * coordinator can batch it into the next global root update.
 *
 * Body:
 *   walletAddress     — company admin's wallet (authenticates the company)
 *   periodDbId        — UUID of the payroll_periods row
 *   depositTxHash     — on-chain deposit_funds transaction hash (optional)
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { z } from "zod";

const schema = z.object({
  walletAddress: z.string().min(1),
  periodDbId: z.string().uuid(),
  depositTxHash: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { walletAddress, periodDbId, depositTxHash } = parsed.data;

    const company = await getCompanyByWallet(walletAddress);
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Fetch the period and verify ownership
    const { data: period, error: periodErr } = await supabase
      .from("payroll_periods")
      .select("*")
      .eq("id", periodDbId)
      .eq("company_id", company.id)
      .single();

    if (periodErr || !period) {
      return NextResponse.json(
        { error: "Period not found or unauthorized" },
        { status: 404 },
      );
    }

    // Check if already submitted
    const { data: existing } = await supabase
      .from("pool_submitted_roots")
      .select("id")
      .eq("period_db_id", periodDbId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Root already submitted for this period" },
        { status: 409 },
      );
    }

    // Insert into pool_submitted_roots
    const { data: submitted, error: insertErr } = await supabase
      .from("pool_submitted_roots")
      .insert({
        company_id: company.id,
        period_db_id: periodDbId,
        period_on_chain_id: period.period_id,
        root: period.merkle_root,
        total_amount: period.total_gross,
        token_address: company.token_contract_address ?? "",
        deposit_tx_hash: depositTxHash ?? null,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json(
        { error: "Failed to submit root", details: insertErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ submitted }, { status: 201 });
  } catch (err) {
    console.error("Error submitting root:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
