import { db } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";

// POST /api/v1/admin/reports/[id]/reject
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

    const body = await request.json();
    const reason = body?.reason;

    if (!reason) {
        return sendError(400, "VALIDATION_ERROR", "Rejection reason is required");
    }

    const [updated] = await db
        .update(report)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(report.id, id))
        .returning();

    await createAuditLog(
        user.id,
        "reject_report",
        "report",
        id,
        { previousStatus: foundReport.status, newStatus: "rejected", reason }
    );

    return sendSuccess(updated);
}