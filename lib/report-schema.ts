import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, json, doublePrecision, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// 1. Categories
export const category = pgTable("category", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    color: text("color").default("#3b82f6").notNull(),
    icon: text("icon").default("MapPin").notNull(),
    active: boolean("active").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// 2. Problem Types
export const problemType = pgTable("problem_type", {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
        .notNull()
        .references(() => category.id, { onDelete: "cascade" }),
    name: text("name").notNull().unique(),
    description: text("description"),
    icon: text("icon").default("AlertCircle").notNull(),
    active: boolean("active").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// 3. Reports
export const report = pgTable(
    "report",
    {
        id: text("id").primaryKey(), // Using text for nanoid
        userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Optional for anonymous reports? Or required? The request says "Citizen authenticated", but set null is safer if user is deleted.
        categoryId: text("category_id")
            .notNull()
            .references(() => category.id, { onDelete: "restrict" }),
        problemTypeId: text("problem_type_id")
            .notNull()
            .references(() => problemType.id, { onDelete: "restrict" }),
        title: text("title").notNull(),
        description: text("description").notNull(),
        media: text("media"),
        latitude: doublePrecision("latitude").notNull(),
        longitude: doublePrecision("longitude").notNull(),
        address: text("address"),
        barangay: text("barangay"),
        severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).default("medium").notNull(),
        status: text("status", { enum: ["draft", "submitted", "under_review", "verified", "rejected", "duplicate", "resolved", "hidden"] }).default("submitted").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        publishedAt: timestamp("published_at"),
    },
    (table) => [
        index("report_userId_idx").on(table.userId),
        index("report_categoryId_idx").on(table.categoryId),
        index("report_problemTypeId_idx").on(table.problemTypeId),
        index("report_status_createdAt_idx").on(table.status, table.createdAt),
        // Standard B-tree index on lat/lng for sorting if postgis is not available.
        index("report_location_idx").on(table.latitude, table.longitude),
    ]
);

// 4. Media
export const media = pgTable("media", {
    id: text("id").primaryKey(),
    reportId: text("report_id")
        .notNull()
        .references(() => report.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Audit Log
export const auditLog = pgTable(
    "audit_log",
    {
        id: text("id").primaryKey(),
        actor: text("actor").notNull(), // userId or "system"
        action: text("action").notNull(), // e.g. "verify_report", "reject_report"
        resourceType: text("resource_type").notNull(), // e.g. "report", "user"
        resourceId: text("resource_id").notNull(),
        changes: json("changes"),
        metadata: json("metadata"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("audit_log_createdAt_idx").on(table.createdAt),
        index("audit_log_resource_idx").on(table.resourceType, table.resourceId),
    ]
);


// Relations
export const categoryRelations = relations(category, ({ many }) => ({
    problemTypes: many(problemType),
    reports: many(report),
}));

export const problemTypeRelations = relations(problemType, ({ one, many }) => ({
    category: one(category, {
        fields: [problemType.categoryId],
        references: [category.id],
    }),
    reports: many(report),
}));

export const reportRelations = relations(report, ({ one, many }) => ({
    user: one(user, {
        fields: [report.userId],
        references: [user.id],
    }),
    category: one(category, {
        fields: [report.categoryId],
        references: [category.id],
    }),
    problemType: one(problemType, {
        fields: [report.problemTypeId],
        references: [problemType.id],
    }),
    media: many(media),
}));

export const mediaRelations = relations(media, ({ one }) => ({
    report: one(report, {
        fields: [media.reportId],
        references: [report.id],
    }),
}));
