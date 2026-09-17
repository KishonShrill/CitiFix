import { db } from "@/lib/db";
import { problemType } from "@/lib/report-schema";
import { sendSuccess } from "@/app/api/_lib/http";
import { eq, asc } from "drizzle-orm";

export async function GET() {
    const problemTypes = await db
        .select()
        .from(problemType)
        .where(eq(problemType.active, true))
        .orderBy(asc(problemType.displayOrder));

    return sendSuccess(problemTypes);
}
