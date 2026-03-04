import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { z } from "zod";

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["funded"],
  funded: ["frozen", "closed"],
  frozen: ["closed"],
};

const updatePeriodSchema = z.object({
  walletAddress: z.string().min(1),
  newState: z.enum(["funded", "frozen", "closed"]),
  txHash: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { periodId: string } },
) {
  try {
    const body = await req.json();
    const result = updatePeriodSchema.safeParse(body);
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

    // Fetch current period
    const { data: period, error: fetchError } = await supabase
      .from("payroll_periods")
      .select("*")
      .eq("id", params.periodId)
      .eq("company_id", company.id)
      .single();

    if (fetchError || !period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    // Validate state transition
    const allowed = VALID_TRANSITIONS[period.state] ?? [];
    if (!allowed.includes(result.data.newState)) {
      return NextResponse.json(
        {
          error: `Cannot transition from '${period.state}' to '${result.data.newState}'`,
        },
        { status: 400 },
      );
    }

    // Map new state to the correct tx_hash column
    const txHashColumn: Record<string, string> = {
        funded: "fund_tx_hash",
        frozen: "freeze_tx_hash",
        closed: "close_tx_hash",
      };
  
      const timestampColumn: Record<string, string> = {
        funded: "funded_at",
        frozen: "frozen_at",
        closed: "closed_at",
      };
  
      const now = new Date().toISOString();
      const updatePayload: Record<string, string> = {
        state: result.data.newState,
        [txHashColumn[result.data.newState]]: result.data.txHash,
        [timestampColumn[result.data.newState]]: now,
      };

    // For draft→funded, we also store the commit tx if it's the first funding
    // (commit_tx_hash might be set separately in a first step)

    const { data: updated, error: updateError } = await supabase
      .from("payroll_periods")
      .update(updatePayload)
      .eq("id", params.periodId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update period", details: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ period: updated });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { periodId: string } },
) {
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
      .eq("id", params.periodId)
      .eq("company_id", company.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    return NextResponse.json({ period: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

const commitSchema = z.object({
  walletAddress: z.string().min(1),
  commitTxHash: z.string().min(1),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { periodId: string } },
) {
  try {
    const body = await req.json();
    const parsed = commitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { walletAddress, commitTxHash } = parsed.data;
    const company = await getCompanyByWallet(walletAddress);
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("payroll_periods")
      .update({
        commit_tx_hash: commitTxHash,
        committed_at: new Date().toISOString(),
      })
      .eq("id", params.periodId)
      .eq("company_id", company.id)
      .eq("state", "draft")
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Period not found or not in draft state" },
        { status: 404 },
      );
    }

    return NextResponse.json({ period: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
