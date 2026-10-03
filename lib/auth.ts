import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "./db";
import * as schema from "./auth-schema";
import { isAllowedEmailDomain, ALLOWED_EMAIL_ERROR_MESSAGE } from "./email-validator";


export function getAuth() {
    // Create a fresh database connection for this request
    // This is necessary for Cloudflare Workers to avoid I/O context isolation errors
    const db = getDB();

    return betterAuth({
        baseURL: process.env.BETTER_AUTH_URL,
        database: drizzleAdapter(db, {
            provider: "pg",
            schema,
        }),
        databaseHooks: {
            user: {
                create: {
                    before: async (user) => {
                        if (!isAllowedEmailDomain(user.email)) {
                            throw new APIError("BAD_REQUEST", {
                                message: ALLOWED_EMAIL_ERROR_MESSAGE,
                            });
                        }
                        return {
                            data: user,
                        };
                    },
                },
            },
        },
        emailAndPassword: {
            enabled: true,
        },
        socialProviders: {
            google: {
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
            github: {
                clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string,
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
