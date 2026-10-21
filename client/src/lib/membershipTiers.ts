import { getMembershipTiers as fetchMembershipTiersFromApi } from "@/lib/api";

export interface MembershipTier {
  id: string;
  name: string;
  amharicVersion: string;
  frontBackgroundUrl?: string | null;
  price: { etb: number; usd: number };
  monthlyPrice: { etb: number; usd: number };
  benefits: string[];
  color: string;
  recommended: boolean;
}

interface MembershipTierApiRow {
  id: string;
  amharicVersion?: string;
  priceEtb: number | string;
  priceUsd: number | string;
  monthlyPriceEtb?: number | string;
  monthlyPriceUsd?: number | string;
  frontBackgroundUrl?: string | null;
}

const levelThemeById: Record<string, string> = {
  "tewodros-level":
    "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950",
  "platinum-level":
    "bg-gradient-to-r from-zinc-300 via-slate-200 to-zinc-300 text-zinc-900",
  "diamond-level":
    "bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-400 text-sky-950",
  "emerald-level":
    "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white",
  "zebel-level":
    "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 text-white",
  "ras-level":
    "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white",
  "gold-level":
    "bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-amber-950",
  "silver-level":
    "bg-gradient-to-r from-gray-300 via-slate-200 to-gray-300 text-slate-900",
  "bronze-level":
    "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white",
  "youth-level":
    "bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 text-white",
};

const benefitsByTierId: Record<string, string[]> = {
  "tewodros-level": [
    "Official digital membership card",
    "Monthly supporters-only update email",
    "Early notice for club campaigns",
  ],
  "platinum-level": [
    "All Gold-level benefits",
    "Fast-track response to support requests",
    "Invitation to yearly premium members event",
  ],
  "diamond-level": [
    "All Platinum-level benefits",
    "Quarterly leadership briefing",
    "Priority seating access at selected events",
  ],
  "emerald-level": [
    "Official digital membership card",
    "Bi-weekly club news and impact stories",
    "Discounted access to selected events",
  ],
  "zebel-level": [
    "Official digital membership card",
    "Volunteer and outreach opportunities",
    "Recognition on annual supporters wall",
  ],
  "ras-level": [
    "Official digital membership card",
    "Priority registration for club activities",
    "Members-only networking sessions",
  ],
  "gold-level": [
    "All Silver-level benefits",
    "Priority club updates",
    "Exclusive Gold members giveaway access",
  ],
  "silver-level": [
    "Official digital membership card",
    "General club updates",
    "Access to members-only content",
  ],
  "bronze-level": [
    "Official digital membership card",
    "Welcome starter resources",
    "Community event reminders",
  ],
  "youth-level": [
    "Official digital youth membership card",
    "Youth training and mentorship alerts",
    "Reduced-fee youth event access",
  ],
};

function getTierTheme(id: string): string {
  return (
    levelThemeById[id] ??
    "bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 text-zinc-900"
  );
}

function formatTierName(id: string): string {
  const normalized = String(id ?? "").trim();
  if (!normalized) {
    return "Membership Tier";
  }

  return normalized
    .replace(/-level$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getMembershipTiers(): Promise<MembershipTier[]> {
  const rows = await fetchMembershipTiersFromApi();

  if (!Array.isArray(rows)) {
    return [];
  }

  return (rows as MembershipTierApiRow[]).map((row) => {
    const id = String(row.id ?? "").trim();
    const amharicVersion = String(row.amharicVersion ?? "").trim();
    return {
      id,
      name: formatTierName(id),
      amharicVersion,
      frontBackgroundUrl: row.frontBackgroundUrl ?? null,
      price: {
        etb: Number(row.priceEtb) || 0,
        usd: Number(row.priceUsd) || 0,
      },
      monthlyPrice: {
        etb: Number(row.monthlyPriceEtb) || 0,
        usd: Number(row.monthlyPriceUsd) || 0,
      },
      benefits: benefitsByTierId[id] ?? [
        "Official digital membership card",
        "Priority club updates",
        "Support club growth directly",
      ],
      color: getTierTheme(id),
      recommended: id === "gold-level" || id === "platinum-level",
    };
  });
}
