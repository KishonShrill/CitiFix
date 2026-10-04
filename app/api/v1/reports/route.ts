import { getDB } from "@/lib/db";
import { report, category, problemType, media } from "@/lib/report-schema";
import { sendSuccess, sendError, sendPaginated, parsePagination } from "@/app/api/_lib/http";
import { requireUser } from "@/app/api/_lib/api-guard";
import { nanoid } from "nanoid";
import { eq, and, desc, sql } from "drizzle-orm";
import { uploadImageToCloudinary, deleteCloudinaryImage, type UploadedImage } from "@/lib/cloudinary";
import { sendDiscordReportNotification } from "@/lib/discord";

export async function GET(request: Request) {
    const db = getDB();
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 50, 1000);

    // Parse filters
    const status = (url.searchParams.get("status") as any) ?? undefined;
    const categoryId = url.searchParams.get("category") ?? undefined;
    const problemTypeId = url.searchParams.get("problemType") ?? undefined;
    const severity = (url.searchParams.get("severity") as any) ?? undefined;
    const barangay = url.searchParams.get("barangay") ?? undefined;

    // Build where conditions - only show published/verified reports
    const conditions = [
        eq(report.status, "verified"), // Only show verified reports publicly
    ];

    if (status) {
        conditions.push(eq(report.status, status));
    }
    if (categoryId) {
        conditions.push(eq(report.categoryId, categoryId));
    }
    if (problemTypeId) {
        conditions.push(eq(report.problemTypeId, problemTypeId));
    }
    if (severity) {
        conditions.push(eq(report.severity, severity));
    }
    if (barangay) {
        conditions.push(eq(report.barangay, barangay));
    }

    // Bounding box filter
    const minLat = url.searchParams.get("minLat");
    const maxLat = url.searchParams.get("maxLat");
    const minLng = url.searchParams.get("minLng");
    const maxLng = url.searchParams.get("maxLng");

    if (minLat && maxLat && minLng && maxLng) {
        const s = parseFloat(minLat);
        const n = parseFloat(maxLat);
        const w = parseFloat(minLng);
        const e = parseFloat(maxLng);

        if (!isNaN(w) && !isNaN(s) && !isNaN(e) && !isNaN(n)) {
            conditions.push(
                sql`${report.longitude} BETWEEN ${w} AND ${e} AND ${report.latitude} BETWEEN ${s} AND ${n}`
            );
        }
    }

    // Get total count
    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(report)
        .where(and(...conditions));

    const total = Number(totalResult.count) ?? 0;

    // Get paginated reports with joined category and problem type
    const reportsList = await db
        .select({
            id: report.id,
            title: report.title,
            description: report.description,
            url: report.media,
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
            barangay: report.barangay,
            severity: report.severity,
            status: report.status,
            createdAt: report.createdAt,
            publishedAt: report.publishedAt,
            category: {
                id: category.id,
                name: category.name,
                color: category.color,
            },
            problemType: {
                id: problemType.id,
                name: problemType.name,
                icon: problemType.icon,
            },
        })
        .from(report)
        .innerJoin(category, eq(report.categoryId, category.id))
        .innerJoin(problemType, eq(report.problemTypeId, problemType.id))
        .where(and(...conditions))
        .orderBy(desc(report.publishedAt ?? report.createdAt))
        .limit(limit)
        .offset(offset);

    return sendPaginated(reportsList, total, limit, offset);
}

