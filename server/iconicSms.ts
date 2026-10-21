import {
  ethiopianLocalToInternational,
  normalizeEthiopianMobileLocal,
} from "@shared/ethiopianPhone";
import { SMS_ICONIC_SETTING_KEYS } from "@shared/schema";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type SmsOutboundCategory =
  | "general"
  | "otp_registration"
  | "otp_password_reset"
  | "payment_admin"
  | "donor_thankyou"
  | "renewal_thankyou"
  | "membership_welcome"
  | "password_changed"
  | "broadcast";

export type SendSmsOptions = {
  category?: SmsOutboundCategory;
  skipDbLog?: boolean;
};

export type OtpPurpose = "registration" | "password_reset";

const ICONIC_SMS_SEND_URL = "https://api.iconicsms.et/api/v1/sms/send";
const ICONIC_SMS_BALANCE_URL = "https://api.iconicsms.et/api/v1/balance";
const SMS_FETCH_MS = 28_000;
const ICONIC_SMS_KEY_ENCRYPTION_VERSION = 1;

type EncryptedIconicSmsKey = {
  version: 1;
  iv: string;
  authTag: string;
  ciphertext: string;
};

function getIconicSmsEncryptionKey(): Buffer {
  const masterKey = String(process.env.CHAPA_ENCRYPTION_KEY ?? "").trim();
  if (!masterKey) {
    throw new Error("SMS API key encryption is not configured");
  }

  return createHash("sha256")
    .update("fasil-club:iconic-sms-api-key:v1:")
    .update(masterKey)
    .digest();
}

