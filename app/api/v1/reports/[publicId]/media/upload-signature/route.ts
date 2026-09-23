import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    // Only authenticated users can upload media
    await requireUser(request);
    const { publicId } = await params;

    const body = (await request.json().catch(() => ({}))) as { index?: number };
    const index = body.index || 1;
    const customPublicId = `${publicId}/${index}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `citifix`;

    try {
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
                public_id: customPublicId,
            },
            process.env.CLOUDINARY_API_SECRET!
        );

        return sendSuccess({
            signature,
            timestamp,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            folder,
            publicId: customPublicId,
        });
    } catch (error) {
        console.error("Cloudinary signing error:", error);
        return sendError(500, "SIGNATURE_ERROR", "Failed to generate upload signature");
    }
}
