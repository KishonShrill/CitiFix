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
    const client = postgres(DATABASE_URL as string, {
        prepare: false,
        max: 1,
        idle_timeout: 1
    });

    return drizzle(client, { schema });
}

export { authSchema, reportSchema };
