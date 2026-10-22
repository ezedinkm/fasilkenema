import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { storage } from "./storage";

export const RESEND_API_KEY_SETTING_KEY = "email.resend.apiKeyEncrypted";

const RESEND_KEY_ENCRYPTION_VERSION = 1;

type EncryptedResendApiKey = {
  version: 1;
  iv: string;
  authTag: string;
  ciphertext: string;
};

function getResendEncryptionKey(): Buffer {
  const masterKey = String(process.env.CHAPA_ENCRYPTION_KEY ?? "").trim();
  if (!masterKey) {
    throw new Error("Resend API key encryption is not configured");
  }

  return createHash("sha256")
    .update("fasil-club:resend-api-key:v1:")
    .update(masterKey)
    .digest();
}

function encryptResendApiKey(apiKey: string): EncryptedResendApiKey {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getResendEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);

  return {
    version: RESEND_KEY_ENCRYPTION_VERSION,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

function decryptResendApiKey(value: unknown): string {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid saved Resend API key");
  }

  const encrypted = value as Partial<EncryptedResendApiKey>;
  if (
    encrypted.version !== RESEND_KEY_ENCRYPTION_VERSION ||
    typeof encrypted.iv !== "string" ||
    typeof encrypted.authTag !== "string" ||
    typeof encrypted.ciphertext !== "string"
  ) {
    throw new Error("Invalid saved Resend API key");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getResendEncryptionKey(),
    Buffer.from(encrypted.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getSavedResendApiKey(): Promise<string | null> {
  const setting = await storage.getSettingByKey(RESEND_API_KEY_SETTING_KEY);
  if (!setting) return null;
  return decryptResendApiKey(setting.value);
}

export async function saveResendApiKey(apiKey: string): Promise<void> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    throw new Error("Enter a Resend API key");
  }

  await storage.upsertSetting({
    key: RESEND_API_KEY_SETTING_KEY,
    value: encryptResendApiKey(trimmedKey),
    description: "Encrypted Resend API key",
  });
}

export async function getResendApiKeyStatus(): Promise<{
  apiKeyConfigured: boolean;
  keySource: "settings" | "environment" | "none";
}> {
  const setting = await storage.getSettingByKey(RESEND_API_KEY_SETTING_KEY);
  if (setting) {
    return { apiKeyConfigured: true, keySource: "settings" };
  }
  if (String(process.env.RESEND_API_KEY ?? "").trim()) {
    return { apiKeyConfigured: true, keySource: "environment" };
  }
  return { apiKeyConfigured: false, keySource: "none" };
}
