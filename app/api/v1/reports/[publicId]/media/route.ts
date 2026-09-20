import { getDB } from "@/lib/db";
import { report, media } from "@/lib/report-schema";
import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { nanoid } from "nanoid";
import { eq, and, asc } from "drizzle-orm";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;
    const db = getDB();
    // Optional: Could verify report exists first, but a simple query to media works too
    const reportMedia = await db
        .select()
        .from(media)
        .where(eq(media.reportId, publicId))
        .orderBy(asc(media.displayOrder), asc(media.createdAt));

    return sendSuccess(reportMedia);
}


export async function POST(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const user = await requireUser(request);
    const { publicId } = await params;
    const db = getDB();
    // Verify report exists and belongs to user OR user is moderator/admin
    const [foundReport] = await db
        .select()
        .from(report)
        .where(eq(report.id, publicId))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    if (foundReport.userId !== user.id && user.role === "user") {
        return sendError(403, "FORBIDDEN", "You can only add media to your own reports");
    }

    const { url, cloudinaryPublicId } = await request.json();

    if (!url || !cloudinaryPublicId) {
        return sendError(400, "VALIDATION_ERROR", "url and cloudinaryPublicId are required");
    }

    const mediaId = nanoid();
    const [newMedia] = await db.insert(media).values({
        id: mediaId,
        reportId: publicId,
        url,
        cloudinaryPublicId,
    }).returning();

    return sendSuccess(newMedia, 201);
}
