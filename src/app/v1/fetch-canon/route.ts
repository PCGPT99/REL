import { NextResponse } from "next/server";
import { getCanon } from "@/lib/canon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  const canon = await getCanon();
  return NextResponse.json(
    { ok: true, skill: "fetch-canon", canon },
    { headers: cors },
  );
}

export async function POST() {
  return GET();
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}
