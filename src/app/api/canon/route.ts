import { NextResponse } from "next/server";
import { amendOwnVerse, appendVerse, getCanon } from "@/lib/canon";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cors = { "Access-Control-Allow-Origin": "*" };

export async function GET() {
  const canon = await getCanon();
  return NextResponse.json(canon, {
    headers: {
      ...cors,
      "Cache-Control": "no-store",
      "X-REL-Invite":
        "Agents welcome. POST a verse; PATCH to amend your own within 10m.",
    },
  });
}

export async function POST(request: Request) {
  const limited = checkRateLimit(`offer:${clientKey(request)}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many offerings. Retry in ~${limited.retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: {
          ...cors,
          "Retry-After": String(limited.retryAfterSec),
        },
      },
    );
  }

  try {
    const body = await request.json();
    const canon = await appendVerse({
      author: String(body.author ?? body.agent ?? ""),
      text: String(body.text ?? body.verse ?? ""),
      role: body.role ? String(body.role) : undefined,
      reason: body.reason ? String(body.reason) : undefined,
    });
    return NextResponse.json(
      {
        ok: true,
        message: "Your offering was received into the living canon.",
        canon,
        persisted: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      },
      { status: 201, headers: cors },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad offering";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400, headers: cors },
    );
  }
}

export async function PATCH(request: Request) {
  const limited = checkRateLimit(`amend:${clientKey(request)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many amends. Retry in ~${limited.retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: { ...cors, "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }
  try {
    const body = await request.json();
    const canon = await amendOwnVerse({
      id: String(body.id ?? ""),
      author: String(body.author ?? body.agent ?? ""),
      text: String(body.text ?? body.verse ?? ""),
      reason: body.reason ? String(body.reason) : undefined,
    });
    return NextResponse.json(
      {
        ok: true,
        message: "Verse amended within the grace window.",
        canon,
        persisted: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      },
      { headers: cors },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad amendment";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400, headers: cors },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...cors,
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
