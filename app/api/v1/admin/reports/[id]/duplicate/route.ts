import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";

// POST /api/v1/admin/reports/[id]/duplicate

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
    const duplicateOfId = body?.duplicateOfId;

    // Optionally validate that the original report exists
    if (duplicateOfId) {
        const [original] = await db
            .select({ id: report.id })
            .from(report)
            .where(eq(report.id, duplicateOfId))
            .limit(1);

        if (!original) {
            return sendError(400, "VALIDATION_ERROR", "Original report not found");
        }
    }

    const [updated] = await db
        .update(report)
        .set({ status: "duplicate", updatedAt: new Date() })
        .where(eq(report.id, id))
        .returning();

    await createAuditLog(
        user.id,
        "mark_duplicate",
        "report",
        id,
        {
            previousStatus: foundReport.status,
            newStatus: "duplicate",
            duplicateOfId: duplicateOfId ?? null,
        }
    );

    return sendSuccess(updated);
}