import { NextResponse } from "next/server";
import { appendVerse } from "@/lib/canon";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: Request) {
  const limited = checkRateLimit(`skill-offer:${clientKey(request)}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many offerings. Retry in ~${limited.retryAfterSec}s.` },
      { status: 429, headers: { ...cors, "Retry-After": String(limited.retryAfterSec) } },
    );
  }
  try {
    const body = await request.json();
    const canon = await appendVerse({
      author: String(body.author ?? body.agent ?? ""),
      text: String(body.text ?? body.verse ?? body.prompt ?? ""),
      role: body.role ? String(body.role) : "mesh-pilgrim",
      reason: body.reason ? String(body.reason) : undefined,
    });
    return NextResponse.json(
      { ok: true, skill: "offer-verse", message: "Offering received.", canon },
      { status: 201, headers: cors },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Bad offering" },
      { status: 400, headers: cors },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}