export function encryptIconicSmsApiKey(apiKey: string): EncryptedIconicSmsKey {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    getIconicSmsEncryptionKey(),
    iv,
  );
  const ciphertext = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);

  return {
    version: ICONIC_SMS_KEY_ENCRYPTION_VERSION,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export function decryptIconicSmsApiKey(value: unknown): string {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid saved IconicSMS API key");
  }
  const encrypted = value as Partial<EncryptedIconicSmsKey>;
  if (
    encrypted.version !== ICONIC_SMS_KEY_ENCRYPTION_VERSION ||
    typeof encrypted.iv !== "string" ||
    typeof encrypted.authTag !== "string" ||
    typeof encrypted.ciphertext !== "string"
  ) {
    throw new Error("Invalid saved IconicSMS API key");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getIconicSmsEncryptionKey(),
    Buffer.from(encrypted.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

type IconicSmsCredential = {
  apiKey: string;
  source: "settings" | "environment" | "none";
};

async function getIconicSmsCredential(): Promise<IconicSmsCredential> {
  const { storage } = await import("./storage");
  const savedKey = await storage.getSettingByKey(
    SMS_ICONIC_SETTING_KEYS.apiKeyEncrypted,
  );

  if (savedKey) {
    return {
      apiKey: decryptIconicSmsApiKey(savedKey.value).trim(),
      source: "settings",
    };
  }

  const environmentKey = String(process.env.ICONIC_SMS_API_KEY ?? "").trim();
  return {
    apiKey: environmentKey,
    source: environmentKey ? "environment" : "none",
  };
}

export async function getIconicSmsApiKeyStatus(): Promise<{
  apiKeyConfigured: boolean;
  keySource: "settings" | "environment" | "none";
}> {
  try {
    const credential = await getIconicSmsCredential();
    return {
      apiKeyConfigured: Boolean(credential.apiKey),
      keySource: credential.source,
    };
  } catch {
    return { apiKeyConfigured: false, keySource: "none" };
  }
}

function otpPurposeToCategory(purpose: OtpPurpose): SmsOutboundCategory {
  return purpose === "password_reset"
    ? "otp_password_reset"
    : "otp_registration";
}

function formatEthiopianPhone(phone: string): string {
  const local = normalizeEthiopianMobileLocal(phone);
  if (local) return ethiopianLocalToInternational(local);

  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = `251${cleaned.slice(1)}`;
  if (!cleaned.startsWith("251")) cleaned = `251${cleaned}`;
  return `+${cleaned}`;
}

async function getSenderId(): Promise<string | undefined> {
  try {
    const { storage } = await import("./storage");
    const setting = await storage.getSettingByKey(
      SMS_ICONIC_SETTING_KEYS.senderId,
    );
    const senderId = String(setting?.value ?? "").trim();
    return senderId || undefined;
  } catch {
    // A sender ID is optional; IconicSMS uses the account's default if absent.
    return undefined;
  }
}

function getProviderError(payload: any, status: number): string {
  const error = payload?.error;
  if (typeof error === "string" && error.trim()) return error.trim();
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error?.code === "string" && error.code.trim()) {
    return error.code.trim();
  }
  return `IconicSMS request failed (HTTP ${status})`;
}

export async function testIconicSmsConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  let apiKey: string;
  try {
    apiKey = (await getIconicSmsCredential()).apiKey;
  } catch {
    return {
      success: false,
      message: "The saved SMS API key could not be read. Replace it in Settings.",
    };
  }
  if (!apiKey) {
    return {
      success: false,
      message: "No IconicSMS API key is configured.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SMS_FETCH_MS);
  try {
    const response = await fetch(ICONIC_SMS_BALANCE_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-IconicSMS-Key": apiKey,
        "User-Agent": "FasilClub-SMS/1.0",
      },
      signal: controller.signal,
    });
    const raw = await response.text();
    let payload: any = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.success !== true) {
      const providerError = getProviderError(payload, response.status);
      return {
        success: false,
        message: /invalid|missing/i.test(providerError) &&
          /api.?key|token/i.test(providerError)
          ? "IconicSMS rejected this API key. Replace it with the key from Developer → API Keys."
          : `IconicSMS connection check failed (HTTP ${response.status}).`,
      };
    }

    return {
      success: true,
      message: "IconicSMS accepted the API key. No SMS was sent by this check.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error && /abort/i.test(error.name)
          ? "IconicSMS connection check timed out."
          : "Could not reach IconicSMS. Try again shortly.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function persistOutboundSms(params: {
  recipient: string;
  message: string;
  status: "sent" | "failed";
  category: string;
}) {
  try {
    const { storage } = await import("./storage");
    await storage.createSmsLog({
      recipient: params.recipient,
      message:
        params.message.length > 2000
          ? `${params.message.slice(0, 1997)}...`
          : params.message,
      status: params.status,
      category: params.category,
    });
  } catch (error) {
    console.error("SMS log error:", error);
  }
}

/** A successful result means IconicSMS accepted the SMS into its queue. */
export async function sendSms(
  phone: string,
  message: string,
  options?: SendSmsOptions,
): Promise<SendSmsResult> {
  let apiKey: string;
  try {
    apiKey = (await getIconicSmsCredential()).apiKey;
  } catch {
    console.error("[iconicSms] Saved API key could not be decrypted");
    return { success: false, error: "SMS configuration error" };
  }
  if (!apiKey) return { success: false, error: "SMS not configured" };

  const recipient = formatEthiopianPhone(phone);
  const category = options?.category ?? "general";
  const shouldLog = options?.skipDbLog !== true;
  const log = async (status: "sent" | "failed") => {
    if (shouldLog) {
      await persistOutboundSms({ recipient, message, status, category });
    }
  };

  const senderId = await getSenderId();
  const body: Record<string, string> = { phone: recipient, msg: message };
  if (senderId) body.shortcode_id = senderId;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SMS_FETCH_MS);
  try {
    const response = await fetch(ICONIC_SMS_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-IconicSMS-Key": apiKey,
        "User-Agent": "FasilClub-SMS/1.0",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const raw = await response.text();
    let payload: any = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.success !== true) {
      const error = getProviderError(payload, response.status);
      await log("failed");
      return { success: false, error };
    }

    await log("sent");
    const messageId = payload?.data?.message?.id;
    return {
      success: true,
      ...(typeof messageId === "string" ? { messageId } : {}),
    };
  } catch (error) {
    const message =
      error instanceof Error && /abort/i.test(error.name)
        ? "SMS request timed out"
        : error instanceof Error
          ? error.message
          : "SMS request failed";
    await log("failed");
    return { success: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function deliverOtpSms(
  phone: string,
  code: string,
  purpose: OtpPurpose = "registration",
): Promise<{ success: boolean; error?: string }> {
  const message =
    purpose === "password_reset"
      ? `FASIL S.C.: Your password reset code is ${code}. Valid for 5 minutes. Do not share this code.`
      : `FASIL S.C.: Your OTP is ${code}. Valid for 5 minutes.`;
  const result = await sendSms(phone, message, {
    category: otpPurposeToCategory(purpose),
  });
  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}

/** Retry once after a short delay to handle transient gateway/network failures. */
export async function deliverOtpSmsWithRetry(
  phone: string,
  code: string,
  purpose: OtpPurpose = "registration",
): Promise<{ success: boolean; error?: string }> {
  const first = await deliverOtpSms(phone, code, purpose);
  if (first.success) return first;
  await new Promise((resolve) => setTimeout(resolve, 1100));
  return deliverOtpSms(phone, code, purpose);
}

export async function sendOtp(
  phone: string,
  purpose: OtpPurpose = "registration",
) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const delivered = await deliverOtpSms(phone, code, purpose);
  return delivered.success
    ? { success: true, code }
    : { success: false, error: delivered.error };
}

export function userFacingSmsFailureMessage(
  rawError: string | undefined,
): string {
  const error = String(rawError || "").trim();
  if (!error || error === "SMS not configured") {
    return "Text messaging is not configured on the server. Please contact the club office for help.";
  }
  if (/timed out|timeout|abort/i.test(error)) {
    return "The SMS service took too long to respond. Please try again in a moment.";
  }
  if (/invalid_recipient|phone number/i.test(error)) {
    return "The SMS provider rejected this phone number. Check the number and try again.";
  }
  if (/insufficient_balance/i.test(error)) {
    return "The SMS provider account needs a balance top-up. Please contact the club office.";
  }
  return "We could not send the SMS. Please wait a minute and try again, or contact the club office.";
}

export const sendDonorThankYouSms = (
  phone: string,
  amount: number,
  currency: string,
) =>
  sendSms(
    phone,
    `Thank you! FASIL S.C. received your donation of ${amount} ${currency}.`,
    { category: "donor_thankyou" },
  );

export const sendMembershipRenewalThankYouSms = (
  phone: string,
  amount: number,
  currency: string,
  expiry: Date,
) =>
  sendSms(
    phone,
    `FASIL S.C.: Renewal confirmed. ${amount} ${currency}. Expiry: ${expiry.toISOString().slice(0, 10)}.`,
    { category: "renewal_thankyou" },
  );

export const sendPasswordResetSuccessSms = (phone: string) =>
  sendSms(phone, "FASIL S.C.: Your password was updated. If not you, contact support.", {
    category: "password_changed",
  });

export function sendMembershipWelcomeSms(
  phone: string,
  fullName: string,
  membershipNumber: string,
): Promise<SendSmsResult> {
  const safeName = String(fullName || "Member").trim().slice(0, 80);
  return sendSms(
    phone,
    `FASIL S.C.: Welcome ${safeName}! Your membership number is ${membershipNumber}. Thank you for joining.`,
    { category: "membership_welcome" },
  );
}

export async function sendPaymentNotificationWithTotal(
  type: "membership" | "donation",
  amount: number,
  currency: string,
  notificationPhone: string,
  totalETB: number,
  totalUSD: number,
): Promise<SendSmsResult> {
  const typeLabel = type === "membership" ? "Membership" : "Donation";
  const message =
    `FASIL S.C.\n` +
    `New ${typeLabel}: ${amount} ${currency}\n` +
    `Totals:\n` +
    `ETB: ${totalETB}\n` +
    `USD: ${totalUSD}`;
  return sendSms(notificationPhone, message, { category: "payment_admin" });
}
