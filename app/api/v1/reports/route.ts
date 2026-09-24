import { getDB } from "@/lib/db";
import { report, category, problemType, media } from "@/lib/report-schema";
import { sendSuccess, sendError, sendPaginated, parsePagination } from "@/app/api/_lib/http";
import { getCurrentUser, requireUser } from "@/app/api/_lib/api-guard";
import { nanoid } from "nanoid";
import { eq, and, desc, sql } from "drizzle-orm";


export async function GET(request: Request) {
    const db = getDB();
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 50, 100);

    // Parse filters
    const status = url.searchParams.get("status") ?? undefined;
    const categoryId = url.searchParams.get("category") ?? undefined;
    const problemTypeId = url.searchParams.get("problemType") ?? undefined;
    const severity = url.searchParams.get("severity") ?? undefined;
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

export async function POST(request: Request) {
    const db = getDB();
    const user = await requireUser(request);

    const body = await request.json();
    const { categoryId, problemTypeId, title, description, latitude, longitude, address, barangay, severity } = body;

    // Validate required fields
    if (!categoryId || !problemTypeId || !title || !description || latitude === undefined || longitude === undefined) {
        return sendError(400, "VALIDATION_ERROR", "Missing required fields");
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return sendError(400, "VALIDATION_ERROR", "Invalid coordinates");
    }

    // Validate severity
    const validSeverities = ["low", "medium", "high", "critical"];
    if (severity && !validSeverities.includes(severity)) {
        return sendError(400, "VALIDATION_ERROR", "Invalid severity");
    }

    // Create the report with nanoid public ID
    const publicId = nanoid(12);

    const [newReport] = await db.insert(report).values({
        id: publicId,
        userId: user.id,
        categoryId,
        problemTypeId,
        title,
        description,
        latitude,
        longitude,
        address: address ?? null,
        barangay: barangay ?? null,
        severity: severity ?? "medium",
        status: "submitted",
    }).returning();

    // Fetch the created report with joined data
    const [created] = await db
        .select({
            id: report.id,
            title: report.title,
            description: report.description,
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

    return sendSuccess({ ...created, publicId: publicId }, 201);
}
