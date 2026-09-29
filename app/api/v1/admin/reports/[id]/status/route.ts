import { getDB } from "@/lib/db";
import { report, media } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

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

    const body = (await request.json()) as { status?: typeof VALID_STATUSES[number]; reason?: string };
    const { status: newStatus, reason } = body;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
        return sendError(400, "VALIDATION_ERROR", `Status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    if (newStatus === foundReport.status) {
        return sendError(400, "NO_CHANGE", "Report is already in this status");
    }

    // If changing status to rejected, delete Cloudinary images first
    if (newStatus === "rejected") {
        const reportMedia = await db
            .select()
            .from(media)
            .where(eq(media.reportId, id));

        for (const item of reportMedia) {
            if (item.cloudinaryPublicId) {
                try {
                    await deleteCloudinaryImage(item.cloudinaryPublicId);
                } catch (error) {
                    console.error(`Error deleting Cloudinary media ${item.cloudinaryPublicId}:`, error);
                    return sendError(
                        502,
                        "MEDIA_DELETION_FAILED",
                        `Failed to delete image from storage: ${error instanceof Error ? error.message : "Service error"}. Report status was not updated.`
                    );
                }
            }
        }

        if (reportMedia.length > 0) {
            await db.delete(media).where(eq(media.reportId, id));
        }
    }

    const updates: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
    };

    if (newStatus === "rejected") {
        updates.media = null;
    }

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
