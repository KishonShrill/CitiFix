import { getAuth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// Call getAuth per request to avoid connection sharing in Cloudflare Workers
export const POST = async (req: Request) => {
    try {
        const auth = getAuth();
        const handler = toNextJsHandler(auth);
        return handler.POST(req);
    } catch (error) {
        console.error("Auth POST error:", error);
        return new Response(
            JSON.stringify({
                error: "Authentication failed",
                details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

export const GET = async (req: Request) => {
    try {
        const auth = getAuth();
        const handler = toNextJsHandler(auth);
        return handler.GET(req);
    } catch (error) {
        console.error("Auth GET error:", error);
        return new Response(
            JSON.stringify({
                error: "Authentication failed",
                details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
