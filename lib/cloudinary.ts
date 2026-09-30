import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

/**
 * Returns configured Cloudinary instance using server and public environment variables.
 */
export function getCloudinary() {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        isConfigured = true;
    }
    return cloudinary;
}

export interface CloudinaryDeleteResult {
    success: boolean;
    notFound: boolean;
}

/**
 * Deletes an image from Cloudinary by its publicId.
 *
 * - Returns `{ success: true, notFound: false }` when deleted successfully.
 * - Returns `{ success: true, notFound: true }` when Cloudinary indicates the image does not exist ("not found" or 404).
 * - Throws an Error for operational/network failures (e.g. network cutoff, timeout, invalid auth, 5xx server error).
 */
export async function deleteCloudinaryImage(publicId: string): Promise<CloudinaryDeleteResult> {
    const cld = getCloudinary();

    try {
        const response = await cld.uploader.destroy(publicId);

        if (response.result === "ok") {
            return { success: true, notFound: false };
        }

        if (response.result === "not found") {
            return { success: true, notFound: true };
        }

        // Any other non-ok result (e.g., 'error', 'server_error') is treated as an operational failure
        throw new Error(
            response.error?.message || `Cloudinary deletion failed with result: ${response.result}`
        );
    } catch (error: any) {
        // If an exception was thrown, inspect if it indicates resource was already not found
        const errorMessage = typeof error?.message === "string" ? error.message.toLowerCase() : "";
        const httpCode = error?.http_code;

        if (httpCode === 404 || errorMessage.includes("not found")) {
            return { success: true, notFound: true };
        }

        // Re-throw actual errors (network cuts, timeouts, permission issues)
        throw error;
    }
}

export interface UploadedImage {
    url: string;
    cloudinaryPublicId: string;
}

/**
 * Signs and uploads a file/blob to Cloudinary.
 * Returns the secure URL and Cloudinary public ID.
 */
export async function uploadImageToCloudinary(
    file: File | Blob,
    publicId: string,
    index: number
): Promise<UploadedImage> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "citifix";
    const customPublicId = `${publicId}/${index}`;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
        throw new Error("Missing Cloudinary configuration environment variables");
    }

    let signature: string;
    try {
        signature = getCloudinary().utils.api_sign_request(
            {
                timestamp,
                folder,
                public_id: customPublicId,
            },
            apiSecret
        );
    } catch (error) {
        console.error("Cloudinary signing error:", error);
        throw new Error("Failed to generate Cloudinary upload signature");
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("public_id", customPublicId);

    const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: cloudinaryFormData,
        }
    );

    if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => "");
        console.error("Cloudinary upload failed:", errorText);
        throw new Error(`Failed to upload image to Cloudinary: ${uploadRes.statusText}`);
    }

    const uploadData = (await uploadRes.json()) as { public_id: string; secure_url: string };
    return {
        url: uploadData.secure_url,
        cloudinaryPublicId: uploadData.public_id,
    };
}
