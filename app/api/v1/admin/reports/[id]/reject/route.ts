import { getDB } from "@/lib/db";
import { report, media } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

// POST /api/v1/admin/reports/[id]/reject

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

    const body = (await request.json()) as { reason?: string };
    const reason = body?.reason;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
        return sendError(400, "VALIDATION_ERROR", "Rejection reason is required");
    }

    // 1. Fetch all associated media for this report
    const reportMedia = await db
        .select()
        .from(media)
        .where(eq(media.reportId, id));

    // 2. Delete each image in Cloudinary FIRST before changing status.
    // If an error occurs (e.g. connection cut off, service failure), skip changing status and abort.
    // If Cloudinary reports the image is "not found", it's safely treated as deleted.
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

    // 3. Remove media records from database now that Cloudinary deletion is complete (or not found)
    if (reportMedia.length > 0) {
        await db.delete(media).where(eq(media.reportId, id));
    }

    // 4. Update the report status to rejected and clear primary media URL
    const [updated] = await db
        .update(report)
        .set({
            status: "rejected",
            media: null,
            updatedAt: new Date(),
        })
        .where(eq(report.id, id))
        .returning();

    // 5. Create audit log entry
    await createAuditLog(
        user.id,
        "reject_report",
        "report",
        id,
        { previousStatus: foundReport.status, newStatus: "rejected", reason: reason.trim() }
    );

    return sendSuccess(updated);
}