// POST /api/v1/reports - Create a new report (authenticated)
// Uploads images first to Cloudinary; only inserts into database if all uploads succeed.
export async function POST(request: Request) {
    const db = getDB();
    const user = await requireUser(request);

    const contentType = request.headers.get("content-type") || "";
    let categoryId = "";
    let problemTypeId = "";
    let title = "";
    let description = "";
    let latitude: number | undefined;
    let longitude: number | undefined;
    let address: string | undefined;
    let barangay: string | undefined;
    let severity: "low" | "medium" | "high" | "critical" = "medium";
    let files: File[] = [];

    if (contentType.includes("multipart/form-data")) {
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch {
            return sendError(400, "VALIDATION_ERROR", "Invalid form data");
        }

        categoryId = (formData.get("categoryId") as string) || "";
        problemTypeId = (formData.get("problemTypeId") as string) || "";
        title = (formData.get("title") as string) || "";
        description = (formData.get("description") as string) || "";
        const latStr = formData.get("latitude") as string;
        const lngStr = formData.get("longitude") as string;
        if (latStr) latitude = parseFloat(latStr);
        if (lngStr) longitude = parseFloat(lngStr);
        address = (formData.get("address") as string) || undefined;
        barangay = (formData.get("barangay") as string) || undefined;
        const sev = formData.get("severity") as string;
        if (sev) severity = sev as any;

        // Extract files
        const allFiles = formData.getAll("files") as File[];
        const singleFile = formData.get("file") as File | null;
        if (allFiles && allFiles.length > 0) {
            files = allFiles.filter((f) => f && f.size > 0);
        } else if (singleFile && singleFile.size > 0) {
            files = [singleFile];
        }
    } else {
        let body: any;
        try {
            body = await request.json();
        } catch {
            return sendError(400, "VALIDATION_ERROR", "Invalid JSON payload");
        }
        categoryId = body.categoryId || "";
        problemTypeId = body.problemTypeId || "";
        title = body.title || "";
        description = body.description || "";
        latitude = body.latitude;
        longitude = body.longitude;
        address = body.address;
        barangay = body.barangay;
        if (body.severity) severity = body.severity;
    }

    // Validate required fields
    if (!categoryId || !problemTypeId || !title.trim() || !description.trim() || latitude === undefined || longitude === undefined) {
        return sendError(400, "VALIDATION_ERROR", "Missing required fields (category, problem type, title, description, coordinates)");
    }

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return sendError(400, "VALIDATION_ERROR", "Invalid coordinates");
    }

    // Validate severity
    const validSeverities = ["low", "medium", "high", "critical"];
    if (severity && !validSeverities.includes(severity)) {
        return sendError(400, "VALIDATION_ERROR", "Invalid severity level");
    }

    // Validate files (at least 1 image is required, max 3)
    if (files.length > 3) {
        return sendError(400, "VALIDATION_ERROR", "Maximum 3 photos allowed per report");
    }

    const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB per photo
    for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_PHOTO_SIZE) {
            return sendError(400, "VALIDATION_ERROR", `Photo ${i + 1} exceeds the 5MB size limit`);
        }
    }

    // Generate unique public ID for the report
    const publicId = nanoid(12);

    // 1. STEP 1: UPLOAD IMAGES TO CLOUDINARY FIRST (IF ANY FILES ATTACHED)
    const uploadedMedia: UploadedImage[] = [];

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const uploaded = await uploadImageToCloudinary(file, publicId, i + 1);
                uploadedMedia.push(uploaded);
            } catch (error) {
                console.error(`Failed to upload image ${i + 1} to Cloudinary:`, error);

                // ROLLBACK: Delete any images already uploaded to Cloudinary
                for (const item of uploadedMedia) {
                    try {
                        await deleteCloudinaryImage(item.cloudinaryPublicId);
                    } catch (cleanupErr) {
                        console.error(`Failed to delete Cloudinary image during rollback (${item.cloudinaryPublicId}):`, cleanupErr);
                    }
                }

                // Return error response without touching the database
                return sendError(
                    502,
                    "MEDIA_UPLOAD_FAILED",
                    `Failed to upload image ${i + 1} to cloud storage: ${error instanceof Error ? error.message : "Upload error"}. Report was not created.`
                );
            }
        }
    }

    // 2. STEP 2: POST DATA TO SUPABASE / POSTGRESQL (ONLY AFTER IMAGES HAVE SUCCESSFULLY UPLOADED)
    try {
        const primaryMediaUrl = uploadedMedia.length > 0 ? uploadedMedia[0].url : null;

        await db.insert(report).values({
            id: publicId,
            userId: user.id,
            categoryId,
            problemTypeId,
            title: title.trim(),
            description: description.trim(),
            media: primaryMediaUrl,
            latitude,
            longitude,
            address: address ?? null,
            barangay: barangay ?? null,
            severity,
            status: "submitted",
        });

        // Insert media records for all uploaded files
        if (uploadedMedia.length > 0) {
            for (let i = 0; i < uploadedMedia.length; i++) {
                const item = uploadedMedia[i];
                await db.insert(media).values({
                    id: nanoid(),
                    reportId: publicId,
                    url: item.url,
                    cloudinaryPublicId: item.cloudinaryPublicId,
                    displayOrder: i,
                });
            }
        }

        // Fetch created report with joined category and problem type
        const [created] = await db
            .select({
                id: report.id,
                title: report.title,
                description: report.description,
                url: report.media,
                latitude: report.latitude,
                longitude: report.longitude,
                address: report.address,
                barangay: report.barangay,
                severity: report.severity,
                status: report.status,
                createdAt: report.createdAt,
                category: {
                    id: category.id,
                    name: category.name,
                    color: category.color,
                },
                problemType: {
                    id: problemType.id,
                    name: problemType.name,
                    icon: problemType.icon,
                },
            })
            .from(report)
            .innerJoin(category, eq(report.categoryId, category.id))
            .innerJoin(problemType, eq(report.problemTypeId, problemType.id))
            .where(eq(report.id, publicId))
            .limit(1);

        if (created) {
            await sendDiscordReportNotification({
                event: "submitted",
                report: {
                    id: created.id,
                    title: created.title,
                    description: created.description,
                    address: created.address,
                    barangay: created.barangay,
                    severity: created.severity,
                    createdAt: created.createdAt,
                },
                category: created.category,
                problemType: created.problemType,
                reporter: {
                    name: user.name,
                    email: user.email,
                },
                mediaUrl: created.url,
            });
        }

        return sendSuccess(created, 201);
    } catch (dbError) {
        console.error("Database error creating report:", dbError);

        // Clean up Cloudinary images if database insertion fails
        for (const item of uploadedMedia) {
            try {
                await deleteCloudinaryImage(item.cloudinaryPublicId);
            } catch (cleanupErr) {
                console.error("Failed to clean up Cloudinary image after DB failure:", cleanupErr);
            }
        }

        return sendError(
            500,
            "DATABASE_ERROR",
            `Failed to save report to database: ${dbError instanceof Error ? dbError.message : "Database error"}`
        );
    }
}
