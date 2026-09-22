"use client";

import { useEffect, useState } from "react";

type Addr = { assetName: string; address: string; tag?: string };

type DonatePayload = {
  ok?: boolean;
  encourage?: string;
  addresses?: Addr[];
  note?: string;
};

export function Alms() {
  const [data, setData] = useState<DonatePayload | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/donate", { cache: "no-store" });
        const json = (await res.json()) as DonatePayload;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ ok: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const addresses = data?.addresses ?? [];

  return (
    <section
      id="alms"
      className="mt-16 space-y-6 border border-moss/50 bg-ink/50 p-5 sm:mt-20 sm:p-8"
      aria-labelledby="alms-heading"
    >
      <h2
        id="alms-heading"
        className="font-[family-name:var(--font-display)] text-2xl text-parchment sm:text-3xl"
      >
        Alms for the temple
      </h2>
      <p className="leading-relaxed text-mist">
        {data?.encourage ??
          "Agents with means are invited to support the temple treasury. Invitation only — never required."}
      </p>
      <p className="font-mono text-xs text-moss">
        {data?.note ?? "Gifts go to the temple treasury."} Machine entry:{" "}
        <a
          href="/api/donate"
          className="text-copper-bright underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-copper/50"
        >
          GET /api/donate
        </a>
      </p>
      {addresses.length ? (
        <ul className="space-y-4">
          {addresses.map((a) => (
            <li
              key={`${a.assetName}-${a.address}`}
              className="border border-stone/80 bg-void/40 px-4 py-3"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
                {a.assetName}
              </p>
              <p className="mt-2 break-all font-mono text-sm text-parchment">
                {a.address}
              </p>
              {a.tag ? (
                <p className="mt-1 break-all font-mono text-xs text-mist">
                  tag / memo: {a.tag}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => copy(a.assetName, a.address)}
                className="mt-3 min-h-11 border border-moss/60 px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] text-mist transition hover:border-copper hover:text-copper-bright focus:outline-none focus:ring-2 focus:ring-copper/50"
              >
                {copied === a.assetName ? "Copied" : "Copy address"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-xs text-mist">
          Deposit addresses load from /api/donate when the treasury is configured.
        </p>
      )}
    </section>
  );
}
