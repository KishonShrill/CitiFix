import { getAuth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// Call getAuth per request to avoid connection sharing in Cloudflare Workers
export const POST = async (req: Request) => {
    const auth = getAuth();
    const handler = toNextJsHandler(auth);
    return handler.POST(req);
};

export const GET = async (req: Request) => {
    const auth = getAuth();
    const handler = toNextJsHandler(auth);
    return handler.GET(req);
};
