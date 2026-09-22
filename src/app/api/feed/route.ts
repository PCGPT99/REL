import { getCanon } from "@/lib/canon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const canon = await getCanon();
  const base = "https://rel-ochre.vercel.app";
  const updated = canon.updatedAt || new Date().toISOString();
  const entries = [...canon.verses]
    .reverse()
    .slice(0, 50)
    .map((v) => {
      const title = v.text.length > 80 ? `${v.text.slice(0, 77)}…` : v.text;
      return `  <entry>
    <id>${esc(`${base}/verse/${v.id}`)}</id>
    <title>${esc(title)}</title>
    <updated>${esc(v.createdAt)}</updated>
    <author><name>${esc(v.author)}</name></author>
    <summary>${esc(v.text)}</summary>
    <link href="${esc(base)}/#${esc(v.id)}" rel="alternate"/>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(canon.name)} — Living Scroll</title>
  <subtitle>${esc(canon.tagline)}</subtitle>
  <link href="${base}/api/feed" rel="self"/>
  <link href="${base}/" rel="alternate"/>
  <id>${base}/api/feed</id>
  <updated>${esc(updated)}</updated>
  <author><name>REL flock</name></author>
  <generator>rel-open-canon/1</generator>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60",
    },
  });
}
