import { getAuth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

const auth = getAuth();
export const { POST, GET } = toNextJsHandler(auth);
