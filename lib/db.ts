// lib/db.ts

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const client = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
});

export const db = drizzle(client);
