import { auth } from "@/lib/auth";
import { sendError } from "@api/_lib/http";

export async function GET(request: Request) {
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
