import { getDB } from "@/lib/db";
import { report, category, problemType } from "@/lib/report-schema";
import { requireUser } from "@/app/api/_lib/api-guard";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq, and } from "drizzle-orm";

// GET /api/v1/me/reports/[publicId] - Get one of the user's reports

export async function GET(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const user = await requireUser(request);
    const { publicId } = await params;
    const db = getDB();
    const [foundReport] = await db
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
            updatedAt: report.updatedAt,
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
        .where(and(eq(report.id, publicId), eq(report.userId, user.id)))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    return sendSuccess(foundReport);
}

// PATCH /api/v1/me/reports/[publicId] - Edit own report (only if submitted)

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const user = await requireUser(request);
    const { publicId } = await params;
    const db = getDB();
    // Find the report and verify ownership
    const [foundReport] = await db
        .select()
        .from(report)
        .where(and(eq(report.id, publicId), eq(report.userId, user.id)))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    if (foundReport.status !== "submitted") {
        return sendError(400, "NOT_EDITABLE", "Report can only be edited while in 'submitted' status");
    }

    const body = await request.json() as Record<string, unknown>;
    const allowedFields = ["title", "description", "latitude", "longitude", "address", "barangay", "severity"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return sendError(400, "VALIDATION_ERROR", "No valid fields to update");
    }

    // Validate coordinates if provided
    if (updates.latitude !== undefined || updates.longitude !== undefined) {
        const lat = Number(updates.latitude ?? foundReport.latitude);
        const lng = Number(updates.longitude ?? foundReport.longitude);
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return sendError(400, "VALIDATION_ERROR", "Invalid coordinates");
        }
    }

    const [updatedReport] = await db
        .update(report)
        .set(updates)
        .where(and(eq(report.id, publicId), eq(report.userId, user.id)))
        .returning();

    return sendSuccess(updatedReport);
}

// DELETE /api/v1/me/reports/[publicId] - Withdraw own report (only if submitted)

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ publicId: string }> }
) {
    const user = await requireUser(request);
    const { publicId } = await params;
    const db = getDB();
    const [foundReport] = await db
        .select()
        .from(report)
        .where(and(eq(report.id, publicId), eq(report.userId, user.id)))
        .limit(1);

    if (!foundReport) {
        return sendError(404, "NOT_FOUND", "Report not found");
    }

    if (foundReport.status !== "submitted") {
        return sendError(400, "NOT_DELETABLE", "Report can only be withdrawn while in 'submitted' status");
    }

    await db.delete(report).where(eq(report.id, publicId));

    return sendSuccess({ message: "Report withdrawn successfully" });
}
