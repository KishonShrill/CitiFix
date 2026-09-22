import { pgTable, text, doublePrecision } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres("postgresql://postgres:postgres@127.0.0.1:54322/postgres");
const db = drizzle(sql);
const report = pgTable("report", { id: text("id"), status: text("status"), lat: doublePrecision("latitude"), lng: doublePrecision("longitude") });
const res = await db.select().from(report);
console.log("Reports:", res);
process.exit(0);
