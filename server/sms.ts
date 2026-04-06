import {
  ethiopianLocalToInternational,
  normalizeEthiopianMobileLocal,
} from "@shared/ethiopianPhone";
import { SMS_GEEZ_SETTING_KEYS } from "@shared/schema";

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

/** Matches OTP API `purpose` in `routes.ts` (`registration` | `password_reset`). */
export type OtpPurpose = "registration" | "password_reset";

function otpPurposeToCategory(purpose: OtpPurpose): SmsOutboundCategory {
  return purpose === "password_reset"
    ? "otp_password_reset"
    : "otp_registration";
}

const GEEZ_CANONICAL_SEND_URL = "https://api.geezsms.com/api/send-sms";
const GEEZ_LEGACY_DOC_URL = "https://api.geezsms.com/api/v1/sms/send";
const GEEZ_SMS_URL = "https://api.geezsms.com/api/send-sms";

function stringFromSettingValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

/**
 * Resolves Geez SMS credentials: **id**, **token**, **sender** (from name).
 * Each field uses DB (`sms.geez.*`) when set, else `GEEZ_SMS_*` env (`db || env`).
 * Send URL: `GEEZ_SMS_URL` or canonical default (not stored in DB).
 */
async function resolveGeezSmsConfig(): Promise<{
  id: string;
  token: string;
  sender: string;
  sendUrl: string;
} | null> {
  let dbId: string | undefined;
  let dbToken: string | undefined;
  let dbSender: string | undefined;

  try {
    const { storage } = await import("./storage");
    const [rowId, rowToken, rowSender] = await Promise.all([
      storage.getSettingByKey(SMS_GEEZ_SETTING_KEYS.id),
      storage.getSettingByKey(SMS_GEEZ_SETTING_KEYS.token),
      storage.getSettingByKey(SMS_GEEZ_SETTING_KEYS.sender),
    ]);
    dbId = stringFromSettingValue(rowId?.value);
    dbToken = stringFromSettingValue(rowToken?.value);
    dbSender = stringFromSettingValue(rowSender?.value);
  } catch {
    // DB unavailable — env-only fallback below
  }

  const envId = stringFromSettingValue(process.env.GEEZ_SMS_ID);
  const envToken = stringFromSettingValue(process.env.GEEZ_SMS_TOKEN);
  const envSender = stringFromSettingValue(process.env.GEEZ_SMS_SENDER);

  const id = dbId || envId;
  const token = dbToken || envToken;
  const sender = dbSender || envSender || "TINA";

  const sendUrl = String(GEEZ_SMS_URL || GEEZ_CANONICAL_SEND_URL).trim();

  if (!id || !token) return null;
  return { id, token, sender, sendUrl };
}

function buildGeezCandidateUrls(sendUrl: string): string[] {
  const configured = sendUrl.replace(/\/+$/, "");
  return Array.from(new Set([configured, GEEZ_CANONICAL_SEND_URL]));
}

