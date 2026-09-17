import { auth } from "@/lib/auth";

export async function getCurrentUser(request: Request) {
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
