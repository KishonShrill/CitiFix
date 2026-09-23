import { getDB } from "@/lib/db";
import { report, category, problemType } from "@/lib/report-schema";
import { requireRole } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError, sendPaginated, parsePagination } from "@/app/api/_lib/http";
import { sql, eq, desc, asc } from "drizzle-orm";


export async function GET(request: Request) {
    const db = getDB();
    // Require moderator or admin
    await requireRole(request, ["moderator", "admin"]);

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 30, 100);

    // Parse filters for moderation queue
    const status = url.searchParams.get("status") ?? "submitted"; // Default to submitted

    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(report)
        .where(eq(report.status, status));

    const total = Number(totalResult.count) ?? 0;

    // Get paginated reports
    const reportsList = await db
        .select({
            id: report.id,
            userId: report.userId,
            title: report.title,
            description: report.description,
            url: report.media,
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address,
            barangay: report.barangay,
            severity: report.severity,
            status: report.status,
            submittedAt: report.createdAt,
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
        .where(eq(report.status, status))
        .orderBy(asc(report.createdAt))
        .limit(limit)
        .offset(offset);

    return sendPaginated(reportsList, total, limit, offset);
}
