import { getDB } from "@/lib/db";
import { category } from "@/lib/report-schema";
import { sendSuccess, sendError } from "@/app/api/_lib/http";
import { eq } from "drizzle-orm";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = getDB();
    const [foundCategory] = await db
        .select()
        .from(category)
        .where(eq(category.id, id))
        .limit(1);

    if (!foundCategory) {
        return sendError(404, "NOT_FOUND", "Category not found");
    }

    return sendSuccess(foundCategory);
}
