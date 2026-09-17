import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    // Only authenticated users can upload media
    await requireUser(request);
    const { publicId } = await params;

    // We don't check if report exists here to save a DB query since it's just a signature
    // The actual report existence will be checked when saving the media record

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `cityfix/reports/${publicId}`;

    try {
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
            },
            process.env.CLOUDINARY_API_SECRET!
        );

        return sendSuccess({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder,
        });
    } catch (error) {
        console.error("Cloudinary signing error:", error);
        return sendError(500, "SIGNATURE_ERROR", "Failed to generate upload signature");
    }
}
