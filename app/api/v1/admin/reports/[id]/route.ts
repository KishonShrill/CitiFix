import { getDB } from "@/lib/db";
import { report, category, problemType, media } from "@/lib/report-schema";
import { requireRole } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Require moderator or admin
    await requireRole(request, ["moderator", "admin"]);

    const { id } = await params;

    // Get full report details with category and problem type
    const [foundReport] = await db
        .select({
            id: report.id,
            userId: report.userId,
            title: report.title,
            description: report.description,
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
            barangay: report.barangay,
            severity: report.severity,
            status: report.status,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            publishedAt: report.publishedAt,
            category: {
                id: category.id,
                name: category.name,
                color: category.color,
            },
            problemType: {
                id: problemType.id,
                name: problemType.name,
            },
        })
        .from(report)
        .innerJoin(category, eq(report.categoryId, category.id))
        .innerJoin(problemType, eq(report.problemTypeId, problemType.id))
        .where(eq(report.id, id))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    // Get media associated with report
    const reportMedia = await db
        .select()
        .from(media)
        .where(eq(media.reportId, id));

    return sendSuccess({
        ...foundReport,
        media: reportMedia,
    });
}
