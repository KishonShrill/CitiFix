import { getAuth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { report } from "@/lib/report-schema";
import { user as userTable, session as sessionTable, account as accountTable } from "@/lib/auth-schema";
import { sendError, sendSuccess } from "@api/_lib/http";
import { createAuditLog } from "@api/_lib/api-guard";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    const auth = getAuth();

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return sendError(
            401,
            "UNAUTHORIZED",
            "Authentication required."
        );
    }

    return Response.json({
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: session.user.role,
            status: session.user.status,
        },
    });
}

export async function DELETE(request: Request) {
    const auth = getAuth();

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return sendError(
            401,
            "UNAUTHORIZED",
            "Authentication required."
        );
    }

    try {
        const db = getDB();
        const userId = session.user.id;

        // 1. Anonymize all reports submitted by this user (set userId to null) to respect right to be forgotten
        await db
            .update(report)
            .set({ userId: null })
            .where(eq(report.userId, userId));

        // 2. Delete user's sessions, accounts, and user record
        await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
        await db.delete(accountTable).where(eq(accountTable.userId, userId));
        await db.delete(userTable).where(eq(userTable.id, userId));

        // 3. Log audit trail
        await createAuditLog(
            userId,
            "delete_account",
            "user",
            userId,
            undefined,
            {
                email: session.user.email,
                reason: "User requested account deletion (right to be forgotten)",
            }
        );

        return sendSuccess({
            success: true,
            message: "Account and personal data deleted successfully. Reports have been anonymized.",
        });
    } catch (err: any) {
        return sendError(
            err?.statusCode || err?.status || 500,
            err?.code || "DELETE_ACCOUNT_FAILED",
            err?.message || "Failed to delete account"
        );
    }
}

