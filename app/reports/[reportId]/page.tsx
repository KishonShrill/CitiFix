import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { eq } from "drizzle-orm";
import { MapApp } from "@/components/map/MapApp";

type Props = {
  params: Promise<{ reportId: string }>;
};

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { reportId } = await params;
  const db = getDB();

  const [foundReport] = await db
    .select({
      title: report.title,
      description: report.description,
      media: report.media,
    })
    .from(report)
    .where(eq(report.id, reportId))
    .limit(1);

  if (!foundReport) {
    return {
      title: "Report Not Found",
    };
  }

  const ogImageUrl = `https://citifix.betteriligancity.org/api/og/reports/${reportId}`;

  return {
    title: `${foundReport.title}`,
    description: foundReport.description,
    openGraph: {
      url: `https://citifix.betteriligancity.org/reports/${reportId}`,
      siteName: "CitiFIX BetterIligan",
      locale: "en_PH",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: foundReport.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: foundReport.title,
      description: foundReport.description,
      images: [`https://citifix.betteriligancity.org/reports/${reportId}/opengraph-image`],
    },
  };
}

export default async function ReportDeepLinkPage({ params }: Props) {
  const { reportId } = await params;

  // In Next.js, this renders MapApp identically to the home page,
  // but passes the initialReportId so that MapApp can execute the pan correctly on load.
  return <MapApp initialReportIdFromUrl={reportId} />;
}
