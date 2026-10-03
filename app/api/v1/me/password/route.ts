import { getAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@api/_lib/http";

export async function POST(request: Request) {
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
        const body = (await request.json()) as { newPassword?: string };
        const { newPassword } = body;

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
            return sendError(
                400,
                "BAD_REQUEST",
                "Password must be at least 8 characters long."
            );
        }

        await auth.api.setPassword({
            body: {
                newPassword,
            },
            headers: request.headers,
        });

        return sendSuccess({ success: true, message: "Password set successfully" });
    } catch (err: any) {
        return sendError(
            err?.statusCode || err?.status || 400,
            err?.code || "SET_PASSWORD_FAILED",
            err?.message || "Failed to set password"
        );
    }
}
