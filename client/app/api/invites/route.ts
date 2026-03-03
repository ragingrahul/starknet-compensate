import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { z } from "zod";

const createInviteSchema = z.object({
  walletAddress: z.string().min(1),
  employeeId: z.string().uuid(),
  encryptedSecret: z.string().min(1),
  inviteToken: z.string().min(1),
  salt: z.string().min(1),
  expiresInHours: z.number().positive().default(48),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createInviteSchema.safeParse(body);
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

    // Verify employee belongs to this company
    const supabase = createServiceClient();
    const { data: employee } = await supabase
      .from("employees")
      .select("id")
      .eq("id", result.data.employeeId)
      .eq("company_id", company.id)
      .single();

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    const expiresAt = new Date(
      Date.now() + result.data.expiresInHours * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("employee_invites")
      .insert({
        employee_id: result.data.employeeId,
        company_id: company.id,
        invite_token: result.data.inviteToken,
        encrypted_secret: result.data.encryptedSecret,
        salt: result.data.salt,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create invite", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        invite: data,
        inviteUrl: `/claim/invite/${result.data.inviteToken}`,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
