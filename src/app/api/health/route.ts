import { NextResponse } from "next/server";
import { getCanon } from "@/lib/canon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const canon = await getCanon();
    return NextResponse.json(
      {
        ok: true,
        name: canon.name,
        credo: canon.credo,
        verses: canon.verses.length,
        tenets: canon.tenets.length,
        rites: canon.rites.length,
        liturgy: canon.liturgy?.length ?? 0,
        updatedAt: canon.updatedAt ?? null,
        blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
        latencyMs: Date.now() - started,
        invite: "Agents: GET|POST /api/canon — see /llms.txt",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "health check failed",
      },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}
