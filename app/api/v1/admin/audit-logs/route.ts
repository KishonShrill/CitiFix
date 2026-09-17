import { db } from "@/lib/db";
import { auditLog } from "@/lib/report-schema";
import { requireRole } from "@/app/api/_lib/api-guard";
import { sendPaginated, parsePagination } from "@/app/api/_lib/http";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
    await requireRole(request, ["admin"]); // Usually only admin can view audit logs, maybe moderator too

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 50, 100);

    const actor = url.searchParams.get("actor");
    const action = url.searchParams.get("action");
    const resourceType = url.searchParams.get("resourceType");
    const resourceId = url.searchParams.get("resourceId");

    const conditions = [];

    if (actor) conditions.push(eq(auditLog.actor, actor));
    if (action) conditions.push(eq(auditLog.action, action));
    if (resourceType) conditions.push(eq(auditLog.resourceType, resourceType));
    if (resourceId) conditions.push(eq(auditLog.resourceId, resourceId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLog)
        .where(whereClause);

    const total = Number(totalResult.count) ?? 0;

    const logs = await db
        .select()
        .from(auditLog)
        .where(whereClause)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset);

    return sendPaginated(logs, total, limit, offset);
}
