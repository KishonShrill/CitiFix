import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
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
    const [updated] = await db
        .update(report)
        .set({ status: "verified", publishedAt: now, updatedAt: now })
        .where(eq(report.id, id))
        .returning();

    await createAuditLog(
        user.id,
        "verify_report",
        "report",
        id,
        { previousStatus: foundReport.status, newStatus: "verified" }
    );

    return sendSuccess(updated);
}