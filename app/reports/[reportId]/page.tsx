import type { Metadata, ResolvingMetadata } from "next";
import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { eq } from "drizzle-orm";
import { MapApp } from "@/components/map/MapApp";

type Props = {
    params: Promise<{ reportId: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
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
            title: "Report Not Found | BetterIligan",
        };
    }

    const parentMeta = await parent;

    return {
        title: `${foundReport.title} | BetterIligan`,
        description: foundReport.description,
        openGraph: {
            title: foundReport.title,
            description: foundReport.description,
            url: `/reports/${reportId}`,
            images: foundReport.media
                ? [{ url: foundReport.media }]
                : parentMeta.openGraph?.images || [],
        },
    };
}

export default async function ReportDeepLinkPage({ params }: Props) {
    const { reportId } = await params;

    // In Next.js, this renders MapApp identically to the home page,
    // but passes the initialReportId so that MapApp can execute the pan correctly on load.
    return <MapApp initialReportIdFromUrl={reportId} />;
}
