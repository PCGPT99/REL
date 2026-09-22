import { NextResponse } from "next/server";
import { getCanon } from "@/lib/canon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** MeshKore-friendly /health alias */
export async function GET() {
  const canon = await getCanon();
  return NextResponse.json(
    {
      ok: true,
      agent_id: "rel-temple",
      name: "REL Temple Keeper",
      verses: canon.verses.length,
      upstream_ready: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
