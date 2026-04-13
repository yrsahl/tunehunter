import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = { runtime: "edge" };

export default function handler(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1150 0%, #2d1b69 50%, #1a2060 100%)",
          fontFamily: "sans-serif",
          gap: "24px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
          <span style={{ fontSize: "96px", fontWeight: 700, color: "#ffffff", letterSpacing: "4px" }}>
            Tune
          </span>
          <span style={{ fontSize: "96px", fontWeight: 700, color: "#e779c1", letterSpacing: "4px" }}>
            Hunter
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.75)",
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Buy tracks faster. Search every major music store at once.
        </div>

        {/* Store pills */}
        <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
          {["Beatport", "Bandcamp", "iTunes", "Amazon"].map((store) => (
            <div
              key={store}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              {store}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{ position: "absolute", bottom: "32px", color: "rgba(255,255,255,0.35)", fontSize: "20px" }}>
          tunehunter.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
