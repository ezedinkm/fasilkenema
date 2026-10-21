import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  serial,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("super_admin"),
  isActive: boolean("is_active").notNull().default(true),
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: serial("id").primaryKey(),
    actorAdminId: integer("actor_admin_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    actorEmail: text("actor_email").notNull().default(""),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    statusCode: integer("status_code").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("admin_audit_logs_created_at_idx").on(table.createdAt),
    index("admin_audit_logs_actor_admin_id_idx").on(table.actorAdminId),
  ],
);

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  membershipNumber: text("membership_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull().unique(),
  password: text("password"),
  idNumber: text("id_number"),
  rank: text("rank"),
  gender: text("gender"),
  address: text("address"),
  division: text("division"),
  dateOfBirth: text("date_of_birth").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  tier: text("tier").notNull(),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("active"),
  joinedDate: timestamp("joined_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  joinedDate: true,
});
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export const membershipPayments = pgTable("membership_payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id),
  transactionId: text("transaction_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  tier: text("tier").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMembershipPaymentSchema = createInsertSchema(
  membershipPayments,
).omit({ id: true, createdAt: true });
export type InsertMembershipPayment = z.infer<
  typeof insertMembershipPaymentSchema
>;
export type MembershipPayment = typeof membershipPayments.$inferSelect;

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAm: text("title_am"),
  titleTi: text("title_ti"),
  titleOr: text("title_or"),
  titleSo: text("title_so"),
  contentEn: text("content_en").notNull(),
  contentAm: text("content_am"),
  contentTi: text("content_ti"),
  contentOr: text("content_or"),
  contentSo: text("content_so"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const postCategories = pgTable(
  "post_categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    nameLowerUnique: uniqueIndex("post_categories_name_lower_unique").on(
      sql`lower(${table.name})`,
    ),
  }),
);
export type PostCategory = typeof postCategories.$inferSelect;

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    status: text("status").notNull().default("active"),
    unsubscribeToken: text("unsubscribe_token").notNull().unique(),
    subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
    unsubscribedAt: timestamp("unsubscribed_at"),
  },
  (table) => ({
    emailLowerUnique: uniqueIndex("newsletter_subscribers_email_lower_unique").on(
      sql`lower(${table.email})`,
    ),
  }),
);
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAm: text("title_am"),
  titleTi: text("title_ti"),
  titleOr: text("title_or"),
  titleSo: text("title_so"),
  contentEn: text("content_en").notNull(),
  contentAm: text("content_am"),
  contentTi: text("content_ti"),
  contentOr: text("content_or"),
  contentSo: text("content_so"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;

export const careerJobs = pgTable("career_jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department"),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull().default("Full-time"),
  summary: text("summary"),
  description: text("description").notNull(),
  requirements: text("requirements"),
  applicationEmail: text("application_email"),
  applicationUrl: text("application_url"),
  closingDate: text("closing_date"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCareerJobSchema = createInsertSchema(careerJobs)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().trim().min(1).max(160),
    department: z.string().trim().max(120).nullable().optional(),
    location: z.string().trim().min(1).max(160),
    employmentType: z.string().trim().min(1).max(80),
    summary: z.string().trim().max(300).nullable().optional(),
    description: z.string().trim().min(1).max(12000),
    requirements: z.string().trim().max(12000).nullable().optional(),
    applicationEmail: z
      .string()
      .trim()
      .email()
      .or(z.literal(""))
      .nullable()
      .optional(),
    applicationUrl: z
      .string()
      .trim()
      .url()
      .refine((value) => /^https?:\/\//i.test(value))
      .or(z.literal(""))
      .nullable()
      .optional(),
    closingDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .or(z.literal(""))
      .nullable()
      .optional(),
    status: z.enum(["draft", "published", "closed"]),
  });
export type InsertCareerJob = z.infer<typeof insertCareerJobSchema>;
export type CareerJob = typeof careerJobs.$inferSelect;

export const smsTemplates = pgTable("sms_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSmsTemplateSchema = createInsertSchema(smsTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSmsTemplate = z.infer<typeof insertSmsTemplateSchema>;
export type SmsTemplate = typeof smsTemplates.$inferSelect;

export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  recipient: text("recipient").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("sent"),
  /** Classify sends: otp_*, payment_admin, donor_thankyou, membership_welcome, broadcast, etc. */
  category: text("category"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertSmsLogSchema = createInsertSchema(smsLogs).omit({
  id: true,
});
export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;
export type SmsLog = typeof smsLogs.$inferSelect;

export const smsBroadcastJobs = pgTable("sms_broadcast_jobs", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetValue: text("target_value"),
  message: text("message").notNull(),
  status: text("status").notNull().default("queued"),
  totalRecipients: integer("total_recipients").notNull().default(0),
  processedCount: integer("processed_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  createdBy: text("created_by"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSmsBroadcastJobSchema = createInsertSchema(
  smsBroadcastJobs,
).omit({
  id: true,
  createdAt: true,
});
export type InsertSmsBroadcastJob = z.infer<typeof insertSmsBroadcastJobSchema>;
export type SmsBroadcastJob = typeof smsBroadcastJobs.$inferSelect;

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export const SMS_ICONIC_SETTING_KEYS = {
  senderId: "sms.iconic.shortcodeId",
  apiKeyEncrypted: "sms.iconic.apiKeyEncrypted",
} as const;

export const PUBLIC_SITE_BASE_URL_SETTING_KEY = "public.siteBaseUrl";
/** Legacy key is retained only as a read fallback for Chapa return URLs. */
export const LEGACY_SMS_PUBLIC_BASE_URL_SETTING_KEY = "sms.geez.baseUrl";

export const membershipTiers = pgTable("membership_tiers", {
  id: text("id").primaryKey(),
  amharicVersion: text("amharic_version").notNull().default(""),
  priceEtb: integer("price_etb").notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  monthlyPriceEtb: integer("monthly_price_etb").notNull().default(0),
  monthlyPriceUsd: numeric("monthly_price_usd", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  frontBackgroundUrl: text("front_background_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMembershipTierSchema = createInsertSchema(
  membershipTiers,
).omit({ id: true, createdAt: true });
export type InsertMembershipTier = z.infer<typeof insertMembershipTierSchema>;
export type MembershipTier = typeof membershipTiers.$inferSelect;

export const donationTiers = pgTable("donation_tiers", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDonationTierSchema = createInsertSchema(donationTiers).omit({
  id: true,
  createdAt: true,
});
export type InsertDonationTier = z.infer<typeof insertDonationTierSchema>;
export type DonationTier = typeof donationTiers.$inferSelect;

export const usermessage = pgTable("usermessage", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("needs_contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUsermessageSchema = createInsertSchema(usermessage).omit({
  id: true,
  createdAt: true,
});
export type InsertUsermessage = z.infer<typeof insertUsermessageSchema>;
export type Usermessage = typeof usermessage.$inferSelect;

export const watchReviews = pgTable("watch_reviews", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWatchReviewSchema = createInsertSchema(watchReviews).omit({
  id: true,
  createdAt: true,
});
export type InsertWatchReview = z.infer<typeof insertWatchReviewSchema>;
export type WatchReview = typeof watchReviews.$inferSelect;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  metadata: jsonb("metadata"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const pendingMemberApplications = pgTable(
  "pending_member_applications",
  {
    id: serial("id").primaryKey(),
    transactionId: text("transaction_id").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    password: text("password"),
    idNumber: text("id_number"),
    rank: text("rank"),
    gender: text("gender"),
    address: text("address"),
    division: text("division"),
    dateOfBirth: text("date_of_birth").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    membershipTier: text("membership_tier").notNull(),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

export const insertPendingMemberApplicationSchema = createInsertSchema(
  pendingMemberApplications,
).omit({ id: true, createdAt: true });
export type InsertPendingMemberApplication = z.infer<
  typeof insertPendingMemberApplicationSchema
>;
export type PendingMemberApplication =
  typeof pendingMemberApplications.$inferSelect;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull(),
  verified: boolean("verified").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;

export {
  footballMenPlayers,
  insertFootballMenPlayerSchema,
  type InsertFootballMenPlayer,
  type FootballMenPlayer,
} from "./schema/footballMenPlayers";
export {
  footballWomenPlayers,
  insertFootballWomenPlayerSchema,
  type InsertFootballWomenPlayer,
  type FootballWomenPlayer,
} from "./schema/footballWomenPlayers";
export {
  footballJuniorPlayers,
  insertFootballJuniorPlayerSchema,
  type InsertFootballJuniorPlayer,
  type FootballJuniorPlayer,
} from "./schema/footballJuniorPlayers";
export {
  basketballPlayers,
  insertBasketballPlayerSchema,
  type InsertBasketballPlayer,
  type BasketballPlayer,
} from "./schema/basketballPlayers";
export {
  handballPlayers,
  insertHandballPlayerSchema,
  type InsertHandballPlayer,
  type HandballPlayer,
} from "./schema/handballPlayers";
export {
  boxingPlayers,
  insertBoxingPlayerSchema,
  type InsertBoxingPlayer,
  type BoxingPlayer,
} from "./schema/boxingPlayers";
