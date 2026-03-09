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
      .select("id, name, email")
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const fullInviteUrl = `${appUrl}/onboard/${result.data.inviteToken}`;
    console.log(fullInviteUrl);
    console.log(employee.email);
    console.log(company.name);
    console.log(employee.name);
    if (employee.email) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Compensate <onboarding@swapthesurge.com>",
        to: employee.email,
        subject: `You've been added to ${company.name}'s payroll on Compensate`,
        html: `
          <p>Hi ${employee.name},</p>
          <p><strong>${company.name}</strong> has added you to their payroll system.</p>
          <p>Click the link below to set up your account and start claiming your salary:</p>
          <p><a href="${fullInviteUrl}">${fullInviteUrl}</a></p>
          <p>This link expires in 48 hours.</p>
          <p>— The Compensate Team</p>
        `,
      });
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
