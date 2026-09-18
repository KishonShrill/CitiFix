import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";

// POST /api/v1/admin/reports/[id]/review

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireRole(request, ["moderator", "admin"]);
    const { id } = await params;

    const [foundReport] = await db
        .select()
        .from(report)
        .where(eq(report.id, id))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    if (foundReport.status !== "submitted") {
        return sendError(400, "INVALID_STATUS", "Report is not in 'submitted' status");
    }

    const [updated] = await db
        .update(report)
        .set({ status: "under_review", updatedAt: new Date() })
        .where(eq(report.id, id))
        .returning();

    await createAuditLog(
        user.id,
        "review_report",
        "report",
        id,
        { previousStatus: foundReport.status, newStatus: "under_review" }
    );

    return sendSuccess(updated);
}