/* =========================
   RESPONSE INTERPRETER
========================= */
function interpretGeezResponse(response: Response, raw: string) {
  const text = raw.trim();

  // Many gateways return HTTP 200 with an empty body when the SMS was accepted.
  if (!text) {
    return response.ok ? { ok: true } : { ok: false, error: "Empty response" };
  }

  if (text.toLowerCase().includes("backend is running")) {
    return { ok: false, error: "Wrong endpoint (health check)" };
  }

  const lower = text.toLowerCase();
  if (/^(ok|success|sent|true|accepted|queued)$/i.test(text)) {
    return { ok: true };
  }

  // numeric responses
  if (/^\d+$/.test(text)) {
    const code = Number(text);
    if (code === 0) return { ok: true };
    if (code === 1) return { ok: false, error: "Rejected (code 1)" };
    return { ok: false, error: `Code ${code}` };
  }

  try {
    const data = JSON.parse(text) as Record<string, unknown>;

    if (data.error === true) {
      return {
        ok: false,
        error: String(data.msg || data.message || "Geez error"),
      };
    }

    // Geez multipart API: `{ error: false, msg: "SMS has been sent successfully.", data: {...} }` uses `msg` not `message`.
    if (response.ok && data.error === false) {
      const m = String(data.msg ?? data.message ?? "").toLowerCase();
      if (
        m.includes("sent") ||
        m.includes("success") ||
        m.includes("queued") ||
        m.includes("submitted") ||
        m.length === 0
      ) {
        const d = data.data as Record<string, unknown> | undefined;
        return { ok: true, id: d?.api_log_id ?? d?.message_id };
      }
    }

    const codeVal = data.code;
    if (codeVal === 0 || codeVal === "0") {
      return { ok: true, id: data.message_id ?? data.id };
    }
    if (codeVal === 200 || codeVal === "200") {
      return { ok: true, id: data.message_id ?? data.id };
    }

    const st = data.status;
    if (st === true && data.error !== true) {
      return { ok: true, id: data.message_id ?? data.id };
    }
    if (st === 200 || st === "200" || st === "success") {
      return { ok: true, id: data.message_id ?? data.id };
    }

    if (
      data.success === true ||
      data.status === "success" ||
      data.sent === true ||
      data.ok === true
    ) {
      return { ok: true, id: data.message_id ?? data.id };
    }

    // Some APIs return 200 + { message | msg: "..." } only; treat as success if HTTP OK and no explicit failure.
    if (response.ok && data.error !== true) {
      const raw =
        typeof data.message === "string"
          ? data.message
          : typeof data.msg === "string"
            ? data.msg
            : "";
      const m = raw.toLowerCase();
      if (
        m.includes("success") ||
        m.includes("sent") ||
        m.includes("queued") ||
        m.includes("submitted") ||
        m.includes("deliver")
      ) {
        return { ok: true, id: data.message_id ?? data.id };
      }
    }

    return {
      ok: false,
      error: String(data.msg || data.message || "Unknown error"),
    };
  } catch {
    if (
      response.ok &&
      lower.length > 0 &&
      lower.length < 200 &&
      !lower.includes("error") &&
      !lower.includes("fail")
    ) {
      return { ok: true };
    }
    return { ok: false, error: text.slice(0, 120) };
  }
}

const SMS_FETCH_MS = 28_000;

function geezPhoneDigits(intlOrLocal: string): string {
  return intlOrLocal.replace(/\D/g, "");
}

/** `+2519…` / `2519…` → local `09…` / `07…` for gateways that expect domestic format. */
function intlDigitsToLocal10(digits: string): string | null {
  if (
    digits.startsWith("251") &&
    digits.length === 12 &&
    /^251[79]\d{8}$/.test(digits)
  ) {
    return `0${digits.slice(3)}`;
  }
  return null;
}

