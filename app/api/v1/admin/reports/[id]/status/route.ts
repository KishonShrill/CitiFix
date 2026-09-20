import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";

const VALID_STATUSES = ["submitted", "under_review", "verified", "rejected", "duplicate", "resolved", "hidden"] as const;

// POST /api/v1/admin/reports/[id]/status

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

    const body = await request.json();
    const { status: newStatus, reason } = body;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
        return sendError(400, "VALIDATION_ERROR", `Status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    if (newStatus === foundReport.status) {
        return sendError(400, "NO_CHANGE", "Report is already in this status");
    }

    const updates: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
    };

    // Set publishedAt when verifying
    if (newStatus === "verified" && !foundReport.publishedAt) {
        updates.publishedAt = new Date();
    }

    const [updated] = await db
        .update(report)
        .set(updates)
        .where(eq(report.id, id))
        .returning();

    await createAuditLog(
        user.id,
        "update_status",
        "report",
        id,
        {
            previousStatus: foundReport.status,
            newStatus,
            reason: reason ?? null,
        }
    );

    return sendSuccess(updated);
}
