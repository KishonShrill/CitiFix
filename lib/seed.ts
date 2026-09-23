import { config } from "dotenv";
import { resolve } from "path";
import { sql } from "drizzle-orm";

// Load .env before any other imports that depend on it
config({ path: resolve(process.cwd(), ".env") });

import { getDB } from "./db";
import { category, problemType } from "./report-schema";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";

const db = getDB();

/**
 * Seed script to populate categories and problem types for BetterIligan
 * Run with: node --import tsx lib/seed.ts
 */

const categoriesData = [
    { name: "Roads & Infrastructure", description: "Potholes, damaged roads, broken sidewalks, bridges", color: "#ef4444", icon: "Construction" },
    { name: "Water & Sanitation", description: "Water supply issues, leaks, sewage problems", color: "#3b82f6", icon: "Droplet" },
    { name: "Electricity", description: "Power outages, damaged lines, streetlight issues", color: "#eab308", icon: "Zap" },
    { name: "Waste Management", description: "Garbage collection, illegal dumping, recycling", color: "#22c55e", icon: "Trash2" },
    { name: "Public Safety", description: "Crime, traffic violations, hazards", color: "#f97316", icon: "ShieldAlert" },
    { name: "Health & Environment", description: "Air quality, pollution, public health concerns", color: "#06b6d4", icon: "Heart" },
    { name: "Parks & Recreation", description: "Park maintenance, playground equipment, sports facilities", color: "#10b981", icon: "Trees" },
    { name: "Other", description: "Issues that don't fit other categories", color: "#6b7280", icon: "HelpCircle" },
];

async function seed() {
    console.log("🌱 Seeding database...");

    // Insert categories
    console.log("📂 Creating categories...");

    let catOrder = 1;
    for (const cat of categoriesData) {
        const existing = await db
            .select()
            .from(category)
            .where(eq(category.name, cat.name))
            .limit(1);

        if (existing.length > 0) {
            console.log(`Skipping existing category: ${cat.name}`);
            continue;
        }

        // Find next display order
        const [{ maxOrder }] = await db.select({ maxOrder: sql<number>`max(${category.displayOrder})` }).from(category);
        const order = (maxOrder || 0) + 1;

        await db.insert(category).values({
            id: nanoid(),
            ...cat,
            displayOrder: order,
        });
    }

    // Insert problem types
    console.log("🔧 Creating problem types...");

    const problemTypesData = [
        // Roads & Infrastructure
        { categoryName: "Roads & Infrastructure", name: "Pothole", icon: "TriangleAlert", description: "Damaged road surface" },
        { categoryName: "Roads & Infrastructure", name: "Cracked Pavement", icon: "Construction", description: "Cracks in the road or sidewalk" },
        { categoryName: "Roads & Infrastructure", name: "Damaged Sidewalk", icon: "Footprints", description: "Broken or uneven sidewalk" },
        { categoryName: "Roads & Infrastructure", name: "Bridge Issue", icon: "Waves", description: "Bridge damage or safety concern" },
        { categoryName: "Roads & Infrastructure", name: "Road Debris", icon: "Trash", description: "Debris blocking the road" },

        // Water & Sanitation
        { categoryName: "Water & Sanitation", name: "No Water Supply", icon: "CircleOff", description: "No water in the area" },
        { categoryName: "Water & Sanitation", name: "Water Leak", icon: "Droplets", description: "Leaking pipe or water main" },
        { categoryName: "Water & Sanitation", name: "Dirty Water", icon: "FlaskConical", description: "Contaminated or discolored water" },
        { categoryName: "Water & Sanitation", name: "Sewage Problem", icon: "Biohazard", description: "Sewage overflow or backup" },
        { categoryName: "Water & Sanitation", name: "Blocked Drainage", icon: "Filter", description: "Clogged drain or canal" },

        // Electricity
        { categoryName: "Electricity", name: "Power Outage", icon: "ZapOff", description: "No electricity in the area" },
        { categoryName: "Electricity", name: "Damaged Power Line", icon: "Plug", description: "Fallen or exposed electrical wire" },
        { categoryName: "Electricity", name: "Streetlight Not Working", icon: "LightbulbOff", description: "Broken or dark streetlight" },
        { categoryName: "Electricity", name: "Electrical Hazard", icon: "Zap", description: "Exposed wiring or dangerous electrical issue" },

        // Waste Management
        { categoryName: "Waste Management", name: "Uncollected Garbage", icon: "PackageOpen", description: "Garbage not picked up on schedule" },
        { categoryName: "Waste Management", name: "Illegal Dumping", icon: "TrashOff", description: "Trash dumped in unauthorized location" },
        { categoryName: "Waste Management", name: "Overflowing Bin", icon: "Archive", description: "Public trash bin is full" },
        { categoryName: "Waste Management", name: "Littering", icon: "Cigarette", description: "Excessive litter in public area" },

        // Public Safety
        { categoryName: "Public Safety", name: "Crime Report", icon: "Siren", description: "Criminal activity or suspicious behavior" },
        { categoryName: "Public Safety", name: "Traffic Violation", icon: "Car", description: "Traffic rule violations" },
        { categoryName: "Public Safety", name: "Public Hazard", icon: "AlertCircle", description: "Safety hazard in public area" },
        { categoryName: "Public Safety", name: "Stray Animals", icon: "Dog", description: "Dangerous or problematic stray animals" },

        // Health & Environment
        { categoryName: "Health & Environment", name: "Air Pollution", icon: "Wind", description: "Smoke or bad air quality" },
        { categoryName: "Health & Environment", name: "Water Pollution", icon: "Gauge", description: "Polluted river, stream, or body of water" },
        { categoryName: "Health & Environment", name: "Noise Pollution", icon: "Volume2", description: "Excessive noise disturbance" },
        { categoryName: "Health & Environment", name: "Health Concern", icon: "HeartPulse", description: "Public health issue" },

        // Parks & Recreation
        { categoryName: "Parks & Recreation", name: "Damaged Equipment", icon: "Hammer", description: "Broken playground or sports equipment" },
        { categoryName: "Parks & Recreation", name: "Park Maintenance", icon: "Leaf", description: "Overgrown grass or unmaintained park" },
        { categoryName: "Parks & Recreation", name: "Vandalism", icon: "PaintBucket", description: "Damaged or defaced public property" },

        // Other
        { categoryName: "Other", name: "General Concern", icon: "CircleHelp", description: "Issue not covered by other categories" },
    ];

    for (const pt of problemTypesData) {
        const cat = await db.select().from(category).where(eq(category.name, pt.categoryName)).limit(1);
        if (cat.length === 0) {
            console.warn(`Category not found: ${pt.categoryName}`);
            continue;
        }
        const categoryId = cat[0].id;

        const existing = await db
            .select()
            .from(problemType)
            .where(and(eq(problemType.categoryId, categoryId), eq(problemType.name, pt.name)))
            .limit(1);

        if (existing.length > 0) {
            console.log(`Skipping existing problem type: ${pt.name}`);
            continue;
        }

        // Find next display order
        const [{ maxOrder }] = await db.select({ maxOrder: sql<number>`max(${problemType.displayOrder})` }).from(problemType);
        const order = (maxOrder || 0) + 1;

        await db.insert(problemType).values({
            id: nanoid(),
            categoryId: categoryId,
            name: pt.name,
            icon: pt.icon,
            description: pt.description,
            displayOrder: order,
        });
    }

    console.log("✅ Seeding complete!");
    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
});
