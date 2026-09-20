// lib/db.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres'
import * as authSchema from "./auth-schema";
import * as reportSchema from "./report-schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const schema = { ...authSchema, ...reportSchema };

export function getDB() {
    // For Cloudflare Workers, create a fresh client per request to avoid I/O context issues
    const client = postgres(DATABASE_URL as string, {
        prepare: false,
        max: 1,
        idle_timeout: 10,
        max_lifetime: 60,
    });

    return drizzle(client, { schema });
}

export { authSchema, reportSchema };
