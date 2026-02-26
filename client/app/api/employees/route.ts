import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { employeeSchema } from "@/types/types";
import { normalizeAddress } from "@/lib/address";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, ...employeeData } = body;

    const company = await getCompanyByWallet(walletAddress);
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = employeeSchema.safeParse(employeeData);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid employee data", details: result.error.format() },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("employees")
      .insert({
        company_id: company.id,
        name: result.data.name,
        email: result.data.email ?? null,
        starknet_wallet_address: normalizeAddress(
          result.data.starknetWalletAddress,
        ),
        role: result.data.role ?? null,
        department: result.data.department ?? null,
        salary: result.data.salary,
        secret_hash: result.data.secretHash,
        leaf_nonce_counter: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to add employee", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ employee: data }, { status: 201 });
  } catch {
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
      .from("employees")
      .select("*")
      .eq("company_id", company.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch employees", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ employees: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
