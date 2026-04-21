import { ImageResponse } from "next/og";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "ForestHouse Crew Call — May 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RAINBOW =
  "linear-gradient(90deg, #e63946, #f4845f, #f7b731, #7bc67e, #2ec4b6, #48cae4)";

export default async function OpengraphImage() {
  const logoBuffer = await fs.readFile(
    path.join(process.cwd(), "public/forest-house/logo.png"),
  );
  const logoData = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        <div style={{ height: 8, width: "100%", background: RAINBOW }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 72px",
          }}
        >
          {/* Top row: logo + label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginBottom: 40,
            }}
          >
            <img src={logoData} width={120} height={95} alt="" />
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 7,
                color: "#999999",
                textTransform: "uppercase",
              }}
            >
              [ Crew Call · May 2026 ]
            </div>
          </div>

          {/* Wordmark — stacked for impact */}
          <div
            style={{
              fontSize: 148,
              fontWeight: 900,
              letterSpacing: -6,
              lineHeight: 0.9,
              textTransform: "uppercase",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Forest</span>
            <span>House</span>
          </div>

          {/* Description */}
          <div
            style={{
              marginTop: 32,
              fontSize: 24,
              fontWeight: 400,
              color: "#999999",
              display: "flex",
            }}
          >
            Cinco de Mayo 5/5 &nbsp; · &nbsp; EDC Parade 5/14 &nbsp; · &nbsp;
            EDC Festival 5/15–17
          </div>
        </div>

        <div style={{ height: 8, width: "100%", background: RAINBOW }} />
      </div>
    ),
    { ...size },
  );
}
