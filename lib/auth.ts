import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "./db";
import * as schema from "./auth-schema";


export function getAuth() {
    // Create a fresh database connection for this request
    // This is necessary for Cloudflare Workers to avoid I/O context isolation errors
    const db = getDB();

    return betterAuth({
        database: drizzleAdapter(db, {
            provider: "pg",
            schema,
        }),
        emailAndPassword: {
            enabled: true,
        },
        baseURL: process.env.BETTER_AUTH_URL,
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
            github: {
                clientId: process.env.GITHUB_CLIENT_ID as string,
                clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            },
        },
        user: {
            additionalFields: {
                role: {
                    type: ["user", "moderator", "admin"],
                    required: false,
                    defaultValue: "user",
                    input: false,
                },
                status: {
                    type: "string",
                    required: false,
                    defaultValue: "online",
                },
            },
        },
        trustedOrigins: [
            "http://localhost:3000",
            "http://192.168.1.11:3000",
            "http://192.168.1.10:3000",
        ],
    })
};
