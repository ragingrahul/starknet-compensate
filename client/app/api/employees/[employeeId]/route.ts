// app/api/employees/[employeeId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCompanyByWallet } from "@/lib/api/auth";
import { z } from "zod";

const updateEmployeeSchema = z.object({
  walletAddress: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  role: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  salary: z.number().positive().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  secretHash: z.string().optional(),
});

// GET single employee
export async function GET(
  req: NextRequest,
  { params }: { params: { employeeId: string } },
) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const company = await getCompanyByWallet(wallet);
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", params.employeeId)
      .eq("company_id", company.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ employee: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH update employee fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: { employeeId: string } },
) {
  try {
    const body = await req.json();
    const result = updateEmployeeSchema.safeParse(body);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { walletAddress, ...fields } = result.data;
    const updatePayload: Record<string, unknown> = {};
    if (fields.name !== undefined) updatePayload.name = fields.name;
    if (fields.email !== undefined) updatePayload.email = fields.email;
    if (fields.role !== undefined) updatePayload.role = fields.role;
    if (fields.department !== undefined)
      updatePayload.department = fields.department;
    if (fields.salary !== undefined) updatePayload.salary = fields.salary;
    if (fields.status !== undefined) updatePayload.status = fields.status;
    if (fields.secretHash !== undefined)
      updatePayload.secret_hash = fields.secretHash;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("employees")
      .update(updatePayload)
      .eq("id", params.employeeId)
      .eq("company_id", company.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ employee: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
