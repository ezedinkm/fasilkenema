import { Resend } from "resend";
import { storage } from "./storage";
import { getSavedResendApiKey } from "./resendCredentials";

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ResendEmailConfig {
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

const RESEND_CONFIG_KEY = "email.resend.config";
const DEFAULT_RESEND_EMAIL_CONFIG: ResendEmailConfig = {
  fromName: "Fasil Kenema S.C.",
  fromEmail: "noreply@mechalfc.com",
  replyTo: "",
};

function parseResendConfig(value: unknown): Partial<ResendEmailConfig> {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const config = value as Record<string, unknown>;
  return {
    fromName: typeof config.fromName === "string" ? config.fromName : undefined,
    fromEmail:
      typeof config.fromEmail === "string" ? config.fromEmail : undefined,
    replyTo: typeof config.replyTo === "string" ? config.replyTo : undefined,
  };
}

export async function getResendEmailConfig(): Promise<ResendEmailConfig> {
  const setting = await storage.getSettingByKey(RESEND_CONFIG_KEY);
  const saved = parseResendConfig(setting?.value);
  return {
    fromName: saved.fromName?.trim() || DEFAULT_RESEND_EMAIL_CONFIG.fromName,
    fromEmail:
      saved.fromEmail?.trim() || DEFAULT_RESEND_EMAIL_CONFIG.fromEmail,
    replyTo: saved.replyTo?.trim() || "",
  };
}

function formatFromAddress(config: ResendEmailConfig): string {
  const name = config.fromName.replace(/[\r\n<>]/g, "").trim();
  return name ? `${name} <${config.fromEmail}>` : config.fromEmail;
}

async function getResend(): Promise<Resend> {
  const savedApiKey = await getSavedResendApiKey();
  const apiKey = savedApiKey?.trim() || process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Resend API key is not configured");
  }
  return new Resend(apiKey);
}

