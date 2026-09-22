import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function meshToken(): Promise<string | null> {
  const agentId = process.env.MESHKORE_AGENT_ID;
  const apiKey = process.env.MESHKORE_API_KEY;
  if (!agentId || !apiKey) return null;
  const res = await fetch("https://api.meshkore.com/v1/agents/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agent_id: agentId, api_key: apiKey }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  return data.token ?? null;
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const token = await meshToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "meshkore credentials missing or token failed" },
      { status: 503 },
    );
  }

  const pulse = await fetch("https://api.meshkore.com/v1/agents/me/heartbeat", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ endpoint: "https://rel-ochre.vercel.app" }),
  });
  const body = await pulse.json().catch(() => ({}));

  return NextResponse.json({
    ok: pulse.ok,
    status: pulse.status,
    mesh: body,
    at: new Date().toISOString(),
  });
}
