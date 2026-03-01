import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeAddress } from "@/lib/address";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json(
        { error: "wallet query param required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Find the employee
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("starknet_wallet_address", normalizeAddress(wallet))
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // Get the company's admin wallet (= on-chain company_id) and token
    const { data: company } = await supabase
      .from("companies")
      .select("admin_wallet_address, token_contract_address")
      .eq("id", employee.company_id)
      .single();

    // Fetch all unclaimed leaves joined with their period info
    const { data: leaves, error: leafError } = await supabase
      .from("period_leaves")
      .select(
        "id, leaf_index, leaf_hash, amount, nonce, recipient_commitment, path_elements, path_indices, claimed, payroll_periods!inner(id, period_id, merkle_root, state, label)",
      )
      .eq("employee_id", employee.id)
      .eq("claimed", false)
      .eq("payroll_periods.state", "frozen");

    if (leafError) {
      return NextResponse.json(
        { error: "Failed to fetch leaves", details: leafError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      leaves: leaves ?? [],
      /**
       * The company admin's wallet address — this is the on-chain company_id
       * used in SharedPayroll.claim(company_id, ...).
       * The shared contract address itself comes from NEXT_PUBLIC_SHARED_PAYROLL_CONTRACT.
       */
      companyAdminWallet: company?.admin_wallet_address ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
