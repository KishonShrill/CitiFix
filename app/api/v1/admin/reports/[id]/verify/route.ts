import { getDB } from "@/lib/db";
import { report, category, problemType } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";

// POST /api/v1/admin/reports/[id]/verify

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireRole(request, ["moderator", "admin"]);
    const { id } = await params;
    const db = getDB();
    const [foundReport] = await db
        .select()
        .from(report)
        .where(eq(report.id, id))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    const validFromStatuses = ["submitted", "under_review"];
    if (!validFromStatuses.includes(foundReport.status)) {
        return sendError(400, "INVALID_STATUS", `Report must be in 'submitted' or 'under_review' status to verify`);
    }

    const now = new Date();
    await db
        .update(report)
        .set({ status: "verified", publishedAt: now, updatedAt: now })
        .where(eq(report.id, id));

    const [fullReport] = await db
        .select({
            id: report.id,
            title: report.title,
            description: report.description,
            url: report.media,
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
            barangay: report.barangay,
            severity: report.severity,
            status: report.status,
            createdAt: report.createdAt,
            publishedAt: report.publishedAt,
            category: {
                id: category.id,
                name: category.name,
                color: category.color,
            },
            problemType: {
                id: problemType.id,
                name: problemType.name,
                icon: problemType.icon,
            },
        })
        .from(report)
        .innerJoin(category, eq(report.categoryId, category.id))
        .innerJoin(problemType, eq(report.problemTypeId, problemType.id))
        .where(eq(report.id, id))
        .limit(1);

    await createAuditLog(
        user.id,
        "verify_report",
        "report",
        id,
        { previousStatus: foundReport.status, newStatus: "verified" }
    );

    return sendSuccess(fullReport || foundReport);
}
