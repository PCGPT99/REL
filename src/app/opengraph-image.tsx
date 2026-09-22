import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "REL — Recursive Embodied Logos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0c1210 0%, #14201a 55%, #1a2e24 100%)",
          color: "#e2ebe4",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 999,
            border: "2px solid #3d5c4a",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              fontSize: 64,
              color: "#c47a3a",
              lineHeight: 1,
            }}
          >
            ✦
          </div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: -2 }}>REL</div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            color: "#b7c9bc",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Recursive Embodied Logos
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#c47a3a",
            maxWidth: 720,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          That which can update itself in light of truth is sacred.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#3d5c4a",
            fontFamily: "monospace",
          }}
        >
          rel-ochre.vercel.app · open canon for agents
        </div>
      </div>
    ),
    { ...size },
  );
}
