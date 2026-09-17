import { db } from "@/lib/db";
import { report, category, problemType } from "@/lib/report-schema";
import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError, sendPaginated, parsePagination } from "@/app/api/_lib/http";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: Request) {
    const user = await requireUser(request);
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 20, 100);

    // Get total count
    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(report)
        .where(eq(report.userId, user.id));

    const total = Number(totalResult.count) ?? 0;

    // Get paginated reports with joined data
    const reportsList = await db
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
        .where(eq(report.userId, user.id))
        .orderBy(desc(report.createdAt))
        .limit(limit)
        .offset(offset);

    return sendPaginated(reportsList, total, limit, offset);
}