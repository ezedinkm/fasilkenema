import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  insertMemberSchema,
  insertMembershipPaymentSchema,
  insertDonationSchema,
  insertPostSchema,
  insertPageSchema,
  insertSmsTemplateSchema,
  insertSmsLogSchema,
  insertSettingSchema,
  insertPaymentSchema,
  insertPendingMemberApplicationSchema,
  insertUsermessageSchema,
  posts,
  passwordResetTokens,
  membershipTiers,
  donationTiers,
  usermessage,
  watchReviews,
  postCategories,
  LEGACY_SMS_PUBLIC_BASE_URL_SETTING_KEY,
  PUBLIC_SITE_BASE_URL_SETTING_KEY,
  SMS_ICONIC_SETTING_KEYS,
} from "@shared/schema";
import { normalizeEthiopianMobileLocal } from "@shared/ethiopianPhone";
import { fromZodError } from "zod-validation-error";
import {
  sendPaymentNotificationWithTotal,
  deliverOtpSmsWithRetry,
  sendDonorThankYouSms,
  sendMembershipRenewalThankYouSms,
  sendMembershipWelcomeSms,
  sendPasswordResetSuccessSms,
  userFacingSmsFailureMessage,
} from "./iconicSms";
import crypto from "crypto";
import { eq, and, gt, asc, desc, sql } from "drizzle-orm";
import { JWT_SECRET, authenticateToken } from "./middleware/authMiddleware";
import { upload, uploadsDir } from "./middleware/multerConfig";
import { registerTeamAdminRoutes } from "./teamAdminRoutes";
import { registerAdminRoutes } from "./adminroute";
import { registerNewsletterRoutes } from "./newsletterRoutes";
import eplRoutes from "./routes/eplRoutes.js";
import scrapeRoutes from "./routes/scrapeRoutes.js";
/** Must match `deliverOtpSms` / `/api/otp/send` body `purpose` (delivery uses `deliverOtpSmsWithRetry`). */
type OtpPurpose = "registration" | "password_reset";

type ChapaConfig = {
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
  sandboxMode: boolean;
};

async function getChapaConfig(): Promise<ChapaConfig> {
  const publicKeySetting = await storage.getSettingByKey(
    "payments.chapa.publicKey",
  );
  const secretKeySetting = await storage.getSettingByKey(
    "payments.chapa.secretKey",
  );
  const webhookUrlSetting = await storage.getSettingByKey(
    "payments.chapa.webhookUrl",
  );
  const sandboxModeSetting = await storage.getSettingByKey(
    "payments.chapa.sandboxMode",
  );

  const publicKeyFromSetting = String(
    parseSettingValue(publicKeySetting?.value) || "",
  ).trim();
  const secretKeyFromSetting = String(
    parseSettingValue(secretKeySetting?.value) || "",
  ).trim();
  const webhookUrlFromSetting = String(
    parseSettingValue(webhookUrlSetting?.value) || "",
  ).trim();
  const sandboxModeRaw = parseSettingValue(sandboxModeSetting?.value);
  const sandboxMode = sandboxModeRaw === true || sandboxModeRaw === "true";

  // Environment variables are supported as fallback for secure deployment.
  const publicKey = String(
    publicKeyFromSetting || process.env.CHAPA_PUBLIC_KEY || "",
  ).trim();
  const secretKey = String(
    secretKeyFromSetting || process.env.CHAPA_SECRET_KEY || "",
  ).trim();
  const webhookUrl = String(
    webhookUrlFromSetting || process.env.CHAPA_WEBHOOK_URL || "",
  ).trim();

  return { publicKey, secretKey, webhookUrl, sandboxMode };
}

function sanitizeChapaPhone(primary: unknown, fallback: unknown = ""): string {
  const fromPrimary = normalizeEthiopianMobileLocal(
    String(primary || "").trim(),
  );
  if (fromPrimary) return fromPrimary;
  const fromFallback = normalizeEthiopianMobileLocal(
    String(fallback || "").trim(),
  );
  return fromFallback || "";
}

