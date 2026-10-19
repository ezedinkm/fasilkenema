import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  try {
    const existingAdmin = await storage.getAdminByEmail("admin@gmail.com");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("112233", 10);
      await storage.createAdmin({
        email: "admin@gmail.com",
        password: hashedPassword,
        fullName: "Admin User",
      });
      console.log("Created default admin user (admin@gmail.com / 112233)");
    }

    const membershipTiers = await storage.getSettingByKey("membership_tiers");
    if (!membershipTiers) {
      await storage.upsertSetting({
        key: "membership_tiers",
        value: [
          {
            id: "silver",
            name: "Silver",
            priceETB: 500,
            priceUSD: 15,
            duration: "1 year",
          },
          {
            id: "gold",
            name: "Gold",
            priceETB: 1000,
            priceUSD: 25,
            duration: "1 year",
          },
          {
            id: "platinum",
            name: "Platinum",
            priceETB: 2000,
            priceUSD: 50,
            duration: "1 year",
          },
        ],
        description: "Membership tier configurations",
      });
      console.log("Created default membership tiers");
    }

    const smsTemplates = await storage.getSmsTemplates();
    if (smsTemplates.length === 0) {
      await storage.createSmsTemplate({
        name: "Welcome",
        message:
          "Welcome to Fasil Kenema FC Fan Club! Your membership number is {{membershipNumber}}. Thank you for your support!",
      });
      await storage.createSmsTemplate({
        name: "Renewal Reminder",
        message:
          "Dear {{name}}, your Fasil Kenema FC membership expires on {{expiryDate}}. Renew now to continue enjoying exclusive benefits!",
      });
      console.log("Created default SMS templates");
    }

    const brandingHeaderText = await storage.getSettingByKey(
      "branding.headerText",
    );
    if (!brandingHeaderText) {
      await storage.upsertSetting({
        key: "branding.headerText",
        value: "FASIL S.C",
        description: "Header text displayed in navbar",
      });
    }

    const brandingHeaderSubtext = await storage.getSettingByKey(
      "branding.headerSubtext",
    );
    if (!brandingHeaderSubtext) {
      await storage.upsertSetting({
        key: "branding.headerSubtext",
        value: "sport Club",
        description: "Subtext displayed below header in navbar",
      });
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Seeding error:", error);
  }

  process.exit(0);
}

seed();
