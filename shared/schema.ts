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
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

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

/** `settings` row keys for Geez SMS (values stored as JSON strings). */
export const SMS_GEEZ_SETTING_KEYS = {
  id: "sms.geez.id",
  token: "sms.geez.token",
  sender: "sms.geez.sender",
  /** Public origin for Chapa return/callback URLs (https://yourdomain.com). Stored in `settings`. */
  baseUrl: "sms.geez.baseUrl",
} as const;

/** Admin form / API shape for Geez SMS gateway credentials. */
export const smsGatewayGeezFormSchema = z.object({
  id: z.string().max(512).optional(),
  token: z.string().max(4000).optional(),
  sender: z.string().max(64).optional(),
  baseUrl: z.string().max(512).optional(),
});

export type SmsGatewayGeezForm = z.infer<typeof smsGatewayGeezFormSchema>;

export const membershipTiers = pgTable("membership_tiers", {
  id: text("id").primaryKey(),
  amharicVersion: text("amharic_version").notNull().default(""),
  priceEtb: integer("price_etb").notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  monthlyPriceEtb: integer("monthly_price_etb").notNull().default(0),
  monthlyPriceUsd: numeric("monthly_price_usd", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
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
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
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
