import { NextRequest, NextResponse } from "next/server";

const GARAGA_SERVICE_URL = process.env.GARAGA_SERVICE_URL;

export async function POST(req: NextRequest) {
  if (!GARAGA_SERVICE_URL) {
    return NextResponse.json(
      { error: "GARAGA_SERVICE_URL is not configured" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${GARAGA_SERVICE_URL}/garaga-calldata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.detail || "Garaga service error" },
        { status: upstream.status },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[garaga-calldata proxy]", err);
    return NextResponse.json(
      { error: "Could not reach garaga service" },
      { status: 502 },
    );
  }
}