/** Geez dashboards differ: some expect `id`+`to`, others `shortcode_id`+`phone` (digits only). */
function buildGeezJsonBodies(payload: {
  id: string;
  token: string;
  from: string;
  to: string;
  msg: string;
}): Record<string, string>[] {
  const digits = geezPhoneDigits(payload.to);
  const local10 = intlDigitsToLocal10(digits);
  const nineDigit = local10 && local10.length === 10 ? local10.slice(1) : null;

  const variants: Record<string, string>[] = [
    {
      id: payload.id,
      token: payload.token,
      from: payload.from,
      to: payload.to,
      msg: payload.msg,
    },
    {
      shortcode_id: payload.id,
      token: payload.token,
      sender: payload.from,
      phone: digits,
      msg: payload.msg,
    },
    {
      id: payload.id,
      token: payload.token,
      from: payload.from,
      phone: digits,
      msg: payload.msg,
    },
    {
      shortcode_id: payload.id,
      token: payload.token,
      sender: payload.from,
      to: digits,
      message: payload.msg,
    },
  ];

  if (local10) {
    variants.push(
      {
        shortcode_id: payload.id,
        token: payload.token,
        sender: payload.from,
        phone: local10,
        msg: payload.msg,
      },
      {
        id: payload.id,
        token: payload.token,
        from: payload.from,
        to: local10,
        msg: payload.msg,
      },
    );
  }
  if (nineDigit) {
    variants.push({
      shortcode_id: payload.id,
      token: payload.token,
      sender: payload.from,
      phone: nineDigit,
      msg: payload.msg,
    });
  }

  const seen = new Set<string>();
  return variants.filter((v) => {
    const k = JSON.stringify(v);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function postGeezJson(url: string, body: Record<string, string>) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), SMS_FETCH_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "FasilClub-SMS/1.0",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

async function sendViaGeezJsonWithVariants(
  url: string,
  payload: { id: string; token: string; from: string; to: string; msg: string },
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  sawHttp200: boolean;
}> {
  const bodies = buildGeezJsonBodies(payload);
  let lastError = "Unknown error";

  for (let i = 0; i < bodies.length; i++) {
    try {
      const res = await postGeezJson(url, bodies[i]);
      const text = await res.text();
      const parsed = interpretGeezResponse(res, text);

      if (parsed.ok) {
        return { success: true, messageId: parsed.id, sawHttp200: res.ok };
      }

      // Never treat HTTP 200 alone as success — Geez JSON /send-sms returns 200 + body "1" for reject,
      // which would skip the working multipart form API and report a false "sent".
      if (res.ok) {
        return {
          success: false,
          error:
            (parsed as { error?: string }).error ||
            text.trim().slice(0, 160) ||
            "SMS gateway error",
          sawHttp200: true,
        };
      }

      lastError =
        (parsed as { error?: string }).error ||
        text.trim().slice(0, 160) ||
        `HTTP ${res.status}`;
      console.warn(
        `[sms] Geez JSON attempt ${i + 1}/${bodies.length} failed ${res.status} ${url.slice(0, 48)}… :: ${lastError}`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      lastError = msg.includes("abort") ? "SMS request timed out" : msg;
      console.warn(
        `[sms] Geez JSON attempt ${i + 1}/${bodies.length} error:`,
        lastError,
      );
    }
  }

  return { success: false, error: lastError, sawHttp200: false };
}

/**
 * Geez legacy multipart/form-data API. Tries international digits, then `09…`, then `9…`.
 */
async function tryGeezFormPost(
  endpoint: string,
  payload: { id: string; token: string; from: string; to: string; msg: string },
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const digits = geezPhoneDigits(payload.to);
  const local10 = intlDigitsToLocal10(digits);
  const nineDigit = local10 && local10.length === 10 ? local10.slice(1) : null;
  const phoneCandidates = [
    digits,
    ...(local10 ? [local10] : []),
    ...(nineDigit ? [nineDigit] : []),
  ];
  const uniquePhones = [...new Set(phoneCandidates)];

  let lastError = "Unknown error";
  for (const phoneVal of uniquePhones) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SMS_FETCH_MS);
    try {
      const form = new FormData();
      form.append("token", payload.token);
      form.append("phone", phoneVal);
      form.append("msg", payload.msg);
      form.append("shortcode_id", payload.id);

      const res = await fetch(endpoint, {
        method: "POST",
        body: form,
        signal: controller.signal,
        headers: {
          "User-Agent": "FasilClub-SMS/1.0",
          Accept: "application/json, text/plain, */*",
        },
      });
      const text = await res.text();
      const parsed = interpretGeezResponse(res, text);

      if (parsed.ok) return { success: true, messageId: parsed.id };

      lastError =
        (parsed as { error?: string }).error ||
        text.trim().slice(0, 160) ||
        `HTTP ${res.status}`;
      console.warn(`[sms] Geez form ${endpoint.slice(0, 56)}… :: ${lastError}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = msg.includes("abort") ? "SMS request timed out" : msg;
      console.warn("[sms] Geez form error:", lastError);
    } finally {
      clearTimeout(timer);
    }
  }

  return { success: false, error: lastError };
}

/* =========================
   DUAL SEND (JSON + FORM)
========================= */
async function sendViaGeez(
  url: string,
  payload: { id: string; token: string; from: string; to: string; msg: string },
) {
  // Geez multipart `/api/v1/sms/send` is what actually delivers for most accounts; JSON `/send-sms`
  // often returns HTTP 200 + "1" (reject) for the same credentials — try form first.
  const formOnLegacy = await tryGeezFormPost(GEEZ_LEGACY_DOC_URL, payload);
  if (formOnLegacy.success) {
    return { success: true as const, messageId: formOnLegacy.messageId };
  }

  const jsonResult = await sendViaGeezJsonWithVariants(url, payload);
  if (jsonResult.success) {
    return { success: true as const, messageId: jsonResult.messageId };
  }

  const urlNorm = url.replace(/\/+$/, "");
  const legacyNorm = GEEZ_LEGACY_DOC_URL.replace(/\/+$/, "");
  if (urlNorm !== legacyNorm) {
    const formOnConfigured = await tryGeezFormPost(url, payload);
    if (formOnConfigured.success) {
      return { success: true as const, messageId: formOnConfigured.messageId };
    }
  }

  return {
    success: false as const,
    error: formOnLegacy.error || jsonResult.error || "SMS gateway error",
  };
}

/* =========================
   DB LOG
========================= */
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
          ? params.message.slice(0, 1997) + "..."
          : params.message,
      status: params.status,
      category: params.category,
    });
  } catch (err) {
    console.error("SMS log error:", err);
  }
}

/* =========================
   MAIN SEND FUNCTION
========================= */
export async function sendSms(
  phone: string,
  message: string,
  options?: SendSmsOptions,
): Promise<SendSmsResult> {
  const category = options?.category || "general";
  const skipDbLog = options?.skipDbLog === true;

  const formattedPhone = formatEthiopianPhone(phone);

  const log = async (status: "sent" | "failed") => {
    if (!skipDbLog) {
      await persistOutboundSms({
        recipient: formattedPhone,
        message,
        status,
        category,
      });
    }
  };

  const geez = await resolveGeezSmsConfig();
  if (!geez) {
    return { success: false, error: "SMS not configured" };
  }

  const urls = buildGeezCandidateUrls(geez.sendUrl);
  let lastError = "Unknown error";

  const payload = {
    id: geez.id,
    token: geez.token,
    from: geez.sender,
    to: formattedPhone,
    msg: message,
  };

  for (const url of urls) {
    const result = await sendViaGeez(url, payload);

    if (result.success) {
      await log("sent");
      return result;
    }

    lastError = result.error || lastError;
  }

  await log("failed");
  return { success: false, error: lastError };
}

/* =========================
   OTP
========================= */

/** Send an already-generated OTP code by SMS (after persisting it in the database). */
export async function deliverOtpSms(
  phone: string,
  code: string,
  purpose: OtpPurpose = "registration",
): Promise<{ success: boolean; error?: string }> {
  const msg =
    purpose === "password_reset"
      ? `FASIL S.C.: Your password reset code is ${code}. Valid for 5 minutes. Do not share this code.`
      : `FASIL S.C.: Your OTP is ${code}. Valid for 5 minutes.`;

  const res = await sendSms(phone, msg, {
    category: otpPurposeToCategory(purpose),
  });

  return res.success ? { success: true } : { success: false, error: res.error };
}

/** One retry after a short delay — helps transient gateway / network failures without new OTP. */
export async function deliverOtpSmsWithRetry(
  phone: string,
  code: string,
  purpose: OtpPurpose = "registration",
): Promise<{ success: boolean; error?: string }> {
  const first = await deliverOtpSms(phone, code, purpose);
  if (first.success) return first;
  await new Promise((r) => setTimeout(r, 1100));
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

/** Safe message for API responses when SMS delivery failed (no raw gateway text to clients). */
export function userFacingSmsFailureMessage(
  rawError: string | undefined,
): string {
  const e = String(rawError || "").trim();
  if (!e || e === "SMS not configured") {
    return "Text messaging is not configured on the server. Please contact the club office for help resetting your password.";
  }
  if (/wrong endpoint|health check/i.test(e)) {
    return "The SMS service URL is misconfigured. Please contact support.";
  }
  if (/empty response/i.test(e)) {
    return "The SMS provider did not respond. Please try again in a few minutes.";
  }
  if (/timed out|timeout|abort/i.test(e)) {
    return "The SMS service took too long to respond. Please try again in a moment.";
  }
  if (/rejected|code 1/i.test(e)) {
    return "The SMS provider rejected the message. Check your phone number and try again.";
  }
  return "We could not send the SMS. Please wait a minute and try again, or contact the club office.";
}

/* =========================
   HELPERS
========================= */
function formatEthiopianPhone(phone: string): string {
  const local = normalizeEthiopianMobileLocal(phone);
  if (local) return ethiopianLocalToInternational(local);

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "251" + cleaned.slice(1);
  }

  if (!cleaned.startsWith("251")) {
    cleaned = "251" + cleaned;
  }

  return "+" + cleaned;
}

/* =========================
   EXTRA MESSAGES
========================= */
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
  sendSms(
    phone,
    `FASIL S.C.: Your password was updated. If not you, contact support.`,
    { category: "password_changed" },
  );

/** Welcome SMS to the member after paid registration (logged in sms_logs when delivered). */
export function sendMembershipWelcomeSms(
  phone: string,
  fullName: string,
  membershipNumber: string,
): Promise<SendSmsResult> {
  const safeName = String(fullName || "Member")
    .trim()
    .slice(0, 80);
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

  return sendSms(notificationPhone, message, {
    category: "payment_admin",
  });
}

export async function countSmsSent(): Promise<number> {
  const { storage } = await import("./storage");
  const stats = await storage.getSmsSendStats();
  return stats.delivered;
}
