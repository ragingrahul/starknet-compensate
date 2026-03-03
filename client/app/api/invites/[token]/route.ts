import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const supabase = createServiceClient();

    const { data: invite, error } = await supabase
      .from("employee_invites")
      .select("*, employees(name, starknet_wallet_address), companies(name)")
      .eq("invite_token", params.token)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    }

    if (invite.accepted_at) {
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 410 },
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    return NextResponse.json({
      encryptedSecret: invite.encrypted_secret,
      salt: invite.salt,
      employeeName: (invite.employees as Record<string, string>)?.name ?? null,
      employeeWallet:
        (invite.employees as Record<string, string>)?.starknet_wallet_address ??
        null,
      companyName: (invite.companies as Record<string, string>)?.name ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("employee_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("invite_token", params.token)
      .is("accepted_at", null)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invite not found or already accepted" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
