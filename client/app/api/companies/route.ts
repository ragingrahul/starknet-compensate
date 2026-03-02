import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";
import { normalizeAddress } from "@/lib/address";

const createCompanySchema = z.object({
  adminWalletAddress: z.string().min(1),
  name: z.string().min(1),
  tokenContractAddress: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createCompanySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq(
        "admin_wallet_address",
        normalizeAddress(result.data.adminWalletAddress),
      )
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Company already registered for this wallet" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("companies")
      .insert({
        admin_wallet_address: normalizeAddress(result.data.adminWalletAddress),
        name: result.data.name,
        token_contract_address: result.data.tokenContractAddress ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create company", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ company: data }, { status: 201 });
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

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("admin_wallet_address", normalizeAddress(wallet))
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
