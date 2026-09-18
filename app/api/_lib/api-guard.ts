import { getAuth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { auditLog } from "@/lib/report-schema";
import { nanoid } from "nanoid";


export async function getCurrentUser(request: Request) {
    const auth = getAuth();
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return null;
    }

    return session.user;
}

export async function requireUser(request: Request) {
    const user = await getCurrentUser(request);

    if (!user) {
        throw new Response(
            JSON.stringify({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required.",
                },
            }),
            {
                status: 401,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    return user;
}

export async function requireRole(
    request: Request,
    roles: Array<"user" | "moderator" | "admin">
) {
    const user = await requireUser(request);

    if (!roles.includes(user.role)) {
        throw new Response(
            JSON.stringify({
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                },
            }),
            {
                status: 403,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    return user;
}

/**
 * Write an immutable audit log entry for a moderation or system action.
 */
export async function createAuditLog(
    actor: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, unknown>,
    metadata?: Record<string, unknown>
) {
    const db = getDB();
    await db.insert(auditLog).values({
        id: nanoid(),
        actor,
        action,
        resourceType,
        resourceId,
        changes: changes ?? null,
        metadata: metadata ?? null,
    });
}
