// lib/db.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres'
import * as authSchema from "./auth-schema";
import * as reportSchema from "./report-schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema: { ...authSchema, ...reportSchema } });

// Re-export schemas for convenience
export { authSchema, reportSchema };
