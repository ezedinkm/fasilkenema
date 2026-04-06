import { db, pool } from "./db";
import { membershipTiers } from "@shared/schema";

// 1. Define all tiers
const tiers = [
  { id: "tewodros-level", priceEtb: 36000, priceUsd: "300" },
  { id: "platinum-level", priceEtb: 12000, priceUsd: "100" },
  { id: "diamond-level", priceEtb: 8000, priceUsd: "67" },
  { id: "emerald-level", priceEtb: 6000, priceUsd: "50" },
  { id: "zebel-level", priceEtb: 4000, priceUsd: "33" },
  { id: "ras-level", priceEtb: 2000, priceUsd: "17" },
  { id: "gold-level", priceEtb: 1200, priceUsd: "10" },
  { id: "silver-level", priceEtb: 600, priceUsd: "5" },
  { id: "bronze-level", priceEtb: 300, priceUsd: "2.5" },
  { id: "youth-level", priceEtb: 120, priceUsd: "1" },
];

async function seedMembershipTiers() {
  try {
    await db.insert(membershipTiers).values(tiers).onConflictDoNothing();
    console.log("Membership tiers seeded successfully.");
  } catch (error) {
    console.error("Error seeding membership tiers:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
seedMembershipTiers();