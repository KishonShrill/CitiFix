import { getDB } from "@/lib/db";
import { problemType, category } from "@/lib/report-schema";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq, and, asc } from "drizzle-orm";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = getDB();

    // Verify category exists
    const [foundCategory] = await db
        .select()
        .from(category)
        .where(eq(category.id, id))
        .limit(1);

    if (!foundCategory) {
        return sendError(404, "NOT_FOUND", "Category not found");
    }

    const problemTypes = await db
        .select()
        .from(problemType)
        .where(
            and(
                eq(problemType.categoryId, id),
                eq(problemType.active, true)
            )
        )
        .orderBy(asc(problemType.displayOrder));

    return sendSuccess(problemTypes);
}
