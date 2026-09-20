import { getDB } from "@/lib/db";
import { report, category, problemType, media } from "@/lib/report-schema";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq, asc } from "drizzle-orm";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;
    const db = getDB();
    const [foundReport] = await db
        .select({
            id: report.id,
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
        .where(eq(report.id, publicId))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    // Only show verified reports to the public
    if (foundReport.status !== "verified") {
        // Check if user is the owner (will be handled in the /me routes)
        // For public route, return 404 for non-verified reports
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    return sendSuccess(foundReport);
}
