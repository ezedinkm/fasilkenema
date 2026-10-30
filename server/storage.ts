import { eq, desc, and, gte, gt, lte, count, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import {
  ethiopianLocalToInternational,
  normalizeEthiopianMobileLocal,
} from "@shared/ethiopianPhone";
import type {
  AdminUser,
  InsertAdminUser,
  Member,
  InsertMember,
  MembershipPayment,
  InsertMembershipPayment,
  Donation,
  InsertDonation,
  Post,
  InsertPost,
  Page,
  InsertPage,
  CareerJob,
  InsertCareerJob,
  SmsTemplate,
  InsertSmsTemplate,
  SmsLog,
  InsertSmsLog,
  Setting,
  InsertSetting,
  Payment,
  InsertPayment,
  PendingMemberApplication,
  InsertPendingMemberApplication,
  OtpVerification,
} from "@shared/schema";

export interface IStorage {
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;

  getMembers(): Promise<Member[]>;
  getMemberById(id: number): Promise<Member | undefined>;
  getMemberByNumber(membershipNumber: string): Promise<Member | undefined>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  getMemberByPhone(phone: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(
    id: number,
    member: Partial<InsertMember>,
  ): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;

  getPayments(): Promise<MembershipPayment[]>;
  getPaymentsByMember(memberId: number): Promise<MembershipPayment[]>;
  createPayment(payment: InsertMembershipPayment): Promise<MembershipPayment>;
  updatePaymentStatus(
    id: number,
    status: string,
  ): Promise<MembershipPayment | undefined>;

  createGenericPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByTransactionId(
    transactionId: string,
  ): Promise<Payment | undefined>;
  updateGenericPaymentStatus(
    id: number,
    status: string,
  ): Promise<Payment | undefined>;
  updateGenericPaymentStatusIfPending(
    id: number,
    status: string,
  ): Promise<Payment | undefined>;

  createPendingMemberApplication(
    application: InsertPendingMemberApplication,
  ): Promise<PendingMemberApplication>;
  getPendingMemberApplicationByTxId(
    transactionId: string,
  ): Promise<PendingMemberApplication | undefined>;
  deletePendingMemberApplication(transactionId: string): Promise<boolean>;

  getDonations(): Promise<Donation[]>;
  getDonationByTransactionId(
    transactionId: string,
  ): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonationStatus(
    id: number,
    status: string,
  ): Promise<Donation | undefined>;
  updateDonationStatusIfPending(
    id: number,
    status: string,
  ): Promise<Donation | undefined>;

  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  getPages(): Promise<Page[]>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;

  getCareerJobs(): Promise<CareerJob[]>;
  getPublishedCareerJobs(): Promise<CareerJob[]>;
  getCareerJobById(id: number): Promise<CareerJob | undefined>;
  createCareerJob(job: InsertCareerJob): Promise<CareerJob>;
  updateCareerJob(
    id: number,
    job: Partial<InsertCareerJob>,
  ): Promise<CareerJob | undefined>;
  deleteCareerJob(id: number): Promise<boolean>;

  getSmsTemplates(): Promise<SmsTemplate[]>;
  getSmsTemplateById(id: number): Promise<SmsTemplate | undefined>;
  createSmsTemplate(template: InsertSmsTemplate): Promise<SmsTemplate>;
  updateSmsTemplate(
    id: number,
    template: Partial<InsertSmsTemplate>,
  ): Promise<SmsTemplate | undefined>;
  deleteSmsTemplate(id: number): Promise<boolean>;

  getSmsLogs(): Promise<SmsLog[]>;
  createSmsLog(log: InsertSmsLog): Promise<SmsLog>;
  /** Rows in `sms_logs` with status `sent` (every successful gateway send: OTP, broadcasts, payments, etc.). */
  getSmsSendStats(): Promise<{ delivered: number }>;

  getSettings(): Promise<Setting[]>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  deleteSetting(key: string): Promise<boolean>;

  getRevenueStats(): Promise<{
    membershipETB: number;
    membershipUSD: number;
    donationETB: number;
    donationUSD: number;
  }>;

  createOtp(
    phone: string,
    code: string,
    purpose: string,
    expiresAt: Date,
  ): Promise<OtpVerification>;
  getValidOtp(
    phone: string,
    code: string,
    purpose: string,
  ): Promise<OtpVerification | undefined>;
  markOtpVerified(id: number): Promise<void>;
  deleteOtpsForPhoneAndPurpose(phone: string, purpose: string): Promise<void>;
  hasRecentOtp(
    phone: string,
    purpose: string,
    since: Date,
  ): Promise<boolean>;
  consumeVerifiedOtp(phone: string, purpose: string): Promise<boolean>;
  deleteExpiredOtps(): Promise<void>;
}

export class DbStorage implements IStorage {
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const result = await db
      .select()
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.email, email.trim().toLowerCase()));
    return result[0];
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(schema.adminUsers).values(admin).returning();
    return result[0];
  }

  async getMembers(): Promise<Member[]> {
    return await db
      .select()
      .from(schema.members)
      .orderBy(desc(schema.members.createdAt));
  }

  async getMemberById(id: number): Promise<Member | undefined> {
    const result = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.id, id));
    return result[0];
  }

  async getMemberByNumber(
    membershipNumber: string,
  ): Promise<Member | undefined> {
    const result = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.membershipNumber, membershipNumber));
    return result[0];
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const result = await db
      .select()
      .from(schema.members)
      .where(sql`lower(${schema.members.email}) = ${email.trim().toLowerCase()}`)
      .limit(1);
    return result[0];
  }

  async getMemberByPhone(phone: string): Promise<Member | undefined> {
    const trimmed = String(phone || "").trim();
    const normalized = normalizeEthiopianMobileLocal(trimmed);
    if (normalized) {
      const byNorm = await db
        .select()
        .from(schema.members)
        .where(eq(schema.members.phone, normalized));
      if (byNorm[0]) return byNorm[0];
      const intl = ethiopianLocalToInternational(normalized);
      const byIntl = await db
        .select()
        .from(schema.members)
        .where(eq(schema.members.phone, intl));
      if (byIntl[0]) return byIntl[0];
    }
    const byExact = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.phone, trimmed));
    return byExact[0];
  }

  async createMember(member: InsertMember): Promise<Member> {
    const result = await db.insert(schema.members).values(member).returning();
    return result[0];
  }

  async updateMember(
    id: number,
    member: Partial<InsertMember>,
  ): Promise<Member | undefined> {
    const result = await db
      .update(schema.members)
      .set(member)
      .where(eq(schema.members.id, id))
      .returning();
    return result[0];
  }

  async deleteMember(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.members)
      .where(eq(schema.members.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPayments(): Promise<MembershipPayment[]> {
    return await db
      .select()
      .from(schema.membershipPayments)
      .orderBy(desc(schema.membershipPayments.createdAt));
  }

  async getPaymentsByMember(memberId: number): Promise<MembershipPayment[]> {
    return await db
      .select()
      .from(schema.membershipPayments)
      .where(eq(schema.membershipPayments.memberId, memberId));
  }

  async createPayment(
    payment: InsertMembershipPayment,
  ): Promise<MembershipPayment> {
    const result = await db
      .insert(schema.membershipPayments)
      .values(payment)
      .returning();
    return result[0];
  }

  async updatePaymentStatus(
    id: number,
    status: string,
  ): Promise<MembershipPayment | undefined> {
    const result = await db
      .update(schema.membershipPayments)
      .set({ status })
      .where(eq(schema.membershipPayments.id, id))
      .returning();
    return result[0];
  }

  async createGenericPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(schema.payments).values(payment).returning();
    return result[0];
  }

  async getPaymentByTransactionId(
    transactionId: string,
  ): Promise<Payment | undefined> {
    const result = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.transactionId, transactionId));
    return result[0];
  }

  async updateGenericPaymentStatus(
    id: number,
    status: string,
  ): Promise<Payment | undefined> {
    const result = await db
      .update(schema.payments)
      .set({ status, paidAt: status === "completed" ? new Date() : null })
      .where(eq(schema.payments.id, id))
      .returning();
    return result[0];
  }

  async updateGenericPaymentStatusIfPending(
    id: number,
    status: string,
  ): Promise<Payment | undefined> {
    // Ensure idempotency for webhook/verify callbacks.
    const result = await db
      .update(schema.payments)
      .set({ status, paidAt: status === "completed" ? new Date() : null })
      .where(
        and(eq(schema.payments.id, id), eq(schema.payments.status, "pending")),
      )
      .returning();
    return result[0];
  }

  async createPendingMemberApplication(
    application: InsertPendingMemberApplication,
  ): Promise<PendingMemberApplication> {
    const result = await db
      .insert(schema.pendingMemberApplications)
      .values(application)
      .returning();
    return result[0];
  }

  async getPendingMemberApplicationByTxId(
    transactionId: string,
  ): Promise<PendingMemberApplication | undefined> {
    const result = await db
      .select()
      .from(schema.pendingMemberApplications)
      .where(eq(schema.pendingMemberApplications.transactionId, transactionId));
    return result[0];
  }

  async deletePendingMemberApplication(
    transactionId: string,
  ): Promise<boolean> {
    const result = await db
      .delete(schema.pendingMemberApplications)
      .where(eq(schema.pendingMemberApplications.transactionId, transactionId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getDonations(): Promise<Donation[]> {
    return await db
      .select()
      .from(schema.donations)
      .orderBy(desc(schema.donations.createdAt));
  }

  async getDonationByTransactionId(
    transactionId: string,
  ): Promise<Donation | undefined> {
    const result = await db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.transactionId, transactionId));
    return result[0];
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const result = await db
      .insert(schema.donations)
      .values(donation)
      .returning();
    return result[0];
  }

  async updateDonationStatus(
    id: number,
    status: string,
  ): Promise<Donation | undefined> {
    const result = await db
      .update(schema.donations)
      .set({ status })
      .where(eq(schema.donations.id, id))
      .returning();
    return result[0];
  }

  async updateDonationStatusIfPending(
    id: number,
    status: string,
  ): Promise<Donation | undefined> {
    // Ensure idempotency for webhook/verify callbacks.
    const result = await db
      .update(schema.donations)
      .set({ status })
      .where(
        and(
          eq(schema.donations.id, id),
          eq(schema.donations.status, "pending"),
        ),
      )
      .returning();
    return result[0];
  }

  async getPosts(): Promise<Post[]> {
    return await db
      .select()
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt));
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, id));
    return result[0];
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const result = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug));
    return result[0];
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(schema.posts).values(post).returning();
    return result[0];
  }

  async updatePost(
    id: number,
    post: Partial<InsertPost>,
  ): Promise<Post | undefined> {
    const result = await db
      .update(schema.posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(schema.posts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(schema.posts).where(eq(schema.posts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPages(): Promise<Page[]> {
    return await db
      .select()
      .from(schema.pages)
      .orderBy(desc(schema.pages.createdAt));
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const result = await db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.slug, slug));
    return result[0];
  }

  async createPage(page: InsertPage): Promise<Page> {
    const result = await db.insert(schema.pages).values(page).returning();
    return result[0];
  }

  async updatePage(
    id: number,
    page: Partial<InsertPage>,
  ): Promise<Page | undefined> {
    const result = await db
      .update(schema.pages)
      .set({ ...page, updatedAt: new Date() })
      .where(eq(schema.pages.id, id))
      .returning();
    return result[0];
  }

  async getCareerJobs(): Promise<CareerJob[]> {
    return await db
      .select()
      .from(schema.careerJobs)
      .orderBy(desc(schema.careerJobs.createdAt));
  }

  async getPublishedCareerJobs(): Promise<CareerJob[]> {
    return await db
      .select()
      .from(schema.careerJobs)
      .where(eq(schema.careerJobs.status, "published"))
      .orderBy(desc(schema.careerJobs.createdAt));
  }

  async getCareerJobById(id: number): Promise<CareerJob | undefined> {
    const result = await db
      .select()
      .from(schema.careerJobs)
      .where(eq(schema.careerJobs.id, id));
    return result[0];
  }

  async createCareerJob(job: InsertCareerJob): Promise<CareerJob> {
    const result = await db.insert(schema.careerJobs).values(job).returning();
    return result[0];
  }

  async updateCareerJob(
    id: number,
    job: Partial<InsertCareerJob>,
  ): Promise<CareerJob | undefined> {
    const result = await db
      .update(schema.careerJobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(schema.careerJobs.id, id))
      .returning();
    return result[0];
  }

  async deleteCareerJob(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.careerJobs)
      .where(eq(schema.careerJobs.id, id))
      .returning({ id: schema.careerJobs.id });
    return result.length > 0;
  }

  async getSmsTemplates(): Promise<SmsTemplate[]> {
    return await db
      .select()
      .from(schema.smsTemplates)
      .orderBy(desc(schema.smsTemplates.createdAt));
  }

  async getSmsTemplateById(id: number): Promise<SmsTemplate | undefined> {
    const result = await db
      .select()
      .from(schema.smsTemplates)
      .where(eq(schema.smsTemplates.id, id));
    return result[0];
  }

  async createSmsTemplate(template: InsertSmsTemplate): Promise<SmsTemplate> {
    const result = await db
      .insert(schema.smsTemplates)
      .values(template)
      .returning();
    return result[0];
  }

  async updateSmsTemplate(
    id: number,
    template: Partial<InsertSmsTemplate>,
  ): Promise<SmsTemplate | undefined> {
    const result = await db
      .update(schema.smsTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(schema.smsTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteSmsTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.smsTemplates)
      .where(eq(schema.smsTemplates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSmsLogs(): Promise<SmsLog[]> {
    return await db
      .select()
      .from(schema.smsLogs)
      .orderBy(desc(schema.smsLogs.sentAt));
  }

  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const result = await db.insert(schema.smsLogs).values(log).returning();
    return result[0];
  }

  async getSmsSendStats(): Promise<{ delivered: number }> {
    const [row] = await db
      .select({ delivered: count() })
      .from(schema.smsLogs)
      .where(eq(schema.smsLogs.status, "sent"));

    return { delivered: Number(row?.delivered ?? 0) };
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(schema.settings);
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    const result = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key));
    return result[0];
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const existing = await this.getSettingByKey(setting.key);
    if (existing) {
      const result = await db
        .update(schema.settings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(schema.settings.key, setting.key))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(schema.settings)
        .values(setting)
        .returning();
      return result[0];
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db
      .delete(schema.settings)
      .where(eq(schema.settings.key, key));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getRevenueStats(): Promise<{
    membershipETB: number;
    membershipUSD: number;
    donationETB: number;
    donationUSD: number;
  }> {
    const legacyMembershipPayments = await db
      .select()
      .from(schema.membershipPayments)
      .where(eq(schema.membershipPayments.status, "completed"));
    const genericPaymentsCompleted = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.status, "completed"));
    const donations = await db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.status, "completed"));

    const genericMembership = genericPaymentsCompleted.filter((p: Payment) => {
      const t = String(p.type || "").toLowerCase();
      return t === "membership" || t === "membership_renewal";
    });

    /** Same tx often exists in both tables after Chapa finalize (mirror admin payments list). */
    const genericMembershipTxIds = new Set(
      genericMembership.map((p) => p.transactionId),
    );
    const legacyOnlyMembership = legacyMembershipPayments.filter(
      (p: MembershipPayment) => !genericMembershipTxIds.has(p.transactionId),
    );

    const cur = (c: string) => String(c || "").toUpperCase();

    const membershipETB =
      legacyOnlyMembership
        .filter((p) => cur(p.currency) === "ETB")
        .reduce((sum, p) => sum + p.amount, 0) +
      genericMembership
        .filter((p) => cur(p.currency) === "ETB")
        .reduce((sum, p) => sum + p.amount, 0);
    const membershipUSD =
      legacyOnlyMembership
        .filter((p) => cur(p.currency) === "USD")
        .reduce((sum, p) => sum + p.amount, 0) +
      genericMembership
        .filter((p) => cur(p.currency) === "USD")
        .reduce((sum, p) => sum + p.amount, 0);
    const donationETB = donations
      .filter((d) => cur(d.currency) === "ETB")
      .reduce((sum, d) => sum + d.amount, 0);
    const donationUSD = donations
      .filter((d) => cur(d.currency) === "USD")
      .reduce((sum, d) => sum + d.amount, 0);

    return { membershipETB, membershipUSD, donationETB, donationUSD };
  }

  async createOtp(
    phone: string,
    code: string,
    purpose: string,
    expiresAt: Date,
  ): Promise<OtpVerification> {
    await db
      .delete(schema.otpVerifications)
      .where(
        and(
          eq(schema.otpVerifications.phone, phone),
          eq(schema.otpVerifications.purpose, purpose),
        ),
      );
    const result = await db
      .insert(schema.otpVerifications)
      .values({
        phone,
        code,
        purpose,
        verified: false,
        expiresAt,
      })
      .returning();
    return result[0];
  }

  async getValidOtp(
    phone: string,
    code: string,
    purpose: string,
  ): Promise<OtpVerification | undefined> {
    const result = await db
      .select()
      .from(schema.otpVerifications)
      .where(
        and(
          eq(schema.otpVerifications.phone, phone),
          eq(schema.otpVerifications.code, code),
          eq(schema.otpVerifications.purpose, purpose),
          eq(schema.otpVerifications.verified, false),
        ),
      );
    const otp = result[0];
    if (otp && new Date(otp.expiresAt) > new Date()) {
      return otp;
    }
    return undefined;
  }

  async markOtpVerified(id: number): Promise<void> {
    await db
      .update(schema.otpVerifications)
      .set({ verified: true })
      .where(eq(schema.otpVerifications.id, id));
  }

  async deleteOtpsForPhoneAndPurpose(
    phone: string,
    purpose: string,
  ): Promise<void> {
    await db
      .delete(schema.otpVerifications)
      .where(
        and(
          eq(schema.otpVerifications.phone, phone),
          eq(schema.otpVerifications.purpose, purpose),
        ),
      );
  }

  async hasRecentOtp(
    phone: string,
    purpose: string,
    since: Date,
  ): Promise<boolean> {
    const result = await db
      .select({ id: schema.otpVerifications.id })
      .from(schema.otpVerifications)
      .where(
        and(
          eq(schema.otpVerifications.phone, phone),
          eq(schema.otpVerifications.purpose, purpose),
          gt(schema.otpVerifications.createdAt, since),
        ),
      )
      .limit(1);
    return result.length > 0;
  }

  async consumeVerifiedOtp(phone: string, purpose: string): Promise<boolean> {
    const result = await db
      .delete(schema.otpVerifications)
      .where(
        and(
          eq(schema.otpVerifications.phone, phone),
          eq(schema.otpVerifications.purpose, purpose),
          eq(schema.otpVerifications.verified, true),
          gt(schema.otpVerifications.expiresAt, new Date()),
        ),
      )
      .returning({ id: schema.otpVerifications.id });
    return result.length > 0;
  }

  async deleteExpiredOtps(): Promise<void> {
    await db
      .delete(schema.otpVerifications)
      .where(lte(schema.otpVerifications.expiresAt, new Date()));
  }
}

export const storage = new DbStorage();
