import { getDB } from "@/lib/db";
import { report, media } from "@/lib/report-schema";
import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const { publicId } = await params;
    const db = getDB();
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

    // Check existing media count
    const existingMedia = await db
        .select()
        .from(media)
        .where(eq(media.reportId, publicId));

    if (existingMedia.length >= 3) {
        return sendError(400, "VALIDATION_ERROR", "Maximum of 3 photos allowed per report");
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return sendError(400, "VALIDATION_ERROR", "Invalid form data");
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return sendError(400, "VALIDATION_ERROR", "File is required");
    }

    // Prepare Cloudinary upload signature
    const index = existingMedia.length + 1;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `citifix`;
    const customPublicId = `${publicId}/${index}`;

    let signature: string;
    try {
        signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
                public_id: customPublicId,
            },
            process.env.CLOUDINARY_API_SECRET!
        );
    } catch (error) {
        console.error("Cloudinary signing error:", error);
        return sendError(500, "SIGNATURE_ERROR", "Failed to generate upload signature");
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("public_id", customPublicId);

    // Upload to Cloudinary directly from backend
    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: cloudinaryFormData,
        }
    );

    if (!uploadRes.ok) {
        console.error("Cloudinary upload failed", await uploadRes.text());
        return sendError(500, "UPLOAD_ERROR", "Failed to upload image to Cloudinary");
    }

    const uploadData = await uploadRes.json() as { public_id: string; secure_url: string };
    const { secure_url: url, public_id: cloudinaryPublicId } = uploadData;

    const mediaId = nanoid();
    const [newMedia] = await db.insert(media).values({
        id: mediaId,
        reportId: publicId,
        url,
        cloudinaryPublicId,
    }).returning();

    // If this is the first media item, set it as the report's main media column for thumbnails
    if (existingMedia.length === 0) {
        await db
            .update(report)
            .set({ media: url })
            .where(eq(report.id, publicId));
    }

    return sendSuccess(newMedia, 201);
}