function resolveChapaCallbackUrl(
  configuredWebhook: string,
  baseUrl: string,
): string {
  const fallback = `${baseUrl}/api/chapa/callback`;
  const value = String(configuredWebhook || "").trim();
  if (!value) return fallback;

  try {
    const parsed = new URL(value);
    // Allow https everywhere and http only for local development.
    if (parsed.protocol === "https:") return value;
    if (
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return value;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

let donationTiersTableReady = false;
let userMessageTableReady = false;
let watchReviewsTableReady = false;
let postContentSchemaReady = false;
let membershipTiersSchemaReady = false;

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
      phone text NOT NULL,
      email text,
      subject text NOT NULL,
      message text NOT NULL,
      status text NOT NULL DEFAULT 'needs_contact',
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    ALTER TABLE usermessage
    ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
  `);
  await db.execute(sql`
    ALTER TABLE usermessage
    ALTER COLUMN phone DROP DEFAULT,
    ALTER COLUMN email DROP NOT NULL;
  `);
  await db.execute(sql`
    ALTER TABLE usermessage
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'needs_contact';
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

function slugifyPostValue(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function makeUniquePostSlug(candidate: string, title: string): Promise<string> {
  const base =
    slugifyPostValue(candidate) ||
    slugifyPostValue(title) ||
    `news-${Date.now().toString(36)}`;
  let slug = base;
  let suffix = 2;

  while (await storage.getPostBySlug(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function ensurePostContentSchema(): Promise<void> {
  if (postContentSchemaReady) {
    return;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS post_categories (
      id serial PRIMARY KEY,
      name text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS post_categories_name_lower_unique
    ON post_categories (lower(name));
  `);

  const featuredColumn = await db.execute(sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'posts'
      AND column_name = 'is_featured'
    LIMIT 1;
  `);
  const isFeaturedColumnNew = featuredColumn.rowCount === 0;
  await db.execute(sql`
    ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
  `);
  if (isFeaturedColumnNew) {
    await db.execute(sql`UPDATE posts SET is_featured = true;`);
  }

  await db.execute(sql`
    INSERT INTO post_categories (name)
    SELECT DISTINCT btrim(category)
    FROM posts
    WHERE NULLIF(btrim(category), '') IS NOT NULL
    ON CONFLICT DO NOTHING;
  `);

  const postsMissingSlugs = await db
    .select({ id: posts.id, titleEn: posts.titleEn })
    .from(posts)
    .where(sql`btrim(${posts.slug}) = ''`);
  for (const post of postsMissingSlugs) {
    const slug = await makeUniquePostSlug("", post.titleEn);
    await storage.updatePost(post.id, { slug });
  }

  postContentSchemaReady = true;
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

function parseSettingValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function normalizeBillingCycle(raw: unknown): "annual" | "monthly" {
  return String(raw || "").toLowerCase() === "monthly" ? "monthly" : "annual";
}

function getMembershipExpiryDate(billingCycle: "annual" | "monthly"): Date {
  const expiryDate = new Date();
  if (billingCycle === "monthly") {
    expiryDate.setDate(expiryDate.getDate() + 30);
  } else {
    expiryDate.setDate(expiryDate.getDate() + 365);
  }
  return expiryDate;
}

function getMemberStatusByExpiry(expiryDate: Date): "active" | "expired" {
  return expiryDate.getTime() > Date.now() ? "active" : "expired";
}

function getRenewalExpiryDate(
  _currentExpiry: unknown,
  billingCycle: "annual" | "monthly",
): Date {
  const now = new Date();
  const baseDate = new Date(now);

  if (billingCycle === "monthly") {
    baseDate.setDate(baseDate.getDate() + 30);
  } else {
    baseDate.setDate(baseDate.getDate() + 365);
  }
  return baseDate;
}

async function createMembershipTransactionIfMissing(input: {
  memberId: number;
  transactionId: string;
  amount: number;
  currency: string;
  tier: string;
}) {
  const payload = {
    memberId: input.memberId,
    transactionId: input.transactionId,
    amount: input.amount,
    currency: input.currency,
    tier: input.tier,
    paymentMethod: "chapa",
    status: "completed",
    paidAt: new Date(),
  };

  const validated = insertMembershipPaymentSchema.safeParse(payload);
  if (!validated.success) {
    throw new Error(fromZodError(validated.error).message);
  }

  try {
    await storage.createPayment(validated.data);
  } catch (error: any) {
    // Safe idempotency for callback + verify race on same transaction id.
    if (error?.code === "23505") {
      return;
    }
    throw error;
  }
}

/**
 * Alerts the club office when a membership or donation payment completes.
 * Only SMS is used here (no payment emails): staff need the notify phone and SMS enabled in Settings
 * so revenue totals are texted instantly for reconciliation, without relying on email lists.
 */
async function sendPaymentNotifications(
  type: "membership" | "donation",
  amount: number,
  currency: string,
) {
  try {
    const stats = await storage.getRevenueStats();
    const totalETB = stats.membershipETB + stats.donationETB;
    const totalUSD = stats.membershipUSD + stats.donationUSD;

    await sendSmsNotification(type, amount, currency, totalETB, totalUSD);
  } catch (error) {
    console.error("Error sending payment notifications:", error);
  }
}

async function sendSmsNotification(
  type: "membership" | "donation",
  amount: number,
  currency: string,
  totalETB: number,
  totalUSD: number,
) {
  try {
    const smsEnabledSetting = await storage.getSettingByKey(
      "notifications.smsEnabled",
    );
    const phoneSetting = await storage.getSettingByKey("notifications.phone");

    const smsEnabledValue = parseSettingValue(smsEnabledSetting?.value);
    const smsEnabled = smsEnabledValue === "true" || smsEnabledValue === true;
    const phoneRaw = parseSettingValue(phoneSetting?.value) as string;
    const phone = phoneRaw
      ? normalizeEthiopianMobileLocal(String(phoneRaw).trim())
      : null;

    if (smsEnabled && phone) {
      const result = await sendPaymentNotificationWithTotal(
        type,
        amount,
        currency,
        phone,
        totalETB,
        totalUSD,
      );

      if (result.success) {
        console.log(
          `SMS notification sent for ${type} payment: ${amount} ${currency}`,
        );
      } else {
        console.error(`Failed to send SMS notification: ${result.error}`);
      }
    } else {
      console.log(
        "SMS payment notification skipped (enable SMS and set notifications phone in Settings)",
        {
          smsEnabled,
          hasValidPhone: !!phone,
          type,
          amount,
          currency,
        },
      );
    }
  } catch (error) {
    console.error("Error sending SMS notification:", error);
  }
}

function extractChapaVerifiedPhoneFromVerifyData(
  verifyData: any,
): string | null {
  const data = verifyData?.data;
  if (!data || typeof data !== "object") return null;
  const candidates = [
    data.phone_number,
    data.phone,
    data.mobile,
    data.customer?.phone_number,
    data.customer?.phone,
  ];
  for (const c of candidates) {
    const key = normalizeEthiopianMobileLocal(String(c ?? "").trim());
    if (key) return key;
  }
  return null;
}

function queueDonorThankYouSmsFromChapa(
  verifyData: any,
  amount: number,
  currency: string,
) {
  const phone = extractChapaVerifiedPhoneFromVerifyData(verifyData);
  if (!phone) return;
  void sendDonorThankYouSms(phone, amount, currency).catch((err) =>
    console.error("Donor thank-you SMS:", err),
  );
}

function queueMemberRenewalThankYouSms(
  memberPhone: string | null | undefined,
  amount: number,
  currency: string,
  newExpiry: Date,
) {
  const key = normalizeEthiopianMobileLocal(String(memberPhone ?? "").trim());
  if (!key) return;
  void sendMembershipRenewalThankYouSms(key, amount, currency, newExpiry).catch(
    (err) => console.error("Member renewal SMS:", err),
  );
}

type ChapaReturnKind = "donation" | "membership" | "renewal";

async function getPublicBaseUrlFromRequest(req: Request): Promise<string> {
  const baseUrlSetting =
    (await storage.getSettingByKey(PUBLIC_SITE_BASE_URL_SETTING_KEY)) ??
    (await storage.getSettingByKey(LEGACY_SMS_PUBLIC_BASE_URL_SETTING_KEY));
  const fromDb = String(parseSettingValue(baseUrlSetting?.value) ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (fromDb) return fromDb;
  const fromEnv = String(process.env.APP_BASE_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  return `${req.protocol}://${req.get("host")}`;
}

function buildChapaReturnUrl(
  baseUrl: string,
  txRef: string,
  kind: ChapaReturnKind,
): string {
  const token = jwt.sign({ txRef, kind }, JWT_SECRET, { expiresIn: "2h" });
  return `${baseUrl}/api/chapa/return?token=${encodeURIComponent(token)}`;
}

async function finalizeChapaReturnDonation(
  txRef: string,
): Promise<"success" | "failed" | "pending"> {
  const donation = await storage.getDonationByTransactionId(txRef);
  if (!donation) return "failed";
  if (donation.status === "completed") return "success";

  const chapaConfig = await getChapaConfig();
  if (!chapaConfig.secretKey) return "failed";

  const verifyResponse = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${txRef}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${chapaConfig.secretKey}` },
    },
  );
  const verifyData = await verifyResponse.json();

  if (verifyData.status !== "success") return "failed";

  if (verifyData.data.status === "success") {
    const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
    const chapaCurrency = String(verifyData.data.currency).toUpperCase();
    const expectedCurrency = String(donation.currency).toUpperCase();
    const chapaEmail = String(
      verifyData.data.email ?? verifyData.data.customer?.email ?? "",
    )
      .trim()
      .toLowerCase();
    const emailMatches =
      !chapaEmail ||
      chapaEmail === String(donation.donorEmail).trim().toLowerCase();

    if (
      !emailMatches ||
      chapaAmount !== donation.amount ||
      chapaCurrency !== expectedCurrency
    ) {
      return "failed";
    }

    const donationUpdated = await storage.updateDonationStatusIfPending(
      donation.id,
      "completed",
    );
    if (!donationUpdated) {
      const latestDonation = await storage.getDonationByTransactionId(txRef);
      if (latestDonation?.status === "completed") return "success";
      return "failed";
    }

    sendPaymentNotifications(
      "donation",
      donationUpdated.amount,
      donationUpdated.currency,
    );
    queueDonorThankYouSmsFromChapa(
      verifyData,
      donationUpdated.amount,
      donationUpdated.currency,
    );
    return "success";
  }

  if (verifyData.data?.status === "pending") return "pending";
  return "failed";
}

async function finalizeChapaReturnMembership(
  txRef: string,
): Promise<"success" | "failed" | "pending"> {
  const payment = await storage.getPaymentByTransactionId(txRef);
  if (!payment || payment.type !== "membership") return "failed";
  if (payment.status === "completed") return "success";

  const chapaConfig = await getChapaConfig();
  if (!chapaConfig.secretKey) return "failed";

  const verifyResponse = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${txRef}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${chapaConfig.secretKey}` },
    },
  );
  const verifyData = await verifyResponse.json();

  if (verifyData.status !== "success") return "failed";

  if (verifyData.data.status !== "success") {
    return verifyData.data?.status === "pending" ? "pending" : "failed";
  }

  const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
  const chapaCurrency = String(verifyData.data.currency).toUpperCase();
  const expectedCurrency = String(payment.currency).toUpperCase();

  if (chapaAmount !== payment.amount || chapaCurrency !== expectedCurrency)
    return "failed";

  const application = await storage.getPendingMemberApplicationByTxId(txRef);
  if (!application) return "failed";

  const paymentUserId = (payment.metadata as any)?.userId;
  if (
    paymentUserId !== undefined &&
    paymentUserId !== null &&
    Number(paymentUserId) !== application.id
  ) {
    return "failed";
  }

  const paymentUpdated = await storage.updateGenericPaymentStatusIfPending(
    payment.id,
    "completed",
  );
  if (!paymentUpdated) {
    const latestPayment = await storage.getPaymentByTransactionId(txRef);
    if (latestPayment?.status === "completed") return "success";
    return "failed";
  }

  const membershipNumber = `FK-${Date.now()}`;
  const idNumber = `FKFC-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
  const billingCycleFromPayment = normalizeBillingCycle(
    (payment.metadata as any)?.billingCycle,
  );
  const expiryDate = getMembershipExpiryDate(billingCycleFromPayment);
  const memberStatus = getMemberStatusByExpiry(expiryDate);

  const memberData = {
    membershipNumber,
    fullName: `${application.firstName} ${application.lastName}`,
    email: null,
    phone: application.phone,
    password: application.password || null,
    idNumber,
    rank: application.rank || null,
    gender: application.gender || null,
    address: application.address || null,
    division: application.division || null,
    dateOfBirth: application.dateOfBirth,
    city: application.city,
    country: application.country,
    tier: application.membershipTier,
    photoUrl: application.photoUrl || null,
    status: memberStatus,
    expiryDate,
  };

  try {
    const member = await storage.createMember(memberData);
    await createMembershipTransactionIfMissing({
      memberId: member.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      tier: application.membershipTier,
    });
    await storage.deletePendingMemberApplication(txRef);
    sendPaymentNotifications("membership", payment.amount, payment.currency);
    void sendMembershipWelcomeSms(
      member.phone,
      member.fullName,
      member.membershipNumber,
    ).catch((err) => console.error("Membership welcome SMS:", err));
    return "success";
  } catch (e) {
    const existingMember = await storage.getMemberByPhone(application.phone);
    if (existingMember) {
      await createMembershipTransactionIfMissing({
        memberId: existingMember.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        tier: application.membershipTier,
      });
      await storage.deletePendingMemberApplication(txRef);
      sendPaymentNotifications("membership", payment.amount, payment.currency);
      return "success";
    }
    await storage.updateGenericPaymentStatus(payment.id, "pending");
    console.error("Membership finalize error (return):", e);
    return "failed";
  }
}

async function finalizeChapaReturnRenewal(
  txRef: string,
): Promise<"success" | "failed" | "pending"> {
  const payment = await storage.getPaymentByTransactionId(txRef);
  if (!payment || payment.type !== "membership_renewal") return "failed";
  if (payment.status === "completed") return "success";

  const chapaConfig = await getChapaConfig();
  if (!chapaConfig.secretKey) return "failed";

  const verifyResponse = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${txRef}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${chapaConfig.secretKey}` },
    },
  );
  const verifyData = await verifyResponse.json();
  if (
    verifyData.status !== "success" ||
    verifyData.data?.status !== "success"
  ) {
    return verifyData.data?.status === "pending" ? "pending" : "failed";
  }

  const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
  const chapaCurrency = String(verifyData.data.currency).toUpperCase();
  const expectedCurrency = String(payment.currency).toUpperCase();
  if (chapaAmount !== payment.amount || chapaCurrency !== expectedCurrency)
    return "failed";

  const paymentUserId = Number((payment.metadata as any)?.userId);
  const renewalTier = String(
    (payment.metadata as any)?.membershipTier || "",
  ).trim();
  const renewalBilling = normalizeBillingCycle(
    (payment.metadata as any)?.billingCycle,
  );
  if (!paymentUserId || !renewalTier) return "failed";

  const member = await storage.getMemberById(paymentUserId);
  if (!member) return "failed";

  const paymentUpdated = await storage.updateGenericPaymentStatusIfPending(
    payment.id,
    "completed",
  );
  if (!paymentUpdated) {
    const latestPayment = await storage.getPaymentByTransactionId(txRef);
    if (latestPayment?.status === "completed") return "success";
    return "failed";
  }

  const renewalExpiryDate = getRenewalExpiryDate(
    member.expiryDate,
    renewalBilling,
  );
  const renewalStatus = getMemberStatusByExpiry(renewalExpiryDate);
  await storage.updateMember(member.id, {
    tier: renewalTier,
    expiryDate: renewalExpiryDate,
    status: renewalStatus,
  });
  await createMembershipTransactionIfMissing({
    memberId: member.id,
    transactionId: payment.transactionId,
    amount: payment.amount,
    currency: payment.currency,
    tier: renewalTier,
  });

  sendPaymentNotifications("membership", payment.amount, payment.currency);
  queueMemberRenewalThankYouSms(
    member.phone,
    payment.amount,
    payment.currency,
    renewalExpiryDate,
  );
  return "success";
}

export async function registerRoutes(app: Express): Promise<Server> {
  const express = await import("express");
  app.use("/uploads", express.default.static(uploadsDir));

  registerTeamAdminRoutes(app);
  registerAdminRoutes(app);
  registerNewsletterRoutes(app);
  app.use("/api", eplRoutes);
  app.use("/api", scrapeRoutes);

  app.post("/api/upload", upload.single("photo"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const photoUrl = `/uploads/${req.file.filename}`;
      res.json({ photoUrl });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/membership-tiers", async (_req, res) => {
    try {
      await ensureMembershipTiersSchema();

      const tiers = await db
        .select()
        .from(membershipTiers)
        .orderBy(asc(membershipTiers.createdAt));

      const normalizedTiers = tiers.map((tier) => ({
        id: tier.id,
        amharicVersion: tier.amharicVersion,
        priceEtb: Number(tier.priceEtb),
        priceUsd: Number(tier.priceUsd),
        monthlyPriceEtb: Number((tier as any).monthlyPriceEtb ?? 0),
        monthlyPriceUsd: Number((tier as any).monthlyPriceUsd ?? 0),
        frontBackgroundUrl: tier.frontBackgroundUrl ?? null,
      }));

      res.json(normalizedTiers);
    } catch (error) {
      console.error("Failed to fetch membership tiers:", error);
      res.status(500).json({ error: "Failed to fetch membership tiers" });
    }
  });

  app.get("/api/donation-tiers", async (_req, res) => {
    try {
      await ensureDonationTiersTableExists();

      const tiers = await db
        .select()
        .from(donationTiers)
        .orderBy(asc(donationTiers.sortOrder), asc(donationTiers.id));

      res.json(
        tiers.map((tier) => ({
          id: String(tier.id),
          amount: Number(tier.amount),
          label: tier.label,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch donation tiers:", error);
      res.status(500).json({ error: "Failed to fetch donation tiers" });
    }
  });

  app.post("/api/contact-messages", async (req, res) => {
    try {
      await ensureUserMessageTableExists();

      const payload = {
        fullName: String(req.body?.fullName ?? "").trim(),
        phone: String(req.body?.phone ?? "").trim(),
        email: String(req.body?.email ?? "")
          .trim()
          .toLowerCase() || null,
        subject: String(req.body?.subject ?? "").trim(),
        message: String(req.body?.message ?? "").trim(),
      };

      if (
        !payload.fullName ||
        !payload.phone ||
        !payload.subject ||
        !payload.message
      ) {
        return res.status(400).json({
          error: "Name, phone, subject, and message are required",
        });
      }

      if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        return res.status(400).json({ error: "Enter a valid email address" });
      }

      const validation = insertUsermessageSchema.safeParse(payload);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      const [created] = await db
        .insert(usermessage)
        .values(validation.data)
        .returning();
      res.status(201).json({ success: true, id: created.id });
    } catch (error) {
      console.error("Failed to store contact message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/watch-reviews", async (_req, res) => {
    try {
      await ensureWatchReviewsTableExists();
      const rows = await db
        .select()
        .from(watchReviews)
        .orderBy(desc(watchReviews.createdAt));
      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch watch reviews:", error);
      res.status(500).json({ error: "Failed to fetch watch reviews" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("emanuel");
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);

      console.log("email, password", email, password);
      console.log("admin", admin);

      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // const validPassword = await bcrypt.compare(password, admin.password);
      // if (!validPassword) {
      //   return res.status(401).json({ error: 'Invalid credentials' });
      // }

      const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
        expiresIn: "24h",
      });
      res.json({
        token,
        admin: { id: admin.id, email: admin.email, fullName: admin.fullName },
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/member/login", async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res
          .status(400)
          .json({ error: "Phone number and password are required" });
      }

      const member = await storage.getMemberByPhone(phone);

      if (!member) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!member.password) {
        return res
          .status(401)
          .json({
            error:
              'Your account does not have a password yet. Please use "Forgot Password?" to set one.',
            needsPasswordSetup: true,
          });
      }

      const validPassword = await bcrypt.compare(password, member.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (member.status !== "active" && member.status !== "expired") {
        return res.status(403).json({ error: "Membership is not active" });
      }

      const token = jwt.sign(
        {
          id: member.id,
          membershipNumber: member.membershipNumber,
          type: "member",
        },
        JWT_SECRET,
        { expiresIn: "30d" },
      );

      res.json({
        token,
        member: {
          id: member.id,
          membershipNumber: member.membershipNumber,
          fullName: member.fullName,
          phone: member.phone,
          idNumber: member.idNumber,
          rank: member.rank,
          gender: member.gender,
          address: member.address,
          division: member.division,
          tier: member.tier,
          photoUrl: member.photoUrl,
          joinedDate: member.joinedDate,
          expiryDate: member.expiryDate,
          status: member.status,
        },
      });
    } catch (error) {
      console.error("Member login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/otp/send", async (req, res) => {
    try {
      const { phone, purpose } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const phoneKey = normalizeEthiopianMobileLocal(String(phone).trim());
      if (!phoneKey) {
        return res.status(400).json({
          error:
            "Enter a valid Ethiopian mobile number (09xxxxxxxx, 07xxxxxxxx, or +251…).",
        });
      }

      if (!purpose || !["registration", "password_reset"].includes(purpose)) {
        return res.status(400).json({ error: "Valid purpose is required" });
      }

      if (purpose === "password_reset") {
        const member = await storage.getMemberByPhone(phoneKey);
        if (!member) {
          return res.json({
            success: true,
            sent: false,
            message:
              "If this number is registered, you will receive an SMS. Otherwise no code was sent.",
          });
        }
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      try {
        await storage.createOtp(phoneKey, code, purpose, expiresAt);
      } catch (dbErr) {
        console.error("[otp/send] createOtp:", dbErr);
        return res.status(500).json({
          error:
            "Could not create a verification code. Please try again in a moment.",
          success: false,
          sent: false,
        });
      }

      const smsResult = await deliverOtpSmsWithRetry(
        phoneKey,
        code,
        purpose as OtpPurpose,
      );
      if (!smsResult.success) {
        await storage.deleteOtpsForPhoneAndPurpose(phoneKey, purpose);
        console.error("Failed to send OTP SMS:", smsResult.error);
        return res.status(502).json({
          error: userFacingSmsFailureMessage(smsResult.error),
          success: false,
          sent: false,
        });
      }

      res.json({ message: "OTP sent successfully", success: true, sent: true });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { phone, code, purpose } = req.body;

      if (!phone || !code || !purpose) {
        return res
          .status(400)
          .json({ error: "Phone, code, and purpose are required" });
      }

      const phoneKey = normalizeEthiopianMobileLocal(String(phone).trim());
      if (!phoneKey) {
        return res.status(400).json({ error: "Invalid phone number format." });
      }
      const otp = await storage.getValidOtp(phoneKey, code, purpose);

      if (!otp) {
        return res.status(400).json({ error: "Invalid or expired OTP code" });
      }

      await storage.markOtpVerified(otp.id);

      res.json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.post("/api/member/forgot-password", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const phoneKey = normalizeEthiopianMobileLocal(String(phone).trim());
      if (!phoneKey) {
        return res.status(400).json({
          error:
            "Enter a valid Ethiopian mobile number (09xxxxxxxx, 07xxxxxxxx, or +251…).",
        });
      }

      const member = await storage.getMemberByPhone(phoneKey);

      if (!member) {
        return res.json({
          success: true,
          sent: false,
          message:
            "If this number is registered to a member account, you will receive an SMS with a reset code. Otherwise, no message was sent.",
        });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      try {
        await storage.createOtp(phoneKey, code, "password_reset", expiresAt);
      } catch (dbErr) {
        console.error("[forgot-password] createOtp:", dbErr);
        return res.status(500).json({
          success: false,
          sent: false,
          error:
            "Could not save your verification code. Please try again in a moment.",
        });
      }

      if (process.env.DEV_LOG_OTP === "1") {
        console.warn(
          `[forgot-password] OTP for ${phoneKey}: ${code} (DEV_LOG_OTP=1 — remove in shared environments)`,
        );
      }

      const smsResult = await deliverOtpSmsWithRetry(
        phoneKey,
        code,
        "password_reset",
      );
      if (!smsResult.success) {
        await storage.deleteOtpsForPhoneAndPurpose(phoneKey, "password_reset");
        console.error("[forgot-password] SMS send failed:", smsResult.error);
        return res.status(502).json({
          success: false,
          sent: false,
          error: userFacingSmsFailureMessage(smsResult.error),
        });
      }

      return res.json({
        success: true,
        sent: true,
        message: "A verification code was sent to your phone by SMS.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong. Please try again in a moment." });
    }
  });

  /** Check SMS code before showing the new-password step. Wrong code invalidates the stored OTP. */
  app.post("/api/member/forgot-password/verify-otp", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || otp == null || String(otp).trim() === "") {
        return res
          .status(400)
          .json({ error: "Phone and verification code are required." });
      }

      const phoneKey = normalizeEthiopianMobileLocal(String(phone).trim());
      if (!phoneKey) {
        return res.status(400).json({
          error:
            "Enter a valid Ethiopian mobile number (09xxxxxxxx, 07xxxxxxxx, or +251…).",
        });
      }

      const member = await storage.getMemberByPhone(phoneKey);
      if (!member) {
        return res
          .status(404)
          .json({ error: "No member account found for this number." });
      }

      const otpCode = String(otp).replace(/\s/g, "");
      const otpRecord = await storage.getValidOtp(
        phoneKey,
        otpCode,
        "password_reset",
      );

      if (!otpRecord) {
        await storage.deleteOtpsForPhoneAndPurpose(phoneKey, "password_reset");
        return res.status(400).json({
          error:
            "That code does not match or has expired. Tap “Resend SMS code” to get a new one.",
        });
      }

      return res.json({
        success: true,
        message: "Code verified. You can set a new password.",
      });
    } catch (error) {
      console.error("Forgot password verify-otp error:", error);
      res
        .status(500)
        .json({ error: "Could not verify the code. Please try again." });
    }
  });

  app.post("/api/member/reset-password", async (req, res) => {
    try {
      const { phone, otp, newPassword } = req.body;

      if (!phone || !otp || !newPassword) {
        return res
          .status(400)
          .json({ error: "Phone, OTP code, and new password are required" });
      }

      const phoneKey = normalizeEthiopianMobileLocal(String(phone).trim());
      if (!phoneKey) {
        return res.status(400).json({ error: "Invalid phone number format." });
      }

      const otpCode = String(otp).replace(/\s/g, "");

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const otpRecord = await storage.getValidOtp(
        phoneKey,
        otpCode,
        "password_reset",
      );

      if (!otpRecord) {
        await storage.deleteOtpsForPhoneAndPurpose(phoneKey, "password_reset");
        return res.status(422).json({
          error:
            "Invalid or expired code. Request a new SMS code and try again.",
        });
      }

      const member = await storage.getMemberByPhone(phoneKey);
      if (!member) {
        await storage.deleteOtpsForPhoneAndPurpose(phoneKey, "password_reset");
        return res.status(404).json({ error: "Member not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateMember(member.id, { password: hashedPassword });
      await storage.deleteOtpsForPhoneAndPurpose(phoneKey, "password_reset");

      void sendPasswordResetSuccessSms(phoneKey).catch((e) =>
        console.error("Password reset confirmation SMS:", e),
      );

      res.json({
        success: true,
        message:
          "Password has been reset successfully. You can sign in with your new password. You may receive a short confirmation SMS.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/member/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: number;
          membershipNumber: string;
          type: string;
        };

        if (decoded.type !== "member") {
          return res.status(403).json({ error: "Invalid token type" });
        }

        let member = await storage.getMemberById(decoded.id);

        if (!member) {
          return res.status(404).json({ error: "Member not found" });
        }

        // Keep member status aligned with expiry date.
        if (member.expiryDate) {
          const expiryDate = new Date(member.expiryDate);
          if (!Number.isNaN(expiryDate.getTime())) {
            const expectedStatus = getMemberStatusByExpiry(expiryDate);
            if (member.status !== expectedStatus) {
              const updated = await storage.updateMember(member.id, {
                status: expectedStatus,
              });
              if (updated) {
                member = updated;
              }
            }
          }
        }

        res.json({
          id: member.id,
          membershipNumber: member.membershipNumber,
          fullName: member.fullName,
          phone: member.phone,
          idNumber: member.idNumber,
          rank: member.rank,
          gender: member.gender,
          address: member.address,
          division: member.division,
          tier: member.tier,
          photoUrl: member.photoUrl,
          joinedDate: member.joinedDate,
          expiryDate: member.expiryDate,
          status: member.status,
        });
      } catch (jwtError) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    } catch (error) {
      console.error("Get member error:", error);
      res.status(500).json({ error: "Failed to get member data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await storage.createAdmin({
        email,
        password: hashedPassword,
        fullName,
      });
      res.json({ id: admin.id, email: admin.email, fullName: admin.fullName });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/member/renewal/initialize-payment", async (req, res) => {
    let payment: any = null;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        membershipNumber: string;
        type: string;
      };
      if (decoded.type !== "member") {
        return res.status(403).json({ error: "Invalid token type" });
      }

      const member = await storage.getMemberById(decoded.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      const { currency, membershipTier, billingCycle, chapaPhone } =
        req.body || {};
      if (!membershipTier) {
        return res.status(400).json({ error: "membershipTier is required" });
      }

      const paymentCurrency = String(currency || "ETB").toUpperCase();
      if (paymentCurrency !== "ETB" && paymentCurrency !== "USD") {
        return res
          .status(400)
          .json({ error: "Invalid currency. Use ETB or USD." });
      }
      const normalizedBillingCycle = normalizeBillingCycle(billingCycle);

      const tierRows = await db
        .select()
        .from(membershipTiers)
        .where(eq(membershipTiers.id, String(membershipTier)));
      const selectedTier = tierRows[0];
      if (!selectedTier) {
        return res.status(400).json({ error: "Invalid membership tier" });
      }

      const tierAmountRaw =
        paymentCurrency === "USD"
          ? Number(
              normalizedBillingCycle === "monthly"
                ? ((selectedTier as any).monthlyPriceUsd ??
                    selectedTier.priceUsd)
                : selectedTier.priceUsd,
            )
          : Number(
              normalizedBillingCycle === "monthly"
                ? ((selectedTier as any).monthlyPriceEtb ??
                    selectedTier.priceEtb)
                : selectedTier.priceEtb,
            );
      if (!Number.isFinite(tierAmountRaw) || tierAmountRaw <= 0) {
        return res
          .status(400)
          .json({ error: "Tier amount is invalid for selected currency" });
      }
      const amountNum = Math.round(tierAmountRaw);

      // User-bound + cryptographically random txRef to reduce predictability/collision risk.
      let txRef = "";
      let attempt = 0;
      while (attempt < 5) {
        const candidateTxRef = `REN-${member.id}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
        const existingPayment =
          await storage.getPaymentByTransactionId(candidateTxRef);
        if (!existingPayment) {
          txRef = candidateTxRef;
          break;
        }
        attempt += 1;
      }
      if (!txRef) {
        return res
          .status(500)
          .json({ error: "Failed to generate secure transaction reference" });
      }

      const paymentData = {
        transactionId: txRef,
        type: "membership_renewal",
        amount: amountNum,
        currency: paymentCurrency,
        paymentMethod: "chapa",
        status: "pending" as const,
        metadata: {
          userId: member.id,
          membershipTier: String(membershipTier),
          billingCycle: normalizedBillingCycle,
          renewalStartDate: new Date().toISOString(),
        },
      };

      const validation = insertPaymentSchema.safeParse(paymentData);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      payment = await storage.createGenericPayment(validation.data);

      const [firstName, ...restName] = String(member.fullName || "Member")
        .trim()
        .split(/\s+/);
      const lastName = restName.join(" ") || "Member";
      const checkoutPhone = sanitizeChapaPhone(chapaPhone, member.phone);
      const baseUrl = await getPublicBaseUrlFromRequest(req);
      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }
      if (!chapaConfig.publicKey) {
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        return res
          .status(500)
          .json({
            error: "Chapa public key not configured in Payment Gateways",
          });
      }

      const chapaPayload = {
        amount: amountNum.toString(),
        currency: paymentCurrency,
        email: member.email || null,
        first_name: firstName || "Member",
        last_name: lastName,
        phone_number: checkoutPhone,
        tx_ref: txRef,
        callback_url: resolveChapaCallbackUrl(chapaConfig.webhookUrl, baseUrl),
        return_url: buildChapaReturnUrl(baseUrl, txRef, "renewal"),
        customization: {
          title: "Fasil Kenema FC",
          description: "Membership Renewal",
        },
      };

      const chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapaPayload),
        },
      );

      if (!chapaResponse.ok) {
        const errorText = await chapaResponse.text();
        console.error("Chapa renewal init error:", errorText);
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        return res
          .status(500)
          .json({ error: "Failed to initialize renewal payment with Chapa" });
      }

      const chapaData = await chapaResponse.json();
      if (chapaData.status === "success" && chapaData.data?.checkout_url) {
        return res.json({
          success: true,
          checkoutUrl: chapaData.data.checkout_url,
        });
      }

      await storage.updateGenericPaymentStatus(payment.id, "failed");
      return res
        .status(500)
        .json({ error: "Failed to initialize renewal payment with Chapa" });
    } catch (error) {
      console.error("Renewal initialization error:", error);
      if (payment?.id) {
        await storage.updateGenericPaymentStatus(payment.id, "failed");
      }
      return res
        .status(500)
        .json({ error: "Failed to initialize renewal payment" });
    }
  });

  app.get("/api/members", authenticateToken, async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", authenticateToken, async (req, res) => {
    try {
      const member = await storage.getMemberById(parseInt(req.params.id));
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validation = insertMemberSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const member = await storage.createMember(validation.data);
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id", authenticateToken, async (req, res) => {
    try {
      const member = await storage.updateMember(
        parseInt(req.params.id),
        req.body,
      );
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteMember(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  /** Admin-only: create a member without going through Chapa (no payment). */
  app.post("/api/admin/members", authenticateToken, async (req, res) => {
    try {
      const body = req.body || {};
      const {
        fullName,
        phone,
        dateOfBirth,
        country,
        city,
        tier,
        email,
        password,
        status,
        membershipNumber,
        photoUrl,
        gender,
        rank,
        address,
        division,
        expiryDate,
      } = body;

      if (!fullName || !phone || !dateOfBirth || !country || !city || !tier) {
        return res.status(400).json({
          error:
            "Missing required fields: fullName, phone, dateOfBirth, country, city, tier",
        });
      }

      const phoneNormalized = normalizeEthiopianMobileLocal(
        String(phone).trim(),
      );
      if (!phoneNormalized) {
        return res.status(400).json({
          error:
            "Invalid phone number. Use Ethiopian mobile format: 09xxxxxxxx, 07xxxxxxxx, or +251…",
        });
      }

      const existingPhone = await storage.getMemberByPhone(phoneNormalized);
      if (existingPhone) {
        return res
          .status(409)
          .json({ error: "A member with this phone number already exists" });
      }

      const tierRows = await db
        .select()
        .from(membershipTiers)
        .where(eq(membershipTiers.id, String(tier).trim()));
      if (!tierRows[0]) {
        return res
          .status(400)
          .json({
            error: "Invalid membership tier. Choose a tier from the list.",
          });
      }

      const memberNumber =
        String(membershipNumber || "").trim() || `FK-${Date.now()}`;
      const existingNumber = await storage.getMemberByNumber(memberNumber);
      if (existingNumber) {
        return res
          .status(409)
          .json({ error: "This membership number is already in use" });
      }

      let hashedPassword: string | undefined;
      if (password != null && String(password).trim().length > 0) {
        if (String(password).length < 6) {
          return res
            .status(400)
            .json({
              error: "Password must be at least 6 characters when provided",
            });
        }
        hashedPassword = await bcrypt.hash(String(password), 10);
      }

      let expiry: Date;
      if (expiryDate) {
        const d = new Date(expiryDate);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ error: "Invalid expiry date" });
        }
        expiry = d;
      } else {
        expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
      }

      const statusStr = String(status || "active").trim();
      const allowedStatus = ["active", "expired", "pending"];
      const memberStatus = allowedStatus.includes(statusStr)
        ? statusStr
        : "active";

      const payload = {
        membershipNumber: memberNumber,
        fullName: String(fullName).trim(),
        email: email ? String(email).trim().toLowerCase() : null,
        phone: phoneNormalized,
        password: hashedPassword ?? null,
        idNumber: null,
        rank: rank != null && String(rank).trim() ? String(rank).trim() : null,
        gender:
          gender != null && String(gender).trim()
            ? String(gender).trim()
            : null,
        address:
          address != null && String(address).trim()
            ? String(address).trim()
            : null,
        division:
          division != null && String(division).trim()
            ? String(division).trim()
            : null,
        dateOfBirth: String(dateOfBirth).trim(),
        country: String(country).trim(),
        city: String(city).trim(),
        tier: String(tier).trim(),
        photoUrl:
          photoUrl != null && String(photoUrl).trim()
            ? String(photoUrl).trim()
            : null,
        status: memberStatus,
        expiryDate: expiry,
      };

      const validation = insertMemberSchema.safeParse(payload);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      const member = await storage.createMember(validation.data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Admin create member error:", error);
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.get("/api/payments", authenticateToken, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validation = insertMembershipPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const payment = await storage.createPayment(validation.data);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.patch("/api/payments/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(
        parseInt(req.params.id),
        status,
      );
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  app.get("/api/donations", authenticateToken, async (req, res) => {
    try {
      const donations = await storage.getDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  app.post("/api/donations", async (req, res) => {
    try {
      const validation = insertDonationSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const donation = await storage.createDonation(validation.data);
      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create donation" });
    }
  });

  app.patch("/api/donations/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const donation = await storage.updateDonationStatus(
        parseInt(req.params.id),
        status,
      );
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }
      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update donation status" });
    }
  });

  app.post("/api/donations/initialize-payment", async (req, res) => {
    let donation: any = null;
    try {
      const {
        amount,
        currency,
        firstName,
        lastName,
        email,
        phone,
        chapaPhone,
        isAnonymous,
      } = req.body;

      if (!amount || !firstName || !lastName || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Trim and validate email
      const cleanEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: "Invalid email address format" });
      }

      // Trim other fields
      const cleanFirstName = String(firstName).trim();
      const cleanLastName = String(lastName).trim();
      const cleanPhone = phone ? String(phone).trim() : "";
      if (cleanPhone) {
        const p = normalizeEthiopianMobileLocal(cleanPhone);
        if (!p) {
          return res.status(400).json({
            error:
              "Invalid phone number. Use Ethiopian mobile format: 09xxxxxxxx, 07xxxxxxxx, or +251…",
          });
        }
      }
      const checkoutPhone = sanitizeChapaPhone(chapaPhone, cleanPhone);

      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum <= 0 || !Number.isInteger(amountNum)) {
        return res
          .status(400)
          .json({ error: "Invalid amount - must be a positive whole number" });
      }

      const txRef = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const donationCurrency = String(currency || "ETB").toUpperCase();
      if (donationCurrency !== "ETB" && donationCurrency !== "USD") {
        return res
          .status(400)
          .json({ error: "Invalid currency. Use ETB or USD." });
      }

      const donationData = {
        transactionId: txRef,
        donorName: `${cleanFirstName} ${cleanLastName}`,
        donorEmail: cleanEmail,
        amount: amountNum,
        currency: donationCurrency,
        isAnonymous: isAnonymous || false,
        paymentMethod: "chapa",
        status: "pending" as const,
      };

      const validation = insertDonationSchema.safeParse(donationData);
      if (!validation.success) {
        console.error(
          "Donation validation failed:",
          fromZodError(validation.error).message,
        );
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      donation = await storage.createDonation(validation.data);

      const baseUrl = await getPublicBaseUrlFromRequest(req);
      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        await storage.updateDonationStatus(donation.id, "failed");
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }
      if (!chapaConfig.publicKey) {
        await storage.updateDonationStatus(donation.id, "failed");
        return res
          .status(500)
          .json({
            error: "Chapa public key not configured in Payment Gateways",
          });
      }

      const chapaPayload = {
        amount: amountNum.toString(),
        currency: donationCurrency,
        email: cleanEmail,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        phone_number: checkoutPhone,
        tx_ref: txRef,
        callback_url: resolveChapaCallbackUrl(chapaConfig.webhookUrl, baseUrl),
        return_url: buildChapaReturnUrl(baseUrl, txRef, "donation"),
        customization: {
          title: "Fasil Kenema FC",
          description: "Support Fasil Kenema FC",
        },
      };

      console.log("Chapa payload:", JSON.stringify(chapaPayload, null, 2));

      const chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapaPayload),
        },
      );

      if (!chapaResponse.ok) {
        const errorText = await chapaResponse.text();
        console.error("Chapa API error:", errorText);
        await storage.updateDonationStatus(donation.id, "failed");
        return res
          .status(500)
          .json({ error: "Failed to initialize payment with Chapa" });
      }

      const chapaData = await chapaResponse.json();

      if (chapaData.status === "success" && chapaData.data?.checkout_url) {
        res.json({
          success: true,
          checkoutUrl: chapaData.data.checkout_url,
        });
      } else {
        console.error("Chapa returned non-success status:", chapaData);
        await storage.updateDonationStatus(donation.id, "failed");
        res
          .status(500)
          .json({ error: "Failed to initialize payment with Chapa" });
      }
    } catch (error) {
      console.error("Chapa initialization error:", error);
      if (donation?.id) {
        await storage.updateDonationStatus(donation.id, "failed");
      }
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  app.post("/api/members/initialize-payment", async (req, res) => {
    let payment: any = null;
    let txRef: string | null = null;
    try {
      const {
        currency,
        firstName,
        lastName,
        phone,
        chapaPhone,
        dateOfBirth,
        city,
        country,
        membershipTier,
        billingCycle,
      } = req.body;
      console.log("Request body this is :", req.body);
      if (
        !firstName ||
        !lastName ||
        !phone ||
        !dateOfBirth ||
        !city ||
        !country ||
        !membershipTier
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const phoneNormalized = normalizeEthiopianMobileLocal(
        String(phone).trim(),
      );
      if (!phoneNormalized) {
        return res.status(400).json({
          error:
            "Enter a valid Ethiopian mobile number (10 digits: 09xxxxxxxx or 07xxxxxxxx, or +251 9x xxx xxxx).",
        });
      }

      const existingMember = await storage.getMemberByPhone(phoneNormalized);
      if (existingMember) {
        return res.status(409).json({
          error:
            "You already have a membership account using this phone number. Please sign in with your existing account instead of registering again.",
        });
      }

      const paymentCurrency = String(currency || "ETB").toUpperCase();
      if (paymentCurrency !== "ETB" && paymentCurrency !== "USD") {
        return res
          .status(400)
          .json({ error: "Invalid currency. Use ETB or USD." });
      }

      const normalizedBillingCycle = normalizeBillingCycle(billingCycle);

      const tierRows = await db
        .select()
        .from(membershipTiers)
        .where(eq(membershipTiers.id, String(membershipTier)));
      const selectedTier = tierRows[0];
      if (!selectedTier) {
        return res.status(400).json({ error: "Invalid membership tier" });
      }

      const tierAmountRaw =
        paymentCurrency === "USD"
          ? Number(
              normalizedBillingCycle === "monthly"
                ? ((selectedTier as any).monthlyPriceUsd ??
                    selectedTier.priceUsd)
                : selectedTier.priceUsd,
            )
          : Number(
              normalizedBillingCycle === "monthly"
                ? ((selectedTier as any).monthlyPriceEtb ??
                    selectedTier.priceEtb)
                : selectedTier.priceEtb,
            );
      if (!Number.isFinite(tierAmountRaw) || tierAmountRaw <= 0) {
        return res
          .status(400)
          .json({ error: "Tier amount is invalid for selected currency" });
      }
      const amountNum = Math.round(tierAmountRaw);

      txRef = `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { photoUrl, password } = req.body;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { rank, gender, address, division } = req.body;

      const applicationData = {
        transactionId: txRef,
        firstName,
        lastName,
        email: null,
        phone: phoneNormalized,
        password: hashedPassword,
        idNumber: null,
        rank: rank || null,
        gender: gender || null,
        address: address || null,
        division: division || null,
        dateOfBirth,
        city,
        country,
        membershipTier,
        photoUrl: photoUrl || null,
      };

      const appValidation =
        insertPendingMemberApplicationSchema.safeParse(applicationData);
      if (!appValidation.success) {
        console.error(
          "Application validation failed:",
          fromZodError(appValidation.error).message,
        );
        return res
          .status(400)
          .json({ error: fromZodError(appValidation.error).message });
      }

      const pendingApplication = await storage.createPendingMemberApplication(
        appValidation.data,
      );

      // Tie the txRef to a specific "user" (the pending application id).
      const paymentData = {
        transactionId: txRef,
        type: "membership",
        amount: amountNum,
        currency: paymentCurrency,
        paymentMethod: "chapa",
        status: "pending" as const,
        metadata: {
          userId: pendingApplication.id,
          billingCycle: normalizedBillingCycle,
        },
      };

      const validation = insertPaymentSchema.safeParse(paymentData);
      if (!validation.success) {
        console.error(
          "Payment validation failed:",
          fromZodError(validation.error).message,
        );
        await storage.deletePendingMemberApplication(txRef!);
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      payment = await storage.createGenericPayment(validation.data);

      const membershipBaseUrl = await getPublicBaseUrlFromRequest(req);
      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        await storage.deletePendingMemberApplication(txRef!);
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }
      if (!chapaConfig.publicKey) {
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        await storage.deletePendingMemberApplication(txRef!);
        return res
          .status(500)
          .json({
            error: "Chapa public key not configured in Payment Gateways",
          });
      }

      const checkoutPhone = sanitizeChapaPhone(chapaPhone, phoneNormalized);
      console.log("Checkout phone this is :", checkoutPhone);
      const chapaPayload = {
        amount: amountNum.toString(),
        currency: paymentCurrency,
        // email: `${phone.replace(/\D/g, '')}@member.mechalfc.com`,
        email: null,
        first_name: firstName,
        last_name: lastName,
        phone_number: checkoutPhone,
        tx_ref: txRef,
        callback_url: resolveChapaCallbackUrl(
          chapaConfig.webhookUrl,
          membershipBaseUrl,
        ),
        return_url: buildChapaReturnUrl(membershipBaseUrl, txRef, "membership"),
        customization: {
          title: "FASIL S.C",
          description: "Join FASIL S.C",
        },
      };
      console.log(
        "Chapa payload this is :",
        JSON.stringify(chapaPayload, null, 2),
      );

      const chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapaPayload),
        },
      );

      if (!chapaResponse.ok) {
        const errorText = await chapaResponse.text();
        console.error("Chapa API error:", errorText);
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        await storage.deletePendingMemberApplication(txRef!);
        return res
          .status(500)
          .json({ error: "Failed to initialize payment with Chapa" });
      }

      const chapaData = await chapaResponse.json();

      if (chapaData.status === "success" && chapaData.data?.checkout_url) {
        res.json({
          success: true,
          checkoutUrl: chapaData.data.checkout_url,
        });
      } else {
        console.error("Chapa returned non-success status:", chapaData);
        await storage.updateGenericPaymentStatus(payment.id, "failed");
        await storage.deletePendingMemberApplication(txRef!);
        res
          .status(500)
          .json({ error: "Failed to initialize payment with Chapa" });
      }
    } catch (error) {
      console.error("Chapa initialization error:", error);
      if (payment?.id) {
        await storage.updateGenericPaymentStatus(payment.id, "failed");
      }
      if (txRef) {
        await storage.deletePendingMemberApplication(txRef);
      }
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  app.get("/api/chapa/return", async (req, res) => {
    const base = await getPublicBaseUrlFromRequest(req);
    const redirectDonation = (outcome: "success" | "failed" | "pending") =>
      res.redirect(302, `${base}/donate/success?payment=${outcome}`);
    const redirectMembership = (outcome: "success" | "failed" | "pending") =>
      res.redirect(302, `${base}/membership/success?payment=${outcome}`);
    const redirectRenewal = (outcome: "success" | "failed" | "pending") =>
      res.redirect(302, `${base}/member/dashboard?renewal=${outcome}`);

    try {
      const token = String(req.query.token || "");
      if (!token) {
        return redirectDonation("failed");
      }
      const decoded = jwt.verify(token, JWT_SECRET) as {
        txRef?: string;
        kind?: ChapaReturnKind;
      };
      const txRef = decoded?.txRef;
      const kind = decoded?.kind;
      if (!txRef || !kind) {
        return redirectDonation("failed");
      }

      if (kind === "donation") {
        const outcome = await finalizeChapaReturnDonation(txRef);
        return redirectDonation(outcome);
      }
      if (kind === "membership") {
        const outcome = await finalizeChapaReturnMembership(txRef);
        return redirectMembership(outcome);
      }
      if (kind === "renewal") {
        const outcome = await finalizeChapaReturnRenewal(txRef);
        return redirectRenewal(outcome);
      }
      return redirectDonation("failed");
    } catch (e) {
      console.error("Chapa return handler error:", e);
      return redirectDonation("failed");
    }
  });

  app.post("/api/chapa/callback", async (req, res) => {
    try {
      const { trx_ref, status } = req.body || {};

      // Always return success to Chapa to avoid repeated retries.
      if (!trx_ref) {
        return res.json({ message: "Callback received" });
      }
      if (status !== "success") {
        return res.json({ message: "Callback received" });
      }

      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }

      const verifyResponse = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${trx_ref}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
          },
        },
      );

      const verifyData = await verifyResponse.json();

      if (
        verifyData.status !== "success" ||
        verifyData.data?.status !== "success"
      ) {
        return res.json({ message: "Callback received" });
      }

      const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
      const chapaCurrency = String(verifyData.data.currency).toUpperCase();

      // Membership payments are stored in the generic `payments` table.
      const payment = await storage.getPaymentByTransactionId(trx_ref);
      if (
        payment &&
        (payment.type === "membership" || payment.type === "membership_renewal")
      ) {
        const expectedCurrency = String(payment.currency).toUpperCase();

        if (
          chapaAmount === payment.amount &&
          chapaCurrency === expectedCurrency
        ) {
          if (payment.type === "membership") {
            const application =
              await storage.getPendingMemberApplicationByTxId(trx_ref);

            // Confirm txRef belongs to the pending application we created at init time.
            const paymentUserId = (payment.metadata as any)?.userId;
            if (
              !application ||
              (paymentUserId !== undefined &&
                paymentUserId !== null &&
                Number(paymentUserId) !== application.id)
            ) {
              return res.json({ message: "Callback received" });
            }

            // Idempotent: transition pending -> completed exactly once.
            const paymentUpdated =
              await storage.updateGenericPaymentStatusIfPending(
                payment.id,
                "completed",
              );
            if (!paymentUpdated) {
              return res.json({ message: "Callback received" });
            }

            let memberCreated = false;

            try {
              const membershipNumber = `FK-${Date.now()}`;
              const idNumber = `FKFC-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
              const billingCycleFromPayment = normalizeBillingCycle(
                (payment.metadata as any)?.billingCycle,
              );
              const expiryDate = getMembershipExpiryDate(
                billingCycleFromPayment,
              );
              const memberStatus = getMemberStatusByExpiry(expiryDate);

              const memberData = {
                membershipNumber,
                fullName: `${application.firstName} ${application.lastName}`,
                email: null,
                phone: application.phone,
                password: application.password || null,
                idNumber,
                rank: application.rank || null,
                gender: application.gender || null,
                address: application.address || null,
                division: application.division || null,
                dateOfBirth: application.dateOfBirth,
                city: application.city,
                country: application.country,
                tier: application.membershipTier,
                photoUrl: application.photoUrl || null,
                status: memberStatus,
                expiryDate,
              };

              const createdMember = await storage.createMember(memberData);
              memberCreated = true;
              await createMembershipTransactionIfMissing({
                memberId: createdMember.id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                currency: payment.currency,
                tier: application.membershipTier,
              });
              await storage.deletePendingMemberApplication(trx_ref);
              sendPaymentNotifications(
                "membership",
                payment.amount,
                payment.currency,
              );
              void sendMembershipWelcomeSms(
                createdMember.phone,
                createdMember.fullName,
                createdMember.membershipNumber,
              ).catch((err) => console.error("Membership welcome SMS:", err));
            } catch (e) {
              // If member already exists (race between callback and verify), keep payment completed and clean pending data.
              const existingMember = await storage.getMemberByPhone(
                application.phone,
              );
              if (existingMember) {
                await createMembershipTransactionIfMissing({
                  memberId: existingMember.id,
                  transactionId: payment.transactionId,
                  amount: payment.amount,
                  currency: payment.currency,
                  tier: application.membershipTier,
                });
                await storage.deletePendingMemberApplication(trx_ref);
                sendPaymentNotifications(
                  "membership",
                  payment.amount,
                  payment.currency,
                );
              } else if (!memberCreated) {
                // Allow retry only when member truly wasn't created.
                await storage.updateGenericPaymentStatus(payment.id, "pending");
              }
              console.error("Membership callback completion failed:", e);
            }
          } else {
            const paymentUserId = Number((payment.metadata as any)?.userId);
            const renewalTier = String(
              (payment.metadata as any)?.membershipTier || "",
            ).trim();
            const renewalBilling = normalizeBillingCycle(
              (payment.metadata as any)?.billingCycle,
            );
            if (!paymentUserId || !renewalTier) {
              return res.json({ message: "Callback received" });
            }

            const member = await storage.getMemberById(paymentUserId);
            if (!member) {
              return res.json({ message: "Callback received" });
            }

            const paymentUpdated =
              await storage.updateGenericPaymentStatusIfPending(
                payment.id,
                "completed",
              );
            if (!paymentUpdated) {
              return res.json({ message: "Callback received" });
            }

            const renewalExpiryDate = getRenewalExpiryDate(
              member.expiryDate,
              renewalBilling,
            );
            const renewalStatus = getMemberStatusByExpiry(renewalExpiryDate);
            await storage.updateMember(member.id, {
              tier: renewalTier,
              expiryDate: renewalExpiryDate,
              status: renewalStatus,
            });
            await createMembershipTransactionIfMissing({
              memberId: member.id,
              transactionId: payment.transactionId,
              amount: payment.amount,
              currency: payment.currency,
              tier: renewalTier,
            });
            sendPaymentNotifications(
              "membership",
              payment.amount,
              payment.currency,
            );
            queueMemberRenewalThankYouSms(
              member.phone,
              payment.amount,
              payment.currency,
              renewalExpiryDate,
            );
          }
        }

        return res.json({ message: "Callback received" });
      }

      // Donations are stored in the `donations` table.
      const donation = await storage.getDonationByTransactionId(trx_ref);
      if (donation) {
        const expectedCurrency = String(donation.currency).toUpperCase();
        const chapaEmail = String(
          verifyData.data.email ?? verifyData.data.customer?.email ?? "",
        )
          .trim()
          .toLowerCase();

        const emailMatches =
          !chapaEmail ||
          chapaEmail === String(donation.donorEmail).trim().toLowerCase();

        if (
          emailMatches &&
          chapaAmount === donation.amount &&
          chapaCurrency === expectedCurrency
        ) {
          const donationUpdated = await storage.updateDonationStatusIfPending(
            donation.id,
            "completed",
          );
          if (donationUpdated) {
            sendPaymentNotifications(
              "donation",
              donation.amount,
              donation.currency,
            );
            queueDonorThankYouSmsFromChapa(
              verifyData,
              donation.amount,
              donation.currency,
            );
          }
        }
      }

      res.json({ message: "Callback received" });
    } catch (error) {
      console.error("Chapa callback error:", error);
      res.status(500).json({ error: "Callback processing failed" });
    }
  });

  app.get("/api/memberships/verify/:txRef", async (req, res) => {
    try {
      const { txRef } = req.params;

      const payment = await storage.getPaymentByTransactionId(txRef);
      if (!payment || payment.type !== "membership") {
        return res.status(404).json({ error: "Membership payment not found" });
      }

      if (payment.status === "completed") {
        return res.json({
          success: true,
          status: "success",
          message: "Membership already processed",
        });
      }

      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }
      const verifyResponse = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${txRef}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
          },
        },
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.status !== "success") {
        return res
          .status(400)
          .json({ error: "Verification failed", status: "failed" });
      }

      if (verifyData.data.status === "success") {
        const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
        const chapaCurrency = String(verifyData.data.currency).toUpperCase();
        const expectedCurrency = String(payment.currency).toUpperCase();

        if (
          chapaAmount === payment.amount &&
          chapaCurrency === expectedCurrency
        ) {
          const application =
            await storage.getPendingMemberApplicationByTxId(txRef);

          if (!application) {
            return res
              .status(404)
              .json({
                error: "Application not found. Please contact support.",
              });
          }

          // Confirm txRef belongs to the application record created during init.
          const paymentUserId = (payment.metadata as any)?.userId;
          if (
            paymentUserId !== undefined &&
            paymentUserId !== null &&
            Number(paymentUserId) !== application.id
          ) {
            return res
              .status(400)
              .json({ error: "Invalid payment reference for this user." });
          }

          const membershipNumber = `FK-${Date.now()}`;
          const idNumber = `FKFC-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
          const billingCycleFromPayment = normalizeBillingCycle(
            (payment.metadata as any)?.billingCycle,
          );
          const expiryDate = getMembershipExpiryDate(billingCycleFromPayment);
          const memberStatus = getMemberStatusByExpiry(expiryDate);

          const memberData = {
            membershipNumber,
            fullName: `${application.firstName} ${application.lastName}`,
            email: null,
            phone: application.phone,
            password: application.password || null,
            idNumber,
            rank: application.rank || null,
            gender: application.gender || null,
            address: application.address || null,
            division: application.division || null,
            dateOfBirth: application.dateOfBirth,
            city: application.city,
            country: application.country,
            tier: application.membershipTier,
            photoUrl: application.photoUrl || null,
            status: memberStatus,
            expiryDate,
          };

          // Idempotent: only one request transitions pending -> completed.
          const paymentUpdated =
            await storage.updateGenericPaymentStatusIfPending(
              payment.id,
              "completed",
            );
          if (!paymentUpdated) {
            const latestPayment =
              await storage.getPaymentByTransactionId(txRef);
            if (latestPayment?.status === "completed") {
              return res.json({
                success: true,
                status: "success",
                message: "Membership already processed",
              });
            }

            return res.status(400).json({
              error: "Payment is not pending or could not be completed",
              status: "failed",
            });
          }

          let member;
          try {
            member = await storage.createMember(memberData);
            await createMembershipTransactionIfMissing({
              memberId: member.id,
              transactionId: payment.transactionId,
              amount: payment.amount,
              currency: payment.currency,
              tier: application.membershipTier,
            });
            await storage.deletePendingMemberApplication(txRef);
            sendPaymentNotifications(
              "membership",
              payment.amount,
              payment.currency,
            );
            void sendMembershipWelcomeSms(
              member.phone,
              member.fullName,
              member.membershipNumber,
            ).catch((err) => console.error("Membership welcome SMS:", err));
          } catch (e) {
            // If member already exists (race with callback), treat as completed and clean pending application.
            const existingMember = await storage.getMemberByPhone(
              application.phone,
            );
            if (existingMember) {
              await createMembershipTransactionIfMissing({
                memberId: existingMember.id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                currency: payment.currency,
                tier: application.membershipTier,
              });
              await storage.deletePendingMemberApplication(txRef);
              sendPaymentNotifications(
                "membership",
                payment.amount,
                payment.currency,
              );
              return res.json({
                success: true,
                status: "success",
                member: {
                  id: existingMember.id,
                  membershipNumber: existingMember.membershipNumber,
                  fullName: existingMember.fullName,
                },
              });
            }

            // Allow retry only when member truly wasn't created.
            if (!member) {
              await storage.updateGenericPaymentStatus(payment.id, "pending");
            }
            console.error("Membership finalize error:", e);
            return res
              .status(500)
              .json({ error: "Failed to finalize membership payment" });
          }

          res.json({
            success: true,
            status: "success",
            member: {
              id: member.id,
              membershipNumber: member.membershipNumber,
              fullName: member.fullName,
            },
          });
        } else {
          console.error("Amount/currency mismatch:", {
            chapaAmount,
            chapaCurrency,
            payment,
          });
          res.status(400).json({
            error: "Payment amount or currency does not match",
            status: "failed",
          });
        }
      } else {
        res.json({
          success: false,
          status: verifyData.data.status,
          message: "Payment not completed",
        });
      }
    } catch (error) {
      console.error("Membership verification error:", error);
      res.status(500).json({ error: "Failed to verify membership" });
    }
  });

  app.get("/api/member/renewal/verify/:txRef", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        membershipNumber: string;
        type: string;
      };
      if (decoded.type !== "member") {
        return res.status(403).json({ error: "Invalid token type" });
      }

      const { txRef } = req.params;
      const payment = await storage.getPaymentByTransactionId(txRef);
      if (!payment || payment.type !== "membership_renewal") {
        return res.status(404).json({ error: "Renewal payment not found" });
      }

      if (payment.status === "completed") {
        return res.json({
          success: true,
          status: "success",
          message: "Renewal already processed",
        });
      }

      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }
      const verifyResponse = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${txRef}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${chapaConfig.secretKey}` },
        },
      );
      const verifyData = await verifyResponse.json();
      if (
        verifyData.status !== "success" ||
        verifyData.data?.status !== "success"
      ) {
        return res
          .status(400)
          .json({ error: "Verification failed", status: "failed" });
      }

      const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
      const chapaCurrency = String(verifyData.data.currency).toUpperCase();
      const expectedCurrency = String(payment.currency).toUpperCase();
      if (
        chapaAmount !== payment.amount ||
        chapaCurrency !== expectedCurrency
      ) {
        return res
          .status(400)
          .json({
            error: "Payment amount or currency does not match",
            status: "failed",
          });
      }

      const paymentUserId = Number((payment.metadata as any)?.userId);
      const renewalTier = String(
        (payment.metadata as any)?.membershipTier || "",
      ).trim();
      const renewalBilling = normalizeBillingCycle(
        (payment.metadata as any)?.billingCycle,
      );
      if (!paymentUserId || !renewalTier) {
        return res
          .status(400)
          .json({ error: "Invalid renewal metadata", status: "failed" });
      }
      if (paymentUserId !== decoded.id) {
        return res
          .status(403)
          .json({
            error:
              "This transaction does not belong to the authenticated member",
            status: "failed",
          });
      }

      const member = await storage.getMemberById(paymentUserId);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      const paymentUpdated = await storage.updateGenericPaymentStatusIfPending(
        payment.id,
        "completed",
      );
      if (!paymentUpdated) {
        const latestPayment = await storage.getPaymentByTransactionId(txRef);
        if (latestPayment?.status === "completed") {
          return res.json({
            success: true,
            status: "success",
            message: "Renewal already processed",
          });
        }
        return res
          .status(400)
          .json({ error: "Renewal payment is not pending", status: "failed" });
      }

      const renewalExpiryDate = getRenewalExpiryDate(
        member.expiryDate,
        renewalBilling,
      );
      const renewalStatus = getMemberStatusByExpiry(renewalExpiryDate);
      const updatedMember = await storage.updateMember(member.id, {
        tier: renewalTier,
        expiryDate: renewalExpiryDate,
        status: renewalStatus,
      });
      await createMembershipTransactionIfMissing({
        memberId: member.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        tier: renewalTier,
      });

      sendPaymentNotifications("membership", payment.amount, payment.currency);
      queueMemberRenewalThankYouSms(
        member.phone,
        payment.amount,
        payment.currency,
        renewalExpiryDate,
      );
      return res.json({
        success: true,
        status: "success",
        member: updatedMember || member,
      });
    } catch (error) {
      console.error("Renewal verification error:", error);
      return res.status(500).json({ error: "Failed to verify renewal" });
    }
  });

  app.get("/api/chapa/verify/:txRef", async (req, res) => {
    try {
      const { txRef } = req.params;

      const donation = await storage.getDonationByTransactionId(txRef);
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }

      if (donation.status === "completed") {
        return res.json({
          success: true,
          status: "success",
          donation,
        });
      }

      const chapaConfig = await getChapaConfig();
      if (!chapaConfig.secretKey) {
        return res
          .status(500)
          .json({
            error: "Chapa secret key not configured in Payment Gateways",
          });
      }
      const verifyResponse = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${txRef}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
          },
        },
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.status !== "success") {
        return res
          .status(400)
          .json({ error: "Verification failed", status: "failed" });
      }

      if (verifyData.data.status === "success") {
        const chapaAmount = Math.round(parseFloat(verifyData.data.amount));
        const chapaCurrency = String(verifyData.data.currency).toUpperCase();
        const expectedCurrency = String(donation.currency).toUpperCase();

        const chapaEmail = String(
          verifyData.data.email ?? verifyData.data.customer?.email ?? "",
        )
          .trim()
          .toLowerCase();
        const emailMatches =
          !chapaEmail ||
          chapaEmail === String(donation.donorEmail).trim().toLowerCase();

        if (
          emailMatches &&
          chapaAmount === donation.amount &&
          chapaCurrency === expectedCurrency
        ) {
          // Idempotent: only one request transitions pending -> completed.
          const donationUpdated = await storage.updateDonationStatusIfPending(
            donation.id,
            "completed",
          );
          if (!donationUpdated) {
            const latestDonation =
              await storage.getDonationByTransactionId(txRef);
            if (latestDonation?.status === "completed") {
              return res.json({
                success: true,
                status: "success",
                donation: latestDonation,
              });
            }

            return res.status(400).json({
              error: "Donation is not pending or could not be completed",
              status: "failed",
            });
          }

          sendPaymentNotifications(
            "donation",
            donationUpdated.amount,
            donationUpdated.currency,
          );
          queueDonorThankYouSmsFromChapa(
            verifyData,
            donationUpdated.amount,
            donationUpdated.currency,
          );

          res.json({
            success: true,
            status: "success",
            donation: donationUpdated,
          });
        } else {
          console.error("Amount/currency mismatch:", {
            chapaAmount,
            chapaCurrency,
            donation,
          });
          res.status(400).json({
            error: "Payment amount or currency does not match",
            status: "failed",
          });
        }
      } else {
        res.json({
          success: false,
          status: verifyData.data.status,
          donation: donation,
        });
      }
    } catch (error) {
      console.error("Chapa verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.get("/api/post-categories", async (_req, res) => {
    try {
      await ensurePostContentSchema();
      const categories = await db
        .select()
        .from(postCategories)
        .orderBy(asc(postCategories.name));
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch post categories:", error);
      res.status(500).json({ error: "Failed to fetch post categories" });
    }
  });

  app.post(
    "/api/admin/post-categories",
    authenticateToken,
    async (req, res) => {
      try {
        await ensurePostContentSchema();
        const name = String(req.body?.name ?? "").trim();
        if (!name) {
          return res.status(400).json({ error: "Category name is required" });
        }
        if (name.length > 60) {
          return res
            .status(400)
            .json({ error: "Category name must be 60 characters or fewer" });
        }

        const [existing] = await db
          .select({ id: postCategories.id })
          .from(postCategories)
          .where(sql`lower(${postCategories.name}) = lower(${name})`)
          .limit(1);
        if (existing) {
          return res
            .status(409)
            .json({ error: "A category with this name already exists" });
        }

        const [category] = await db
          .insert(postCategories)
          .values({ name })
          .returning();
        res.status(201).json(category);
      } catch (error) {
        if ((error as { code?: string })?.code === "23505") {
          return res
            .status(409)
            .json({ error: "A category with this name already exists" });
        }
        console.error("Failed to create post category:", error);
        res.status(500).json({ error: "Failed to create post category" });
      }
    },
  );

  app.get("/api/posts", async (req, res) => {
    try {
      await ensurePostContentSchema();
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      await ensurePostContentSchema();
      const validation = insertPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const categoryName = validation.data.category.trim();
      const [category] = await db
        .select({ name: postCategories.name })
        .from(postCategories)
        .where(sql`lower(${postCategories.name}) = lower(${categoryName})`)
        .limit(1);
      if (!category) {
        return res.status(400).json({
          error: "Choose a category that has been created before saving the post",
        });
      }
      const slug = await makeUniquePostSlug(
        validation.data.slug,
        validation.data.titleEn,
      );
      const post = await storage.createPost({
        ...validation.data,
        slug,
        category: category.name,
      });
      res.json(post);
    } catch (error) {
      console.error("Failed to create post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.patch("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      await ensurePostContentSchema();
      const updates =
        req.body && typeof req.body === "object" ? { ...req.body } : {};
      if ("category" in updates) {
        const categoryName = String(updates.category ?? "").trim();
        if (!categoryName) {
          return res.status(400).json({ error: "Post category is required" });
        }
        const [category] = await db
          .select({ name: postCategories.name })
          .from(postCategories)
          .where(sql`lower(${postCategories.name}) = lower(${categoryName})`)
          .limit(1);
        if (!category) {
          return res.status(400).json({
            error:
              "Choose a category that has been created before saving the post",
          });
        }
        updates.category = category.name;
      }
      const post = await storage.updatePost(
        parseInt(req.params.id),
        updates,
      );
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deletePost(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  app.get("/api/pages", authenticateToken, async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        const emptyStaticPages: Record<string, string> = {
          "privacy-policy": "Privacy Policy",
          "terms-of-service": "Terms of Service",
        };
        const titleEn = emptyStaticPages[req.params.slug];
        if (titleEn) {
          return res.json({
            id: 0,
            slug: req.params.slug,
            titleEn,
            titleAm: null,
            contentEn: "",
            contentAm: null,
            status: "draft",
            createdAt: null,
            updatedAt: null,
          });
        }
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", authenticateToken, async (req, res) => {
    try {
      const validation = insertPageSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const page = await storage.createPage(validation.data);
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to create page" });
    }
  });

  app.patch("/api/pages/:id", authenticateToken, async (req, res) => {
    try {
      const page = await storage.updatePage(parseInt(req.params.id), req.body);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.get("/api/sms-templates", authenticateToken, async (req, res) => {
    try {
      const templates = await storage.getSmsTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SMS templates" });
    }
  });

  app.post("/api/sms-templates", authenticateToken, async (req, res) => {
    try {
      const validation = insertSmsTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const template = await storage.createSmsTemplate(validation.data);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SMS template" });
    }
  });

  app.patch("/api/sms-templates/:id", authenticateToken, async (req, res) => {
    try {
      const template = await storage.updateSmsTemplate(
        parseInt(req.params.id),
        req.body,
      );
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SMS template" });
    }
  });

  app.delete("/api/sms-templates/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteSmsTemplate(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SMS template" });
    }
  });

  app.get("/api/sms-logs", authenticateToken, async (req, res) => {
    try {
      const logs = await storage.getSmsLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SMS logs" });
    }
  });

  app.post("/api/sms-logs", authenticateToken, async (req, res) => {
    try {
      const validation = insertSmsLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      const log = await storage.createSmsLog(validation.data);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SMS log" });
    }
  });

  app.get("/api/settings", authenticateToken, async (req, res) => {
    try {
      const settings = (await storage.getSettings()).filter(
        (setting) => setting.key !== SMS_ICONIC_SETTING_KEYS.apiKeyEncrypted,
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/public/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const allowedPrefixes = [
        "branding.",
        "social.",
        "theme.",
        "home.",
        "about.",
        "contact.",
      ];

      const publicSettings = settings.filter((s: any) =>
        allowedPrefixes.some((prefix) => String(s.key).startsWith(prefix)),
      );
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public settings" });
    }
  });

  app.get("/api/public/branding", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const brandingKeys = [
        "branding.headerText",
        "branding.headerSubtext",
        "branding.logoUrl",
        "branding.signature",
        "branding.authorizedPersonName",
        "branding.stamp",
        "branding.stamp2",
      ];
      const branding = settings.filter((s: any) =>
        brandingKeys.includes(s.key),
      );
      res.json(branding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch branding" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      if (req.params.key === SMS_ICONIC_SETTING_KEYS.apiKeyEncrypted) {
        return res.status(404).json({ error: "Setting not found" });
      }
      const setting = await storage.getSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", authenticateToken, async (req, res) => {
    try {
      const validation = insertSettingSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }
      if (validation.data.key === SMS_ICONIC_SETTING_KEYS.apiKeyEncrypted) {
        return res
          .status(403)
          .json({ error: "Use the protected SMS credential endpoint." });
      }
      const setting = await storage.upsertSetting(validation.data);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.delete("/api/settings/:key", authenticateToken, async (req, res) => {
    try {
      if (req.params.key === SMS_ICONIC_SETTING_KEYS.apiKeyEncrypted) {
        return res
          .status(403)
          .json({ error: "Use the protected SMS credential endpoint." });
      }
      const success = await storage.deleteSetting(req.params.key);
      if (!success) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete setting" });
    }
  });

  app.get("/api/stats/revenue", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getRevenueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue stats" });
    }
  });

  app.get("/api/public/member/:membershipNumber", async (req, res) => {
    try {
      const member = await storage.getMemberByNumber(
        req.params.membershipNumber,
      );
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      if (member.status !== "active") {
        return res.status(403).json({ error: "Membership is not active" });
      }
      res.json({
        membershipNumber: member.membershipNumber,
        fullName: member.fullName,
        idNumber: member.idNumber,
        rank: member.rank,
        gender: member.gender,
        address: member.address,
        division: member.division,
        phone: member.phone,
        tier: member.tier,
        photoUrl: member.photoUrl,
        joinedDate: member.joinedDate,
        expiryDate: member.expiryDate,
        status: member.status,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
