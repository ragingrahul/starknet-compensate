import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { normalizeAddress } from "@/lib/address";

export async function GET(
  req: NextRequest,
  { params }: { params: { periodId: string } },
) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    const employeeWallet = req.nextUrl.searchParams.get("employeeWallet");

    const supabase = createServiceClient();

    // Admin view: list all leaves for a period
    if (wallet) {
      const company = await getCompanyByWallet(wallet);
      if (!company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify period belongs to this company
      const { data: period } = await supabase
        .from("payroll_periods")
        .select("id")
        .eq("id", params.periodId)
        .eq("company_id", company.id)
        .single();

      if (!period) {
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 },
        );
      }

      const { data: leaves, error } = await supabase
        .from("period_leaves")
        .select("*, employees(name, starknet_wallet_address)")
        .eq("period_id", params.periodId)
        .order("leaf_index", { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch leaves", details: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ leaves });
    }

    // Employee view: fetch only their leaf (for claim generation)
    if (employeeWallet) {
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("starknet_wallet_address", normalizeAddress(employeeWallet))
        .single();

      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 },
        );
      }

      const { data: leaf, error } = await supabase
        .from("period_leaves")
        .select("*")
        .eq("period_id", params.periodId)
        .eq("employee_id", employee.id)
        .single();

      if (error || !leaf) {
        return NextResponse.json(
          { error: "Leaf not found for this period" },
          { status: 404 },
        );
      }

      // Also fetch the period root (needed for proof generation)
      const { data: period } = await supabase
        .from("payroll_periods")
        .select("merkle_root, period_id, state")
        .eq("id", params.periodId)
        .single();

      return NextResponse.json({ leaf, period });
    }

    return NextResponse.json(
      { error: "Either wallet or employeeWallet query param required" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
