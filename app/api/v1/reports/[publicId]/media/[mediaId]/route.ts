import { getDB } from "@/lib/db";
import { report, media } from "@/lib/report-schema";
import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ publicId: string, mediaId: string }> }
) {
    const user = await requireUser(request);
    const { publicId, mediaId } = await params;
    const db = getDB();
    // First find the report to check ownership
    const [foundReport] = await db
        .select()
        .from(report)
        .where(eq(report.id, publicId))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    if (foundReport.userId !== user.id && user.role === "user") {
        return sendError(403, "FORBIDDEN", "You can only remove media from your own reports");
    }

    // Find the media record to get cloudinaryId
    const [foundMedia] = await db
        .select()
        .from(media)
        .where(eq(media.id, mediaId))
        .limit(1);

    if (!foundMedia) {
        return sendError(404, "NOT_FOUND", "Media not found");
    }

    // Attempt to delete from cloudinary silently
    try {
        await cloudinary.uploader.destroy(foundMedia.cloudinaryPublicId);
    } catch (e) {
        console.error("Cloudinary destroy failed:", e);
        // Continue and delete from db anyway
    }

    // Delete from db
    await db.delete(media).where(eq(media.id, mediaId));

    return sendSuccess({ success: true, message: "Media deleted" });
}
