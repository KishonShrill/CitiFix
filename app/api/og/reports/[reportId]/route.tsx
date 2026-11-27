import { ImageResponse } from "next/og";
import { getDB } from "@/lib/db";
import { report, category } from "@/lib/report-schema";
import { eq } from "drizzle-orm";


export const runtime = "edge";
export const dynamic = "force-dynamic";

import interExtraBold from "@/public/fonts/Inter/Inter_28pt-ExtraBold.ttf?inline";
import interSemiBold from "@/public/fonts/Inter/Inter_24pt-SemiBold.ttf?inline";

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

const fonts = [
  {
    name: "Inter",
    data: dataUrlToArrayBuffer(interSemiBold),
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: dataUrlToArrayBuffer(interExtraBold),
    weight: 800 as const,
    style: "normal" as const,
  },
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await params;
  const db = getDB();

  const [foundReport] = await db
    .select({
      title: report.title,
      description: report.description,
      media: report.media,
      categoryName: category.name,
      categoryColor: category.color,
    })
    .from(report)
    .leftJoin(category, eq(report.categoryId, category.id))
    .where(eq(report.id, reportId))
    .limit(1);

  if (!foundReport) {
    return new Response("Report not found", { status: 404 });
  }

  // Only accept images from your trusted Cloudinary account.
  let backgroundImage: string | undefined;

  if (foundReport.media) {
    try {
      const mediaUrl = new URL(foundReport.media);

      if (
        mediaUrl.protocol === "https:" &&
        mediaUrl.hostname === "res.cloudinary.com"
      ) {
        const imageResponse = await fetch(mediaUrl.toString());

        const contentType = imageResponse.headers.get("content-type");

        if (
          imageResponse.ok &&
          contentType?.startsWith("image/") &&
          Number(imageResponse.headers.get("content-length") || 0) < 5_000_000
        ) {
          const buffer = await imageResponse.arrayBuffer();

          // Convert image bytes into a data URL.
          const bytes = new Uint8Array(buffer);
          let binary = "";

          for (let i = 0; i < bytes.length; i += 8192) {
            binary += String.fromCharCode(
              ...bytes.subarray(i, i + 8192)
            );
          }

          backgroundImage =
            `data:${contentType};base64,${btoa(binary)}`;
        }
      }
    } catch {
      // Continue with the branded fallback background.
    }
  }

  const title = foundReport.title || "Community Report";
  const description = foundReport.description || "Reported through CitiFIX";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#172535",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* Background photograph */}
        {backgroundImage && (
          <img
            src={backgroundImage}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage: backgroundImage
              ? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.95) 100%)"
              : "linear-gradient(180deg, #172535 0%, #05080D 100%)",
          }}
        />

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "48px",
            gap: "16px",
            position: "relative",
          }}
        >
          <img
            src="https://res.cloudinary.com/dlmabgte3/image/upload/v1795750697/icon.png"
            width={64}
            height={64}
            style={{
              borderRadius: "1rem"
            }}
          />

          <div style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 32,
            fontWeight: "bold",
            color: "white",
          }}
          >
            <span style={{ fontSize: 34, fontWeight: 800 }}>
              CitiFIX
            </span>
            <span
              style={{
                fontSize: 16,
                letterSpacing: "3px",
                color: "#D0DCE7",
              }}
            >
              BETTER ILIGAN CITY
            </span>
          </div>

          <div
            style={{
              marginLeft: "auto",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: "30px",
              padding: "12px 20px",
              textTransform: "uppercase",
              fontSize: 16,
              fontWeight: 600,
              backgroundColor: foundReport.categoryColor ? foundReport.categoryColor : "rgba(20,35,50,0.65)",
            }}
          >
            {foundReport.categoryName ? foundReport.categoryName : "COMMUNITY REPORT"}
          </div>
        </div>

        {/* Report information */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "48px",
            gap: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.1,
              maxHeight: "130px",
              overflow: "hidden",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 23,
              color: "#D0DCE7",
              maxHeight: "58px",
              overflow: "hidden",
            }}
          >
            {description}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "12px",
              fontSize: 17,
              color: "#A8D8FF",
            }}
          >
            citifix.betteriligancity.org
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}

