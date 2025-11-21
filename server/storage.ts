import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
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
  SmsTemplate,
  InsertSmsTemplate,
  SmsLog,
  InsertSmsLog,
  Setting,
  InsertSetting,
} from "@shared/schema";

export interface IStorage {
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  
  getMembers(): Promise<Member[]>;
  getMemberById(id: number): Promise<Member | undefined>;
  getMemberByNumber(membershipNumber: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;
  
  getPayments(): Promise<MembershipPayment[]>;
  getPaymentsByMember(memberId: number): Promise<MembershipPayment[]>;
  createPayment(payment: InsertMembershipPayment): Promise<MembershipPayment>;
  updatePaymentStatus(id: number, status: string): Promise<MembershipPayment | undefined>;
  
  getDonations(): Promise<Donation[]>;
  getDonationByTransactionId(transactionId: string): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonationStatus(id: number, status: string): Promise<Donation | undefined>;
  
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
  
  getSmsTemplates(): Promise<SmsTemplate[]>;
  getSmsTemplateById(id: number): Promise<SmsTemplate | undefined>;
  createSmsTemplate(template: InsertSmsTemplate): Promise<SmsTemplate>;
  updateSmsTemplate(id: number, template: Partial<InsertSmsTemplate>): Promise<SmsTemplate | undefined>;
  deleteSmsTemplate(id: number): Promise<boolean>;
  
  getSmsLogs(): Promise<SmsLog[]>;
  createSmsLog(log: InsertSmsLog): Promise<SmsLog>;
  
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
}

export class DbStorage implements IStorage {
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
    return result[0];
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(schema.adminUsers).values(admin).returning();
    return result[0];
  }

  async getMembers(): Promise<Member[]> {
    return await db.select().from(schema.members).orderBy(desc(schema.members.createdAt));
  }

  async getMemberById(id: number): Promise<Member | undefined> {
    const result = await db.select().from(schema.members).where(eq(schema.members.id, id));
    return result[0];
  }

  async getMemberByNumber(membershipNumber: string): Promise<Member | undefined> {
    const result = await db.select().from(schema.members).where(eq(schema.members.membershipNumber, membershipNumber));
    return result[0];
  }

  async createMember(member: InsertMember): Promise<Member> {
    const result = await db.insert(schema.members).values(member).returning();
    return result[0];
  }

  async updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined> {
    const result = await db.update(schema.members).set(member).where(eq(schema.members.id, id)).returning();
    return result[0];
  }

  async deleteMember(id: number): Promise<boolean> {
    const result = await db.delete(schema.members).where(eq(schema.members.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPayments(): Promise<MembershipPayment[]> {
    return await db.select().from(schema.membershipPayments).orderBy(desc(schema.membershipPayments.createdAt));
  }

  async getPaymentsByMember(memberId: number): Promise<MembershipPayment[]> {
    return await db.select().from(schema.membershipPayments).where(eq(schema.membershipPayments.memberId, memberId));
  }

  async createPayment(payment: InsertMembershipPayment): Promise<MembershipPayment> {
    const result = await db.insert(schema.membershipPayments).values(payment).returning();
    return result[0];
  }

  async updatePaymentStatus(id: number, status: string): Promise<MembershipPayment | undefined> {
    const result = await db.update(schema.membershipPayments).set({ status }).where(eq(schema.membershipPayments.id, id)).returning();
    return result[0];
  }

  async getDonations(): Promise<Donation[]> {
    return await db.select().from(schema.donations).orderBy(desc(schema.donations.createdAt));
  }

  async getDonationByTransactionId(transactionId: string): Promise<Donation | undefined> {
    const result = await db.select().from(schema.donations).where(eq(schema.donations.transactionId, transactionId));
    return result[0];
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const result = await db.insert(schema.donations).values(donation).returning();
    return result[0];
  }

  async updateDonationStatus(id: number, status: string): Promise<Donation | undefined> {
    const result = await db.update(schema.donations).set({ status }).where(eq(schema.donations.id, id)).returning();
    return result[0];
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt));
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
    return result[0];
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const result = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug));
    return result[0];
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(schema.posts).values(post).returning();
    return result[0];
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const result = await db.update(schema.posts).set({ ...post, updatedAt: new Date() }).where(eq(schema.posts.id, id)).returning();
    return result[0];
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(schema.posts).where(eq(schema.posts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPages(): Promise<Page[]> {
    return await db.select().from(schema.pages).orderBy(desc(schema.pages.createdAt));
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const result = await db.select().from(schema.pages).where(eq(schema.pages.slug, slug));
    return result[0];
  }

  async createPage(page: InsertPage): Promise<Page> {
    const result = await db.insert(schema.pages).values(page).returning();
    return result[0];
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    const result = await db.update(schema.pages).set({ ...page, updatedAt: new Date() }).where(eq(schema.pages.id, id)).returning();
    return result[0];
  }

  async getSmsTemplates(): Promise<SmsTemplate[]> {
    return await db.select().from(schema.smsTemplates).orderBy(desc(schema.smsTemplates.createdAt));
  }

  async getSmsTemplateById(id: number): Promise<SmsTemplate | undefined> {
    const result = await db.select().from(schema.smsTemplates).where(eq(schema.smsTemplates.id, id));
    return result[0];
  }

  async createSmsTemplate(template: InsertSmsTemplate): Promise<SmsTemplate> {
    const result = await db.insert(schema.smsTemplates).values(template).returning();
    return result[0];
  }

  async updateSmsTemplate(id: number, template: Partial<InsertSmsTemplate>): Promise<SmsTemplate | undefined> {
    const result = await db.update(schema.smsTemplates).set({ ...template, updatedAt: new Date() }).where(eq(schema.smsTemplates.id, id)).returning();
    return result[0];
  }

  async deleteSmsTemplate(id: number): Promise<boolean> {
    const result = await db.delete(schema.smsTemplates).where(eq(schema.smsTemplates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSmsLogs(): Promise<SmsLog[]> {
    return await db.select().from(schema.smsLogs).orderBy(desc(schema.smsLogs.sentAt));
  }

  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const result = await db.insert(schema.smsLogs).values(log).returning();
    return result[0];
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(schema.settings);
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
    return result[0];
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const existing = await this.getSettingByKey(setting.key);
    if (existing) {
      const result = await db.update(schema.settings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(schema.settings.key, setting.key))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(schema.settings).values(setting).returning();
      return result[0];
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db.delete(schema.settings).where(eq(schema.settings.key, key));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getRevenueStats(): Promise<{
    membershipETB: number;
    membershipUSD: number;
    donationETB: number;
    donationUSD: number;
  }> {
    const payments = await db.select().from(schema.membershipPayments).where(eq(schema.membershipPayments.status, 'completed'));
    const donations = await db.select().from(schema.donations).where(eq(schema.donations.status, 'completed'));

    const membershipETB = payments.filter((p: MembershipPayment) => p.currency === 'ETB').reduce((sum: number, p: MembershipPayment) => sum + p.amount, 0);
    const membershipUSD = payments.filter((p: MembershipPayment) => p.currency === 'USD').reduce((sum: number, p: MembershipPayment) => sum + p.amount, 0);
    const donationETB = donations.filter((d: Donation) => d.currency === 'ETB').reduce((sum: number, d: Donation) => sum + d.amount, 0);
    const donationUSD = donations.filter((d: Donation) => d.currency === 'USD').reduce((sum: number, d: Donation) => sum + d.amount, 0);

    return { membershipETB, membershipUSD, donationETB, donationUSD };
  }
}

export const storage = new DbStorage();
