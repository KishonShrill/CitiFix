import { db } from "./db";
import { category, problemType } from "./report-schema";
import { nanoid } from "nanoid";

/**
 * Seed script to populate categories and problem types for BetterIligan
 * Run with: node --import tsx lib/seed.ts
 */

const categories = [
  {
    id: nanoid(),
    name: "Roads & Infrastructure",
    description: "Potholes, damaged roads, broken sidewalks, bridges",
    color: "#ef4444",
    icon: "Construction",
    displayOrder: 1,
  },
  {
    id: nanoid(),
    name: "Water & Sanitation",
    description: "Water supply issues, leaks, sewage problems",
    color: "#3b82f6",
    icon: "Droplet",
    displayOrder: 2,
  },
  {
    id: nanoid(),
    name: "Electricity",
    description: "Power outages, damaged lines, streetlight issues",
    color: "#eab308",
    icon: "Zap",
    displayOrder: 3,
  },
  {
    id: nanoid(),
    name: "Waste Management",
    description: "Garbage collection, illegal dumping, recycling",
    color: "#22c55e",
    icon: "Trash2",
    displayOrder: 4,
  },
  {
    id: nanoid(),
    name: "Public Safety",
    description: "Crime, traffic violations, hazards",
    color: "#f97316",
    icon: "ShieldAlert",
    displayOrder: 5,
  },
  {
    id: nanoid(),
    name: "Health & Environment",
    description: "Air quality, pollution, public health concerns",
    color: "#06b6d4",
    icon: "Heart",
    displayOrder: 6,
  },
  {
    id: nanoid(),
    name: "Parks & Recreation",
    description: "Park maintenance, playground equipment, sports facilities",
    color: "#10b981",
    icon: "Trees",
    displayOrder: 7,
  },
  {
    id: nanoid(),
    name: "Other",
    description: "Issues that don't fit other categories",
    color: "#6b7280",
    icon: "HelpCircle",
    displayOrder: 99,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Insert categories
  console.log("📂 Creating categories...");
  await db.insert(category).values(categories).onConflictDoNothing();

  // Insert problem types
  console.log("🔧 Creating problem types...");

  const problemTypesData = [
    // Roads & Infrastructure
    { categoryName: "Roads & Infrastructure", name: "Pothole", description: "Damaged road surface" },
    { categoryName: "Roads & Infrastructure", name: "Cracked Pavement", description: "Cracks in the road or sidewalk" },
    { categoryName: "Roads & Infrastructure", name: "Damaged Sidewalk", description: "Broken or uneven sidewalk" },
    { categoryName: "Roads & Infrastructure", name: "Bridge Issue", description: "Bridge damage or safety concern" },
    { categoryName: "Roads & Infrastructure", name: "Road Debris", description: "Debris blocking the road" },

    // Water & Sanitation
    { categoryName: "Water & Sanitation", name: "No Water Supply", description: "No water in the area" },
    { categoryName: "Water & Sanitation", name: "Water Leak", description: "Leaking pipe or water main" },
    { categoryName: "Water & Sanitation", name: "Dirty Water", description: "Contaminated or discolored water" },
    { categoryName: "Water & Sanitation", name: "Sewage Problem", description: "Sewage overflow or backup" },
    { categoryName: "Water & Sanitation", name: "Blocked Drainage", description: "Clogged drain or canal" },

    // Electricity
    { categoryName: "Electricity", name: "Power Outage", description: "No electricity in the area" },
    { categoryName: "Electricity", name: "Damaged Power Line", description: "Fallen or exposed electrical wire" },
    { categoryName: "Electricity", name: "Streetlight Not Working", description: "Broken or dark streetlight" },
    { categoryName: "Electricity", name: "Electrical Hazard", description: "Exposed wiring or dangerous electrical issue" },

    // Waste Management
    { categoryName: "Waste Management", name: "Uncollected Garbage", description: "Garbage not picked up on schedule" },
    { categoryName: "Waste Management", name: "Illegal Dumping", description: "Trash dumped in unauthorized location" },
    { categoryName: "Waste Management", name: "Overflowing Bin", description: "Public trash bin is full" },
    { categoryName: "Waste Management", name: "Littering", description: "Excessive litter in public area" },

    // Public Safety
    { categoryName: "Public Safety", name: "Crime Report", description: "Criminal activity or suspicious behavior" },
    { categoryName: "Public Safety", name: "Traffic Violation", description: "Traffic rule violations" },
    { categoryName: "Public Safety", name: "Public Hazard", description: "Safety hazard in public area" },
    { categoryName: "Public Safety", name: "Stray Animals", description: "Dangerous or problematic stray animals" },

    // Health & Environment
    { categoryName: "Health & Environment", name: "Air Pollution", description: "Smoke or bad air quality" },
    { categoryName: "Health & Environment", name: "Water Pollution", description: "Polluted river, stream, or body of water" },
    { categoryName: "Health & Environment", name: "Noise Pollution", description: "Excessive noise disturbance" },
    { categoryName: "Health & Environment", name: "Health Concern", description: "Public health issue" },

    // Parks & Recreation
    { categoryName: "Parks & Recreation", name: "Damaged Equipment", description: "Broken playground or sports equipment" },
    { categoryName: "Parks & Recreation", name: "Park Maintenance", description: "Overgrown grass or unmaintained park" },
    { categoryName: "Parks & Recreation", name: "Vandalism", description: "Damaged or defaced public property" },

    // Other
    { categoryName: "Other", name: "General Concern", description: "Issue not covered by other categories" },
  ];

  let order = 1;
  for (const pt of problemTypesData) {
    const cat = categories.find((c) => c.name === pt.categoryName);
    if (!cat) {
      console.warn(`Category not found: ${pt.categoryName}`);
      continue;
    }

    await db.insert(problemType).values({
      id: nanoid(),
      categoryId: cat.id,
      name: pt.name,
      description: pt.description,
      displayOrder: order++,
    }).onConflictDoNothing();
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
