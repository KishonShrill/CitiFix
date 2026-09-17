import { db } from "@/lib/db";
import { category } from "@/lib/report-schema";
import { sendSuccess } from "@/app/api/_lib/http";
import { eq, asc } from "drizzle-orm";

export async function GET() {
    const categories = await db
        .select()
        .from(category)
        .where(eq(category.active, true))
        .orderBy(asc(category.displayOrder));

    return sendSuccess(categories);
}