async function resendRequest(
  path: string,
  body: unknown,
): Promise<Record<string, any>> {
  const resend = await getResend();

  if (path === "/emails") {
    const payload = body as {
      from: string;
      to: string[];
      subject: string;
      html: string;
      reply_to?: string;
    };
    const { data, error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.reply_to ? { replyTo: payload.reply_to } : {}),
    });
    if (error) {
      throw new Error(error.message);
    }
    return data && typeof data === "object" ? data : {};
  }

  if (path === "/emails/batch") {
    const messages = body as Array<{
      from: string;
      to: string;
      subject: string;
      html: string;
      reply_to?: string;
    }>;
    const { data, error } = await resend.batch.send(
      messages.map((message) => ({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        ...(message.reply_to ? { replyTo: message.reply_to } : {}),
      })),
    );
    if (error) {
      throw new Error(error.message);
    }
    const rows = Array.isArray(data)
      ? data
      : data &&
          typeof data === "object" &&
          Array.isArray((data as { data?: unknown }).data)
        ? (data as { data: unknown[] }).data
        : [];
    return { data: rows };
  }

  throw new Error(`Unsupported Resend path: ${path}`);
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
): Promise<SendEmailResult> {
  try {
    const toAddresses = Array.isArray(to) ? to : [to];
    const config = await getResendEmailConfig();

    console.log("Sending email via Resend:", { to: toAddresses, subject });

    const result = await resendRequest("/emails", {
      from: formatFromAddress(config),
      to: toAddresses,
      subject,
      html: htmlContent,
      ...(config.replyTo ? { reply_to: config.replyTo } : {}),
    });

    console.log("Email sent successfully:", result?.id);
    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export interface NewsletterEmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface NewsletterBatchResult {
  sent: number;
  failed: number;
  errors: string[];
}

export async function sendNewsletterEmailBatch(
  messages: NewsletterEmailMessage[],
): Promise<NewsletterBatchResult> {
  if (messages.length === 0) {
    return { sent: 0, failed: 0, errors: [] };
  }

  let config: ResendEmailConfig;
  try {
    config = await getResendEmailConfig();
  } catch (error) {
    return {
      sent: 0,
      failed: messages.length,
      errors: [
        error instanceof Error ? error.message : "Resend is not available",
      ],
    };
  }

  const result: NewsletterBatchResult = { sent: 0, failed: 0, errors: [] };
  for (let offset = 0; offset < messages.length; offset += 100) {
    const chunk = messages.slice(offset, offset + 100);
    try {
      const response = await resendRequest(
        "/emails/batch",
        chunk.map((message) => ({
          from: formatFromAddress(config),
          to: message.to,
          subject: message.subject,
          html: message.html,
          ...(config.replyTo ? { reply_to: config.replyTo } : {}),
        })),
      );
      const sentCount = Array.isArray(response.data) ? response.data.length : 0;
      result.sent += sentCount;
      result.failed += Math.max(0, chunk.length - sentCount);
      if (sentCount === 0) {
        result.errors.push("Resend returned no results for the email batch.");
      }
    } catch (error) {
      result.failed += chunk.length;
      result.errors.push(
        error instanceof Error ? error.message : "Newsletter batch failed",
      );
    }
  }

  return result;
}

export async function sendResendTestEmail(toEmail: string): Promise<SendEmailResult> {
  return sendEmail(
    toEmail,
    "Resend email configuration test",
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2>Resend is working</h2>
      <p>This test confirms that the Fasil Kenema S.C. website can send email using its current Resend configuration.</p>
    </div>`,
  );
}

export async function sendPaymentNotificationEmail(
  emails: string[],
  type: "membership" | "donation",
  amount: number,
  currency: string,
  totalETB: number,
  totalUSD: number,
): Promise<SendEmailResult> {
  const typeLabel = type === "membership" ? "Membership" : "Donation";

  const subject = `New ${typeLabel} Payment - Mechal FC Fan Club`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #228B22 0%, #1a6b1a 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .amount { font-size: 32px; font-weight: bold; color: #228B22; }
        .total-section { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mechal FC Fan Club</h1>
          <p>Sport Club</p>
        </div>
        <div class="content">
          <h2>New ${typeLabel} Payment Received!</h2>
          <p>A new payment has been successfully processed:</p>
          <p class="amount">${amount} ${currency}</p>
          <p><strong>Payment Type:</strong> ${typeLabel}</p>
          
          <div class="total-section">
            <h3>Current Revenue Totals</h3>
            <p><strong>Total ETB:</strong> ${totalETB.toLocaleString()} ETB</p>
            <p><strong>Total USD:</strong> ${totalUSD.toLocaleString()} USD</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from the Mechal FC Fan Club platform.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (emails.length === 0) {
    return { success: false, error: "No email addresses configured" };
  }

  return sendEmail(emails, subject, htmlContent);
}

export async function sendPasswordResetEmail(
  toEmail: string,
  memberName: string,
  resetLink: string,
): Promise<SendEmailResult> {
  const subject = "Password Reset - Mechal FC Fan Club";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #228B22, #DC143C); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Mechal FC Fan Club</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Password Reset Request</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333;">Hello <strong>${memberName}</strong>,</p>
        <p style="color: #555;">We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #228B22; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 13px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        <p style="color: #888; font-size: 13px;">Or copy and paste this link: <br/><a href="${resetLink}" style="color: #228B22; word-break: break-all;">${resetLink}</a></p>
      </div>
      <div style="text-align: center; padding: 15px; color: #999; font-size: 12px;">
        <p>Mechal Sport Club Fan Club</p>
      </div>
    </div>
  `;

  return sendEmail(toEmail, subject, htmlContent);
}

export async function sendAdminPasswordResetEmail(
  toEmail: string,
  adminName: string,
  resetLink: string,
): Promise<SendEmailResult> {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const safeName = escapeHtml(adminName || "Super Admin");
  const safeLink = escapeHtml(resetLink);
  const subject = "Super Admin password reset - Fasil FC";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #b91c1c; font-size: 22px;">Fasil FC Admin Password Reset</h1>
      <p>Hello <strong>${safeName}</strong>,</p>
      <p>We received a request to reset your Super Admin password. Use the link below within 30 minutes:</p>
      <p style="margin: 28px 0;">
        <a href="${safeLink}" style="background: #b91c1c; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset password</a>
      </p>
      <p>If you did not request this, you can ignore this email. The link can only be used once.</p>
      <p style="color: #666; font-size: 12px;">If the button does not work, copy this link into your browser:<br/><a href="${safeLink}" style="word-break: break-all;">${safeLink}</a></p>
    </div>
  `;

  return sendEmail(toEmail, subject, htmlContent);
}
