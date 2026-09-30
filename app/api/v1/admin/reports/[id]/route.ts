import { getDB } from "@/lib/db";
import { report, category, problemType, media } from "@/lib/report-schema";
import { requireRole, createAuditLog } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "@/lib/cloudinary";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Require moderator or admin
    await requireRole(request, ["moderator", "admin"]);

    const { id } = await params;
    const db = getDB();
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

// DELETE /api/v1/admin/reports/[id] - Permanently delete a report and its media (moderator or admin only)
export async function DELETE(
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

    // 1. Fetch all associated media for this report
    const reportMedia = await db
        .select()
        .from(media)
        .where(eq(media.reportId, id));

    // 2. Delete each image in Cloudinary
    for (const item of reportMedia) {
        if (item.cloudinaryPublicId) {
            try {
                await deleteCloudinaryImage(item.cloudinaryPublicId);
            } catch (error) {
                console.error(`Error deleting Cloudinary media ${item.cloudinaryPublicId}:`, error);
                return sendError(
                    502,
                    "MEDIA_DELETION_FAILED",
                    `Failed to delete image from storage: ${error instanceof Error ? error.message : "Service error"}. Report was not deleted.`
                );
            }
        }
    }

    // 3. Remove media records from database
    if (reportMedia.length > 0) {
        await db.delete(media).where(eq(media.reportId, id));
    }

    // 4. Delete the report itself
    await db.delete(report).where(eq(report.id, id));

    // 5. Create audit log entry
    await createAuditLog(
        user.id,
        "delete_report",
        "report",
        id,
        {
            title: foundReport.title,
            previousStatus: foundReport.status,
            categoryId: foundReport.categoryId,
        }
    );

    return sendSuccess({ message: "Report deleted successfully" });
}
