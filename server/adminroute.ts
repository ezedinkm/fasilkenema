import type { Express } from "express";
import { asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import { authenticateToken } from "./middleware/authMiddleware";
import { sendSms } from "./iconicSms";
import { storage } from "./storage";
import { SMS_ICONIC_SETTING_KEYS } from "@shared/schema";
import { upload } from "./middleware/multerConfig";

type DashboardGrowthPoint = {
  name: string;
  members: number;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

let donationTiersTableReady = false;
let userMessageTableReady = false;
let watchReviewsTableReady = false;
let membershipTiersSchemaReady = false;
let smsBroadcastTablesReady = false;
let smsLogsCategoryReady = false;

async function ensureSmsLogsCategoryColumn(): Promise<void> {
  if (smsLogsCategoryReady) {
    return;
  }
  await db.execute(
    sql`ALTER TABLE sms_logs ADD COLUMN IF NOT EXISTS category text`,
  );
  smsLogsCategoryReady = true;
}

type SmsBroadcastTargetType = "all" | "tier" | "expired";

type SmsQueueRecipient = {
  phone: string;
  fullName: string;
  membershipNumber: string;
  tier: string;
};

type SmsQueuedJob = {
  jobId: number;
  message: string;
  recipients: SmsQueueRecipient[];
};

const smsBroadcastQueue: SmsQueuedJob[] = [];
let isProcessingSmsQueue = false;
const SMS_BATCH_SIZE = 40;

async function ensureDonationTiersTableExists(): Promise<void> {
  if (donationTiersTableReady) {
    return;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS donation_tiers (
      id serial PRIMARY KEY,
      amount integer NOT NULL,
      label text NOT NULL,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);

  donationTiersTableReady = true;
}

async function ensureUserMessageTableExists(): Promise<void> {
  if (userMessageTableReady) {
    return;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS usermessage (
      id serial PRIMARY KEY,
      full_name text NOT NULL,
      email text NOT NULL,
      subject text NOT NULL,
      message text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);

  userMessageTableReady = true;
}

async function ensureWatchReviewsTableExists(): Promise<void> {
  if (watchReviewsTableReady) {
    return;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS watch_reviews (
      id serial PRIMARY KEY,
      title text NOT NULL,
      youtube_url text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);

  watchReviewsTableReady = true;
}

async function ensureMembershipTiersSchema(): Promise<void> {
  if (membershipTiersSchemaReady) {
    return;
  }

  await db.execute(sql`
    ALTER TABLE membership_tiers
    ADD COLUMN IF NOT EXISTS amharic_version text NOT NULL DEFAULT '';
  `);
  await db.execute(sql`
    ALTER TABLE membership_tiers
    ADD COLUMN IF NOT EXISTS monthly_price_etb integer NOT NULL DEFAULT 0;
  `);
  await db.execute(sql`
    ALTER TABLE membership_tiers
    ADD COLUMN IF NOT EXISTS monthly_price_usd numeric(10, 2) NOT NULL DEFAULT 0;
  `);

  membershipTiersSchemaReady = true;
}

async function ensureSmsBroadcastTables(): Promise<void> {
  if (smsBroadcastTablesReady) {
    return;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sms_broadcast_jobs (
      id serial PRIMARY KEY,
      target_type text NOT NULL,
      target_value text,
      message text NOT NULL,
      status text NOT NULL DEFAULT 'queued',
      total_recipients integer NOT NULL DEFAULT 0,
      processed_count integer NOT NULL DEFAULT 0,
      sent_count integer NOT NULL DEFAULT 0,
      failed_count integer NOT NULL DEFAULT 0,
      created_by text,
      started_at timestamp,
      completed_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);

  smsBroadcastTablesReady = true;
}

function renderBroadcastMessage(
  template: string,
  recipient: SmsQueueRecipient,
): string {
  return template
    .replace(/\{\{name\}\}/gi, recipient.fullName)
    .replace(/\{\{membership_id\}\}/gi, recipient.membershipNumber)
    .replace(/\{\{tier\}\}/gi, recipient.tier);
}

async function processSmsQueue(): Promise<void> {
  if (isProcessingSmsQueue) {
    return;
  }
  const next = smsBroadcastQueue.shift();
  if (!next) {
    return;
  }

  isProcessingSmsQueue = true;
  let processedCount = 0;
  let sentCount = 0;
  let failedCount = 0;

  try {
    await db
      .update(schema.smsBroadcastJobs)
      .set({
        status: "processing",
        startedAt: new Date(),
      })
      .where(eq(schema.smsBroadcastJobs.id, next.jobId));

    for (let i = 0; i < next.recipients.length; i += SMS_BATCH_SIZE) {
      const batch = next.recipients.slice(i, i + SMS_BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (recipient) => {
          const message = renderBroadcastMessage(next.message, recipient);
          const result = await sendSms(recipient.phone, message, {
            category: "broadcast",
          });
          return result.success;
        }),
      );

      for (const result of results) {
        processedCount += 1;
        if (result.status === "fulfilled" && result.value) {
          sentCount += 1;
        } else {
          failedCount += 1;
        }
      }

      await db
        .update(schema.smsBroadcastJobs)
        .set({
          processedCount,
          sentCount,
          failedCount,
        })
        .where(eq(schema.smsBroadcastJobs.id, next.jobId));
    }

    await db
      .update(schema.smsBroadcastJobs)
      .set({
        status: failedCount > 0 ? "completed_with_errors" : "completed",
        processedCount,
        sentCount,
        failedCount,
        completedAt: new Date(),
      })
      .where(eq(schema.smsBroadcastJobs.id, next.jobId));
  } catch (error) {
    console.error("[adminroute] sms queue processing", error);
    await db
      .update(schema.smsBroadcastJobs)
      .set({
        status: "failed",
        processedCount,
        sentCount,
        failedCount,
        completedAt: new Date(),
      })
      .where(eq(schema.smsBroadcastJobs.id, next.jobId));
  } finally {
    isProcessingSmsQueue = false;
    void processSmsQueue();
  }
}

export function registerAdminRoutes(app: Express): void {
  app.get(
    "/api/admin/sms/provider-status",
    authenticateToken,
    async (_req, res) => {
      try {
        const senderSetting = await storage.getSettingByKey(
          SMS_ICONIC_SETTING_KEYS.senderId,
        );
        res.json({
          provider: "IconicSMS",
          apiKeyConfigured: Boolean(
            String(process.env.ICONIC_SMS_API_KEY ?? "").trim(),
          ),
          senderId: String(senderSetting?.value ?? ""),
        });
      } catch (error) {
        console.error("[adminroute] SMS provider status", error);
        res.status(500).json({ error: "Failed to read SMS provider status" });
      }
    },
  );
  void ensureSmsLogsCategoryColumn().catch((err) =>
    console.error("[adminroute] sms_logs.category migration", err),
  );

  app.get("/api/admin/watch-reviews", authenticateToken, async (_req, res) => {
    try {
      await ensureWatchReviewsTableExists();
      const rows = await db
        .select()
        .from(schema.watchReviews)
        .orderBy(desc(schema.watchReviews.createdAt));
      res.json(rows);
    } catch (error) {
      console.error("[adminroute] watch reviews list", error);
      res.status(500).json({ error: "Failed to fetch watch reviews" });
    }
  });

  app.post("/api/admin/watch-reviews", authenticateToken, async (req, res) => {
    try {
      await ensureWatchReviewsTableExists();
      const title = String(req.body?.title ?? "").trim();
      const youtubeUrl = String(req.body?.youtubeUrl ?? "").trim();

      if (!title || !youtubeUrl) {
        return res
          .status(400)
          .json({ error: "Title and YouTube URL are required" });
      }

      const [created] = await db
        .insert(schema.watchReviews)
        .values({ title, youtubeUrl })
        .returning();
      res.status(201).json(created);
    } catch (error) {
      console.error("[adminroute] watch reviews create", error);
      res.status(500).json({ error: "Failed to create watch review" });
    }
  });

  app.patch(
    "/api/admin/watch-reviews/:id",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureWatchReviewsTableExists();
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: "Invalid watch review id" });
        }

        const updates: Partial<{ title: string; youtubeUrl: string }> = {};
        if (req.body?.title !== undefined) {
          const title = String(req.body.title).trim();
          if (!title)
            return res.status(400).json({ error: "Title cannot be empty" });
          updates.title = title;
        }
        if (req.body?.youtubeUrl !== undefined) {
          const youtubeUrl = String(req.body.youtubeUrl).trim();
          if (!youtubeUrl)
            return res
              .status(400)
              .json({ error: "YouTube URL cannot be empty" });
          updates.youtubeUrl = youtubeUrl;
        }
        if (Object.keys(updates).length === 0) {
          return res
            .status(400)
            .json({ error: "No fields provided to update" });
        }

        const [updated] = await db
          .update(schema.watchReviews)
          .set(updates)
          .where(eq(schema.watchReviews.id, id))
          .returning();

        if (!updated)
          return res.status(404).json({ error: "Watch review not found" });
        res.json(updated);
      } catch (error) {
        console.error("[adminroute] watch reviews update", error);
        res.status(500).json({ error: "Failed to update watch review" });
      }
    },
  );

  app.delete(
    "/api/admin/watch-reviews/:id",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureWatchReviewsTableExists();
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: "Invalid watch review id" });
        }

        const [deleted] = await db
          .delete(schema.watchReviews)
          .where(eq(schema.watchReviews.id, id))
          .returning();

        if (!deleted)
          return res.status(404).json({ error: "Watch review not found" });
        res.json({ success: true });
      } catch (error) {
        console.error("[adminroute] watch reviews delete", error);
        res.status(500).json({ error: "Failed to delete watch review" });
      }
    },
  );

  app.get("/api/admin/usermessages", authenticateToken, async (_req, res) => {
    try {
      await ensureUserMessageTableExists();

      const rows = await db
        .select()
        .from(schema.usermessage)
        .orderBy(desc(schema.usermessage.createdAt));

      res.json(rows);
    } catch (error) {
      console.error("[adminroute] usermessages list", error);
      res.status(500).json({ error: "Failed to fetch user messages" });
    }
  });

  app.get(
    "/api/admin/membership-tiers",
    authenticateToken,
    async (_req, res) => {
      try {
        await ensureMembershipTiersSchema();

        const tiers = await db
          .select()
          .from(schema.membershipTiers)
          .orderBy(asc(schema.membershipTiers.createdAt));

        res.json(tiers);
      } catch (error) {
        console.error("[adminroute] membership tiers list", error);
        res.status(500).json({ error: "Failed to fetch membership tiers" });
      }
    },
  );

  app.post(
    "/api/admin/membership-tiers/upload-background",
    authenticateToken,
    (req, res) => {
      upload.single("photo")(req, res, (error) => {
        if (error) {
          return res.status(400).json({
            error: error instanceof Error ? error.message : "Image upload failed",
          });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No image uploaded" });
        }
        return res.status(201).json({
          photoUrl: `/uploads/${req.file.filename}`,
        });
      });
    },
  );

  app.post(
    "/api/admin/membership-tiers",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureMembershipTiersSchema();

        const payload = {
          id: String(req.body?.id ?? "").trim(),
          amharicVersion: String(req.body?.amharicVersion ?? "").trim(),
          priceEtb: Number(req.body?.priceEtb),
          priceUsd: String(req.body?.priceUsd ?? ""),
          monthlyPriceEtb: Number(req.body?.monthlyPriceEtb),
          monthlyPriceUsd: String(req.body?.monthlyPriceUsd ?? ""),
          frontBackgroundUrl:
            String(req.body?.frontBackgroundUrl ?? "").trim() || null,
        };

        if (!payload.id) {
          return res.status(400).json({ error: "Tier id is required" });
        }
        if (!payload.amharicVersion) {
          return res.status(400).json({ error: "amharicVersion is required" });
        }
        if (!Number.isFinite(payload.priceEtb) || payload.priceEtb < 0) {
          return res
            .status(400)
            .json({ error: "priceEtb must be a valid number" });
        }
        if (
          !Number.isFinite(Number(payload.priceUsd)) ||
          Number(payload.priceUsd) < 0
        ) {
          return res
            .status(400)
            .json({ error: "priceUsd must be a valid number" });
        }
        if (
          !Number.isFinite(payload.monthlyPriceEtb) ||
          payload.monthlyPriceEtb < 0
        ) {
          return res
            .status(400)
            .json({ error: "monthlyPriceEtb must be a valid number" });
        }
        if (
          !Number.isFinite(Number(payload.monthlyPriceUsd)) ||
          Number(payload.monthlyPriceUsd) < 0
        ) {
          return res
            .status(400)
            .json({ error: "monthlyPriceUsd must be a valid number" });
        }

        const [created] = await db
          .insert(schema.membershipTiers)
          .values({
            id: payload.id,
            amharicVersion: payload.amharicVersion,
            priceEtb: payload.priceEtb,
            priceUsd: payload.priceUsd,
            monthlyPriceEtb: payload.monthlyPriceEtb,
            monthlyPriceUsd: payload.monthlyPriceUsd,
            frontBackgroundUrl: payload.frontBackgroundUrl,
          })
          .returning();

        res.status(201).json(created);
      } catch (error) {
        console.error("[adminroute] membership tiers create", error);
        res.status(500).json({ error: "Failed to create membership tier" });
      }
    },
  );

  app.patch(
    "/api/admin/membership-tiers/:id",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureMembershipTiersSchema();

        const id = String(req.params.id ?? "").trim();
        if (!id) {
          return res.status(400).json({ error: "Tier id is required" });
        }

        const updates: Partial<{
          id: string;
          amharicVersion: string;
          priceEtb: number;
          priceUsd: string;
          monthlyPriceEtb: number;
          monthlyPriceUsd: string;
          frontBackgroundUrl: string | null;
        }> = {};
        if (req.body?.id !== undefined) {
          const nextId = String(req.body.id).trim();
          if (!nextId) {
            return res.status(400).json({ error: "id cannot be empty" });
          }
          updates.id = nextId;
        }
        if (req.body?.amharicVersion !== undefined) {
          const amharicVersion = String(req.body.amharicVersion).trim();
          if (!amharicVersion) {
            return res
              .status(400)
              .json({ error: "amharicVersion cannot be empty" });
          }
          updates.amharicVersion = amharicVersion;
        }
        if (req.body?.priceEtb !== undefined) {
          const value = Number(req.body.priceEtb);
          if (!Number.isFinite(value) || value < 0) {
            return res
              .status(400)
              .json({ error: "priceEtb must be a valid number" });
          }
          updates.priceEtb = value;
        }
        if (req.body?.priceUsd !== undefined) {
          const value = Number(req.body.priceUsd);
          if (!Number.isFinite(value) || value < 0) {
            return res
              .status(400)
              .json({ error: "priceUsd must be a valid number" });
          }
          updates.priceUsd = String(value);
        }
        if (req.body?.monthlyPriceEtb !== undefined) {
          const value = Number(req.body.monthlyPriceEtb);
          if (!Number.isFinite(value) || value < 0) {
            return res
              .status(400)
              .json({ error: "monthlyPriceEtb must be a valid number" });
          }
          updates.monthlyPriceEtb = value;
        }
        if (req.body?.monthlyPriceUsd !== undefined) {
          const value = Number(req.body.monthlyPriceUsd);
          if (!Number.isFinite(value) || value < 0) {
            return res
              .status(400)
              .json({ error: "monthlyPriceUsd must be a valid number" });
          }
          updates.monthlyPriceUsd = String(value);
        }
        if (req.body?.frontBackgroundUrl !== undefined) {
          updates.frontBackgroundUrl =
            String(req.body.frontBackgroundUrl ?? "").trim() || null;
        }

        if (Object.keys(updates).length === 0) {
          return res
            .status(400)
            .json({ error: "No fields provided to update" });
        }

        const [updated] = await db
          .update(schema.membershipTiers)
          .set(updates)
          .where(eq(schema.membershipTiers.id, id))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: "Membership tier not found" });
        }

        res.json(updated);
      } catch (error) {
        console.error("[adminroute] membership tiers update", error);
        res.status(500).json({ error: "Failed to update membership tier" });
      }
    },
  );

  app.delete(
    "/api/admin/membership-tiers/:id",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureMembershipTiersSchema();

        const id = String(req.params.id ?? "").trim();
        if (!id) {
          return res.status(400).json({ error: "Tier id is required" });
        }

        const [deleted] = await db
          .delete(schema.membershipTiers)
          .where(eq(schema.membershipTiers.id, id))
          .returning();

        if (!deleted) {
          return res.status(404).json({ error: "Membership tier not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("[adminroute] membership tiers delete", error);
        res.status(500).json({ error: "Failed to delete membership tier" });
      }
    },
  );

  app.get("/api/admin/sms/stats", authenticateToken, async (_req, res) => {
    try {
      await ensureSmsLogsCategoryColumn();
      const stats = await storage.getSmsSendStats();
      res.json(stats);
    } catch (error) {
      console.error("[adminroute] sms stats", error);
      res.status(500).json({ error: "Failed to load SMS statistics" });
    }
  });

  app.get("/api/admin/sms/audiences", authenticateToken, async (_req, res) => {
    try {
      const members = await db
        .select({
          phone: schema.members.phone,
          status: schema.members.status,
          tier: schema.members.tier,
        })
        .from(schema.members);
      const validActiveMembers = members.filter(
        (member) => member.status === "active" && Boolean(member.phone),
      );
      const validExpiredMembers = members.filter(
        (member) => member.status === "expired" && Boolean(member.phone),
      );
      const uniqueActivePhones = new Set<string>();
      const uniqueExpiredPhones = new Set<string>();
      const tierCounts = new Map<string, number>();

      for (const member of validActiveMembers) {
        const normalizedPhone = String(member.phone).trim();
        if (!normalizedPhone || uniqueActivePhones.has(normalizedPhone)) {
          continue;
        }
        uniqueActivePhones.add(normalizedPhone);

        const tierId = String(member.tier || "").trim() || "unknown";
        tierCounts.set(tierId, (tierCounts.get(tierId) ?? 0) + 1);
      }

      for (const member of validExpiredMembers) {
        const normalizedPhone = String(member.phone).trim();
        if (!normalizedPhone || uniqueExpiredPhones.has(normalizedPhone)) {
          continue;
        }
        uniqueExpiredPhones.add(normalizedPhone);
      }

      const tiers = Array.from(tierCounts.entries())
        .map(([tierId, count]) => ({ tierId, count }))
        .sort((a, b) => b.count - a.count);

      res.json({
        totalRecipients: uniqueActivePhones.size,
        expiredRecipients: uniqueExpiredPhones.size,
        tiers,
      });
    } catch (error) {
      console.error("[adminroute] sms audiences", error);
      res.status(500).json({ error: "Failed to load SMS audiences" });
    }
  });

  app.get("/api/admin/sms/broadcasts", authenticateToken, async (_req, res) => {
    try {
      await ensureSmsBroadcastTables();
      const jobs = await db
        .select()
        .from(schema.smsBroadcastJobs)
        .orderBy(desc(schema.smsBroadcastJobs.createdAt))
        .limit(50);

      res.json(jobs);
    } catch (error) {
      console.error("[adminroute] sms broadcasts list", error);
      res.status(500).json({ error: "Failed to fetch SMS broadcasts" });
    }
  });

  app.post("/api/admin/sms/broadcasts", authenticateToken, async (req, res) => {
    try {
      await ensureSmsBroadcastTables();
      const targetTypeRaw = String(req.body?.targetType ?? "")
        .trim()
        .toLowerCase();
      const targetValue = String(req.body?.targetValue ?? "").trim();
      const message = String(req.body?.message ?? "").trim();

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      if (message.length > 459) {
        return res
          .status(400)
          .json({ error: "Message is too long (max 459 chars)" });
      }
      if (
        targetTypeRaw !== "all" &&
        targetTypeRaw !== "tier" &&
        targetTypeRaw !== "expired"
      ) {
        return res
          .status(400)
          .json({ error: "targetType must be all, tier, or expired" });
      }
      if (targetTypeRaw === "tier" && !targetValue) {
        return res
          .status(400)
          .json({ error: "targetValue is required for tier targeting" });
      }

      const targetType = targetTypeRaw as SmsBroadcastTargetType;
      const allMembers = await db
        .select({
          phone: schema.members.phone,
          status: schema.members.status,
          tier: schema.members.tier,
          fullName: schema.members.fullName,
          membershipNumber: schema.members.membershipNumber,
        })
        .from(schema.members);
      const filtered = allMembers.filter((member) => {
        if (!member.phone) {
          return false;
        }
        if (targetType === "expired") {
          return member.status === "expired";
        }
        if (member.status !== "active") {
          return false;
        }
        if (targetType === "tier") {
          return String(member.tier).trim() === targetValue;
        }
        return true;
      });

      const dedupedByPhone = new Map<string, SmsQueueRecipient>();
      for (const member of filtered) {
        const phone = String(member.phone).trim();
        if (!phone || dedupedByPhone.has(phone)) {
          continue;
        }
        dedupedByPhone.set(phone, {
          phone,
          fullName: String(member.fullName || "Member"),
          membershipNumber: String(member.membershipNumber || ""),
          tier: String(member.tier || ""),
        });
      }
      const recipients = Array.from(dedupedByPhone.values());

      if (recipients.length === 0) {
        return res
          .status(400)
          .json({ error: "No members found for selected audience" });
      }

      const [created] = await db
        .insert(schema.smsBroadcastJobs)
        .values({
          targetType,
          targetValue:
            targetType === "tier"
              ? targetValue
              : targetType === "expired"
                ? "expired"
                : null,
          message,
          status: "queued",
          totalRecipients: recipients.length,
          processedCount: 0,
          sentCount: 0,
          failedCount: 0,
          createdBy: String((req as any).user?.email ?? "admin"),
        })
        .returning();

      smsBroadcastQueue.push({
        jobId: created.id,
        message,
        recipients,
      });
      void processSmsQueue();

      res.status(201).json(created);
    } catch (error) {
      console.error("[adminroute] sms broadcasts create", error);
      res.status(500).json({ error: "Failed to queue SMS broadcast" });
    }
  });

  app.get("/api/admin/donation-tiers", authenticateToken, async (_req, res) => {
    try {
      await ensureDonationTiersTableExists();

      const tiers = await db
        .select()
        .from(schema.donationTiers)
        .orderBy(
          asc(schema.donationTiers.sortOrder),
          asc(schema.donationTiers.id),
        );

      res.json(tiers);
    } catch (error) {
      console.error("[adminroute] donation tiers list", error);
      res.status(500).json({ error: "Failed to fetch donation tiers" });
    }
  });

  app.post("/api/admin/donation-tiers", authenticateToken, async (req, res) => {
    try {
      await ensureDonationTiersTableExists();

      const amount = Number(req.body?.amount);
      const label = String(req.body?.label ?? "").trim();
      const sortOrderValue = req.body?.sortOrder;
      const sortOrder =
        sortOrderValue === undefined ? 0 : Number(sortOrderValue);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Amount must be a valid positive number" });
      }
      if (!label) {
        return res.status(400).json({ error: "Label is required" });
      }
      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
        return res
          .status(400)
          .json({ error: "sortOrder must be a valid non-negative number" });
      }

      const [created] = await db
        .insert(schema.donationTiers)
        .values({
          amount,
          label,
          sortOrder,
        })
        .returning();

      res.status(201).json(created);
    } catch (error) {
      console.error("[adminroute] donation tiers create", error);
      res.status(500).json({ error: "Failed to create donation tier" });
    }
  });

  app.patch(
    "/api/admin/donation-tiers/:id",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureDonationTiersTableExists();

        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: "Invalid donation tier id" });
        }

        const updates: Partial<{
          amount: number;
          label: string;
          sortOrder: number;
        }> = {};
        if (req.body?.amount !== undefined) {
          const amount = Number(req.body.amount);
          if (!Number.isFinite(amount) || amount <= 0) {
            return res
              .status(400)
              .json({ error: "Amount must be a valid positive number" });
          }
          updates.amount = amount;
        }
        if (req.body?.label !== undefined) {
          const label = String(req.body.label).trim();
          if (!label) {
            return res.status(400).json({ error: "Label cannot be empty" });
          }
          updates.label = label;
        }
        if (req.body?.sortOrder !== undefined) {
          const sortOrder = Number(req.body.sortOrder);
          if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return res
              .status(400)
              .json({ error: "sortOrder must be a valid non-negative number" });
          }
          updates.sortOrder = sortOrder;
        }

        if (Object.keys(updates).length === 0) {
          return res
            .status(400)
            .json({ error: "No fields provided to update" });
        }

        const [updated] = await db
          .update(schema.donationTiers)
          .set(updates)
          .where(eq(schema.donationTiers.id, id))
          .returning();

        if (!updated) {
          return res.status(404).json({ error: "Donation tier not found" });
        }

        res.json(updated);
      } catch (error) {
        console.error("[adminroute] donation tiers update", error);
        res.status(500).json({ error: "Failed to update donation tier" });
      }
    },
  );

  app.delete(
    "/api/admin/donation-tiers/:id",
    authenticateToken,
    async (req, res) => {
      try {
        await ensureDonationTiersTableExists();

        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: "Invalid donation tier id" });
        }

        const [deleted] = await db
          .delete(schema.donationTiers)
          .where(eq(schema.donationTiers.id, id))
          .returning();

        if (!deleted) {
          return res.status(404).json({ error: "Donation tier not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("[adminroute] donation tiers delete", error);
        res.status(500).json({ error: "Failed to delete donation tier" });
      }
    },
  );

  app.get("/api/admin/payments", authenticateToken, async (_req, res) => {
    try {
      const [genericPayments, legacyMembershipPayments, donations, members] =
        await Promise.all([
          db
            .select()
            .from(schema.payments)
            .orderBy(desc(schema.payments.createdAt)),
          db
            .select()
            .from(schema.membershipPayments)
            .orderBy(desc(schema.membershipPayments.createdAt)),
          db
            .select()
            .from(schema.donations)
            .orderBy(desc(schema.donations.createdAt)),
          db.select().from(schema.members),
        ]);

      const isCompleted = (status: string) => {
        const n = String(status || "").toLowerCase();
        return n === "completed" || n === "success" || n === "succeeded";
      };

      const genericCompleted = genericPayments.filter((p) =>
        isCompleted(p.status),
      );
      const legacyCompleted = legacyMembershipPayments.filter((p) =>
        isCompleted(p.status),
      );
      const donationsCompleted = donations.filter((d) => isCompleted(d.status));

      const allMembershipTxRefs = [
        ...genericCompleted.map((p) => p.transactionId),
        ...legacyCompleted.map((p) => p.transactionId),
      ];

      const pendingApplications =
        allMembershipTxRefs.length > 0
          ? await db
              .select()
              .from(schema.pendingMemberApplications)
              .where(
                inArray(
                  schema.pendingMemberApplications.transactionId,
                  allMembershipTxRefs,
                ),
              )
          : [];
      const pendingByTxRef = new Map(
        pendingApplications.map((a) => [
          a.transactionId,
          `${a.firstName} ${a.lastName}`.trim() || "Membership Applicant",
        ]),
      );
      const memberById = new Map(
        members.map((m) => [
          m.id,
          m.fullName || m.membershipNumber || "Member",
        ]),
      );

      /** Prefer `payments` row per tx ref; skip `membership_payments` when generic already exists (no duplicate lines). */
      const genericMembershipTxIds = new Set(
        genericCompleted
          .filter((p) => {
            const t = String(p.type || "").toLowerCase();
            return t === "membership" || t === "membership_renewal";
          })
          .map((p) => p.transactionId),
      );

      const rowDate = (paidAt: Date | null | undefined, createdAt: Date) => {
        const d = paidAt ? new Date(paidAt) : new Date(createdAt);
        return d.toISOString().slice(0, 10);
      };

      const membershipRowsFromGeneric = genericCompleted
        .filter((p) => {
          const normalizedType = String(p.type || "").toLowerCase();
          return (
            normalizedType === "membership" ||
            normalizedType === "membership_renewal"
          );
        })
        .map((payment) => {
          const normalizedType = String(payment.type || "").toLowerCase();
          const paymentUserId = Number((payment.metadata as any)?.userId);
          const renewalMemberName =
            Number.isFinite(paymentUserId) && paymentUserId > 0
              ? memberById.get(paymentUserId)
              : undefined;

          const user =
            normalizedType === "membership_renewal"
              ? (renewalMemberName ?? "Member (Renewal)")
              : (pendingByTxRef.get(payment.transactionId) ??
                "Membership Applicant");

          const rowType =
            normalizedType === "membership_renewal"
              ? ("Renewal" as const)
              : ("Membership" as const);

          return {
            id: payment.transactionId,
            user,
            amount: payment.amount,
            currency: String(payment.currency).toUpperCase(),
            type: rowType,
            status: "SUCCESS" as const,
            date: rowDate(payment.paidAt, payment.createdAt),
          };
        });

      const membershipRowsFromLegacy = legacyCompleted
        .filter((payment) => !genericMembershipTxIds.has(payment.transactionId))
        .map((payment) => ({
          id: payment.transactionId,
          user: memberById.get(payment.memberId) ?? "Member",
          amount: payment.amount,
          currency: String(payment.currency).toUpperCase(),
          type: "Membership" as const,
          status: "SUCCESS" as const,
          date: rowDate(payment.paidAt, payment.createdAt),
        }));

      const donationRows = donationsCompleted.map((donation) => ({
        id: donation.transactionId,
        user: donation.isAnonymous ? "Anonymous" : donation.donorName,
        amount: donation.amount,
        currency: String(donation.currency).toUpperCase(),
        type: "Donation" as const,
        status: "SUCCESS" as const,
        date: rowDate(donation.paidAt, donation.createdAt),
      }));

      const allPayments = [
        ...membershipRowsFromGeneric,
        ...membershipRowsFromLegacy,
        ...donationRows,
      ].sort((a, b) => b.date.localeCompare(a.date));

      res.json(allPayments);
    } catch (error) {
      console.error("[adminroute] payments", error);
      res.status(500).json({ error: "Failed to fetch admin payments" });
    }
  });

  app.get("/api/admin/dashboard", authenticateToken, async (_req, res) => {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const windowStart = addMonths(monthStart, -6);

      const [members, membershipPayments, donations] = await Promise.all([
        db
          .select()
          .from(schema.members)
          .where(gte(schema.members.createdAt, windowStart)),
        db
          .select()
          .from(schema.payments)
          .where(eq(schema.payments.status, "completed")),
        db
          .select()
          .from(schema.donations)
          .where(eq(schema.donations.status, "completed")),
      ]);

      const monthlyMap = new Map<string, number>();
      const monthlyOrder: string[] = [];
      for (let i = 0; i < 7; i += 1) {
        const d = addMonths(windowStart, i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, 0);
        monthlyOrder.push(key);
      }

      for (const member of members) {
        const createdAt = new Date(member.createdAt);
        const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
        }
      }

      const completedMembershipPayments = membershipPayments.filter(
        (p) => p.type === "membership" || p.type === "membership_renewal",
      );

      const membershipETB = completedMembershipPayments
        .filter((p) => p.currency === "ETB")
        .reduce((sum, p) => sum + p.amount, 0);
      const membershipUSD = completedMembershipPayments
        .filter((p) => p.currency === "USD")
        .reduce((sum, p) => sum + p.amount, 0);
      const donationETB = donations
        .filter((d) => d.currency === "ETB")
        .reduce((sum, d) => sum + d.amount, 0);
      const donationUSD = donations
        .filter((d) => d.currency === "USD")
        .reduce((sum, d) => sum + d.amount, 0);

      const totalMembersResult = await db.select().from(schema.members);
      const totalMembers = totalMembersResult.length;

      const growth: DashboardGrowthPoint[] = monthlyOrder.map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const monthDate = new Date(Number(year), Number(month) - 1, 1);
        return {
          name: monthDate.toLocaleString("en-US", { month: "short" }),
          members: monthlyMap.get(monthKey) ?? 0,
        };
      });

      res.json({
        totalMembers,
        membershipETB,
        membershipUSD,
        donationETB,
        donationUSD,
        growth,
      });
    } catch (error) {
      console.error("[adminroute] dashboard", error);
      res.status(500).json({ error: "Failed to fetch admin dashboard stats" });
    }
  });
}
