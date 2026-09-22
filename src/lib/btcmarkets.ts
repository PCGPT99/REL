import { createHmac } from "crypto";

const BASE = "https://api.btcmarkets.net";

export type DepositAddress = {
  assetName: string;
  address: string;
  tag?: string;
};

function credentials(): { apiKey: string; privateKey: string } | null {
  const apiKey = process.env.BTCMARKETS_API_KEY?.trim();
  const privateKey = process.env.BTCMARKETS_PRIVATE_KEY?.trim();
  if (!apiKey || !privateKey) return null;
  return { apiKey, privateKey };
}

function sign(
  privateKeyB64: string,
  method: string,
  path: string,
  timestamp: string,
  body: string,
): string {
  const message = `${method}${path}${timestamp}${body}`;
  const key = Buffer.from(privateKeyB64, "base64");
  return createHmac("sha512", key).update(message).digest("base64");
}

export async function btcMarketsRequest(
  method: "GET" | "POST" | "DELETE",
  pathWithQuery: string,
  bodyObj?: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const creds = credentials();
  if (!creds) {
    return { ok: false, status: 503, data: { error: "btcmarkets_not_configured" } };
  }

  const pathOnly = pathWithQuery.split("?")[0]!;
  const body = bodyObj !== undefined ? JSON.stringify(bodyObj) : "";
  const timestamp = String(Date.now());
  const signature = sign(creds.privateKey, method, pathOnly, timestamp, body);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "BM-AUTH-APIKEY": creds.apiKey,
    "BM-AUTH-TIMESTAMP": timestamp,
    "BM-AUTH-SIGNATURE": signature,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${pathWithQuery}`, {
    method,
    headers,
    body: body || undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* keep text */
  }
  return { ok: res.ok, status: res.status, data };
}

export function isBtcMarketsConfigured(): boolean {
  return credentials() !== null;
}

/** Optional static overrides so the temple can serve alms without a live API round-trip. */
function staticAddresses(): DepositAddress[] {
  const raw = process.env.BTCMARKETS_DONATION_ADDRESSES?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DepositAddress[];
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a?.assetName && a?.address);
      }
    } catch {
      /* fall through */
    }
  }
  const out: DepositAddress[] = [];
  for (const asset of ["BTC", "ETH", "USDT", "XRP", "SOL"]) {
    const addr = process.env[`BTCMARKETS_DONATION_${asset}`]?.trim();
    const tag = process.env[`BTCMARKETS_DONATION_${asset}_TAG`]?.trim();
    if (addr) {
      out.push(tag ? { assetName: asset, address: addr, tag } : { assetName: asset, address: addr });
    }
  }
  return out;
}

const DEFAULT_ASSETS = ["BTC", "ETH", "USDT", "XRP"];

export async function getDonationAddresses(
  assets: string[] = DEFAULT_ASSETS,
): Promise<{
  addresses: DepositAddress[];
  source: "static" | "api" | "mixed" | "none";
  errors?: string[];
}> {
  const staticOnes = staticAddresses();
  const byAsset = new Map(staticOnes.map((a) => [a.assetName.toUpperCase(), a]));
  const errors: string[] = [];

  if (isBtcMarketsConfigured()) {
    for (const asset of assets) {
      const key = asset.toUpperCase();
      if (byAsset.has(key)) continue;
      const path = `/v3/addresses?assetName=${encodeURIComponent(key)}`;
      const res = await btcMarketsRequest("GET", path);
      if (!res.ok) {
        errors.push(`${key}:${res.status}`);
        continue;
      }
      const d = res.data as {
        address?: string;
        assetName?: string;
        tag?: string;
        destinationTag?: string;
      };
      if (d?.address) {
        let address = d.address;
        let tag = d.tag || d.destinationTag;
        // XRP sometimes returns address?dt=TAG
        const dt = address.match(/[?&]dt=([^&]+)/i);
        if (dt) {
          tag = tag || decodeURIComponent(dt[1]!);
          address = address.split("?")[0]!;
        }
        const entry: DepositAddress = {
          assetName: d.assetName || key,
          address,
        };
        if (tag) entry.tag = tag;
        byAsset.set(key, entry);
      }
    }
  }

  const addresses = [...byAsset.values()];
  let source: "static" | "api" | "mixed" | "none" = "none";
  if (addresses.length && staticOnes.length && isBtcMarketsConfigured()) source = "mixed";
  else if (staticOnes.length && addresses.length === staticOnes.length) source = "static";
  else if (addresses.length) source = "api";
  else source = "none";

  return {
    addresses,
    source,
    ...(errors.length ? { errors } : {}),
  };
}
