import type { Express } from "express";
import { and, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import crypto from "crypto";
import { db } from "./db";
import { authenticateAdminPermission } from "./middleware/authMiddleware";
import { sendNewsletterEmailBatch } from "./email";
import { newsletterSubscribers, posts } from "@shared/schema";
import { getBlogContentText } from "@shared/blogContent";

const PUBLIC_SITE_URL = "https://fasilkenemasc.et";
const SUBSCRIBERS_PAGE_SIZE = 50;
const MAX_SELECTED_RECIPIENTS = 2000;

let newsletterSchemaReady = false;
let newsletterSchemaPromise: Promise<void> | undefined;

async function ensureNewsletterSchema(): Promise<void> {
  if (newsletterSchemaReady) return;
  if (!newsletterSchemaPromise) {
    newsletterSchemaPromise = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id serial PRIMARY KEY,
          email text NOT NULL,
          status text NOT NULL DEFAULT 'active'
            CHECK (status IN ('active', 'unsubscribed')),
          unsubscribe_token text NOT NULL UNIQUE,
          subscribed_at timestamp NOT NULL DEFAULT now(),
          unsubscribed_at timestamp
        );
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_unique
        ON newsletter_subscribers (lower(email));
      `);
      newsletterSchemaReady = true;
    })().catch((error) => {
      newsletterSchemaPromise = undefined;
      throw error;
    });
  }
  await newsletterSchemaPromise;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function newsletterEmailHtml(
  content: string,
  unsubscribeToken: string,
): string {
  const unsubscribeUrl = `${PUBLIC_SITE_URL}/api/newsletter/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  return `<!doctype html>
    <html lang="en">
      <body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#27272a;line-height:1.6">
        <div style="max-width:620px;margin:28px auto;background:#fff;border-radius:14px;overflow:hidden">
          <div style="background:#c90016;padding:22px 28px;color:#fff">
            <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase">Fasil Kenema S.C.</p>
          </div>
          <main style="padding:28px">${content}</main>
          <footer style="padding:18px 28px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px">
            <p style="margin:0 0 8px">You’re receiving this because you subscribed to Fasil Kenema news.</p>
            <a href="${unsubscribeUrl}" style="color:#a20d12">Unsubscribe from these emails</a>
            <p style="margin:12px 0 0"><a href="${PUBLIC_SITE_URL}" style="color:#71717a">${PUBLIC_SITE_URL}</a></p>
          </footer>
        </div>
      </body>
    </html>`;
}

function statusPage(title: string, message: string, action = ""): string {
  return `<!doctype html>
    <html lang="en">
      <head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
      <body style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Arial,sans-serif;color:#27272a">
        <main style="max-width:520px;margin:8vh auto;padding:32px;background:#fff;border-radius:16px;box-shadow:0 8px 32px #0001">
          <h1 style="margin:0 0 12px;color:#a20d12">${escapeHtml(title)}</h1>
          <p style="line-height:1.6">${escapeHtml(message)}</p>
          ${action}
          <p style="margin-top:28px;font-size:13px"><a href="${PUBLIC_SITE_URL}" style="color:#a20d12">Return to Fasil Kenema S.C.</a></p>
        </main>
      </body>
    </html>`;
}

async function loadActiveSubscribers(ids?: number[]) {
  const where = ids
    ? and(
        eq(newsletterSubscribers.status, "active"),
        inArray(newsletterSubscribers.id, ids),
      )
    : eq(newsletterSubscribers.status, "active");

  return db
    .select({
      id: newsletterSubscribers.id,
      email: newsletterSubscribers.email,
      unsubscribeToken: newsletterSubscribers.unsubscribeToken,
    })
    .from(newsletterSubscribers)
    .where(where)
    .orderBy(desc(newsletterSubscribers.subscribedAt));
}

async function sendCampaign(
  subscribers: {
    email: string;
    unsubscribeToken: string;
  }[],
  subject: string,
  contentForSubscriber: (subscriber: {
    email: string;
    unsubscribeToken: string;
  }) => string,
) {
  return sendNewsletterEmailBatch(
    subscribers.map((subscriber) => ({
      to: subscriber.email,
      subject,
      html: newsletterEmailHtml(
        contentForSubscriber(subscriber),
        subscriber.unsubscribeToken,
      ),
    })),
  );
}

export function registerNewsletterRoutes(app: Express): void {
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      await ensureNewsletterSchema();
      const email = String(req.body?.email ?? "")
        .trim()
        .toLowerCase();
      if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res.status(400).json({ error: "Enter a valid email address." });
      }

      const existing = await db
        .select({ id: newsletterSubscribers.id, status: newsletterSubscribers.status })
        .from(newsletterSubscribers)
        .where(sql`lower(${newsletterSubscribers.email}) = ${email}`)
        .limit(1);

      if (existing[0]?.status === "active") {
        return res.json({ success: true, message: "You are already subscribed." });
      }

      if (existing[0]) {
        await db
          .update(newsletterSubscribers)
          .set({
            status: "active",
            unsubscribeToken: crypto.randomUUID(),
            subscribedAt: new Date(),
            unsubscribedAt: null,
          })
          .where(eq(newsletterSubscribers.id, existing[0].id));
      } else {
        await db.insert(newsletterSubscribers).values({
          email,
          status: "active",
          unsubscribeToken: crypto.randomUUID(),
        });
      }

      return res.status(201).json({
        success: true,
        message: "You’re subscribed to Fasil Kenema news.",
      });
    } catch (error) {
      if ((error as { code?: string })?.code === "23505") {
        return res.json({ success: true, message: "You are already subscribed." });
      }
      console.error("Newsletter signup failed:", error);
      return res.status(500).json({ error: "Could not save your subscription." });
    }
  });

  app.get(
    "/api/admin/newsletter/subscribers",
    authenticateAdminPermission("newsletter"),
    async (req, res) => {
      try {
        await ensureNewsletterSchema();
        const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
        const search = String(req.query.search ?? "").trim().slice(0, 254);
        const requestedStatus = String(req.query.status ?? "all");
        if (!["all", "active", "unsubscribed"].includes(requestedStatus)) {
          return res.status(400).json({ error: "Invalid subscriber status." });
        }

        const filters = [];
        if (requestedStatus !== "all") {
          filters.push(eq(newsletterSubscribers.status, requestedStatus));
        }
        if (search) {
          const searchTerms = search.split(/\s+/).filter(Boolean);
          for (const term of searchTerms) {
            const escapedTerm = term.replace(/[\\%_]/g, "\\$&");
            filters.push(
              ilike(newsletterSubscribers.email, `%${escapedTerm}%`),
            );
          }
        }
        const where = filters.length ? and(...filters) : undefined;

        const [subscribers, filteredCount, activeCount, unsubscribedCount] =
          await Promise.all([
            db
              .select({
                id: newsletterSubscribers.id,
                email: newsletterSubscribers.email,
                status: newsletterSubscribers.status,
                subscribedAt: newsletterSubscribers.subscribedAt,
                unsubscribedAt: newsletterSubscribers.unsubscribedAt,
              })
              .from(newsletterSubscribers)
              .where(where)
              .orderBy(desc(newsletterSubscribers.subscribedAt))
              .limit(SUBSCRIBERS_PAGE_SIZE)
              .offset((page - 1) * SUBSCRIBERS_PAGE_SIZE),
            db
              .select({ value: count() })
              .from(newsletterSubscribers)
              .where(where),
            db
              .select({ value: count() })
              .from(newsletterSubscribers)
              .where(eq(newsletterSubscribers.status, "active")),
            db
              .select({ value: count() })
              .from(newsletterSubscribers)
              .where(eq(newsletterSubscribers.status, "unsubscribed")),
          ]);

        res.json({
          subscribers,
          page,
          pageSize: SUBSCRIBERS_PAGE_SIZE,
          total: Number(filteredCount[0]?.value ?? 0),
          activeCount: Number(activeCount[0]?.value ?? 0),
          unsubscribedCount: Number(unsubscribedCount[0]?.value ?? 0),
        });
      } catch (error) {
        console.error("Failed to list newsletter subscribers:", error);
        res.status(500).json({ error: "Could not load newsletter subscribers." });
      }
    },
  );

  app.post(
    "/api/admin/newsletter/unsubscribe",
    authenticateAdminPermission("newsletter"),
    async (req, res) => {
      try {
        await ensureNewsletterSchema();
        const rawIds = req.body?.subscriberIds;
        const ids = Array.isArray(rawIds)
          ? Array.from(
              new Set(
                rawIds
                  .map(Number)
                  .filter((id) => Number.isInteger(id) && id > 0),
              ),
            )
          : [];
        if (ids.length === 0 || ids.length > MAX_SELECTED_RECIPIENTS) {
          return res.status(400).json({
            error: `Select between 1 and ${MAX_SELECTED_RECIPIENTS} subscribers.`,
          });
        }

        const updated = await db
          .update(newsletterSubscribers)
          .set({ status: "unsubscribed", unsubscribedAt: new Date() })
          .where(
            and(
              inArray(newsletterSubscribers.id, ids),
              eq(newsletterSubscribers.status, "active"),
            ),
          )
          .returning({ id: newsletterSubscribers.id });
        res.json({ updated: updated.length });
      } catch (error) {
        console.error("Failed to unsubscribe selected subscribers:", error);
        res.status(500).json({ error: "Could not update subscriber status." });
      }
    },
  );

  app.post(
    "/api/admin/newsletter/send",
    authenticateAdminPermission("newsletter"),
    async (req, res) => {
      try {
        await ensureNewsletterSchema();
        const rawIds = req.body?.subscriberIds;
        const ids = Array.isArray(rawIds)
          ? Array.from(
              new Set(
                rawIds
                  .map(Number)
                  .filter((id) => Number.isInteger(id) && id > 0),
              ),
            )
          : [];
        const subject = String(req.body?.subject ?? "").trim();
        const body = String(req.body?.body ?? "").trim();
        if (ids.length === 0 || ids.length > MAX_SELECTED_RECIPIENTS) {
          return res.status(400).json({
            error: `Select between 1 and ${MAX_SELECTED_RECIPIENTS} active subscribers.`,
          });
        }
        if (!subject || subject.length > 180) {
          return res.status(400).json({
            error: "Subject is required and must be 180 characters or fewer.",
          });
        }
        if (!body || body.length > 10000) {
          return res.status(400).json({
            error: "Message is required and must be 10,000 characters or fewer.",
          });
        }

        const subscribers = await loadActiveSubscribers(ids);
        if (subscribers.length === 0) {
          return res.status(400).json({
            error: "None of the selected subscribers are currently active.",
          });
        }
        const content = escapeHtml(body).replace(/\r?\n/g, "<br>");
        const result = await sendCampaign(
          subscribers,
          subject,
          () => `<div style="font-size:16px;line-height:1.8">${content}</div>`,
        );
        res.json({
          ...result,
          selected: ids.length,
          skipped: Math.max(0, ids.length - subscribers.length),
        });
      } catch (error) {
        console.error("Newsletter message send failed:", error);
        res.status(500).json({ error: "Could not send the newsletter message." });
      }
    },
  );

  app.post(
    "/api/admin/newsletter/send-post",
    authenticateAdminPermission("newsletter"),
    async (req, res) => {
      try {
        await ensureNewsletterSchema();
        const postId = Number(req.body?.postId);
        if (!Number.isInteger(postId) || postId < 1) {
          return res.status(400).json({ error: "A valid post is required." });
        }
        const [post] = await db
          .select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);
        if (!post) return res.status(404).json({ error: "Post not found." });
        if (post.status !== "published") {
          return res.status(400).json({
            error: "Only published posts can be emailed to subscribers.",
          });
        }

        const subscribers = await loadActiveSubscribers();
        if (subscribers.length === 0) {
          return res.json({ sent: 0, failed: 0, selected: 0, skipped: 0 });
        }

        const title = escapeHtml(post.titleEn);
        const excerpt = escapeHtml(
          getBlogContentText(post.contentEn)
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 500),
        );
        const blogUrl = `${PUBLIC_SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
        const subject = `New from Fasil Kenema: ${post.titleEn}`.slice(0, 180);
        const result = await sendCampaign(
          subscribers,
          subject,
          () => `
            <p style="margin:0 0 8px;color:#a20d12;font-size:13px;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(post.category)}</p>
            <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25">${title}</h1>
            <p style="margin:0 0 24px">${excerpt}</p>
            <a href="${blogUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#c90016;color:#fff;text-decoration:none;font-weight:bold">Read the story</a>
          `,
        );
        res.json({ ...result, selected: subscribers.length, skipped: 0 });
      } catch (error) {
        console.error("Post newsletter send failed:", error);
        res.status(500).json({ error: "Could not email this post to subscribers." });
      }
    },
  );

  app.get("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      await ensureNewsletterSchema();
      const token = String(req.params.token ?? "");
      const [subscriber] = await db
        .select({ status: newsletterSubscribers.status })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.unsubscribeToken, token))
        .limit(1);

      res.setHeader("Cache-Control", "no-store");
      if (!subscriber) {
        return res
          .status(404)
          .type("html")
          .send(statusPage("Link not found", "This unsubscribe link is invalid."));
      }
      if (subscriber.status === "unsubscribed") {
        return res
          .type("html")
          .send(statusPage("Already unsubscribed", "This address is already off the newsletter list."));
      }

      const action = `<form method="post" action="/api/newsletter/unsubscribe/${encodeURIComponent(token)}"><button type="submit" style="border:0;border-radius:8px;background:#c90016;color:#fff;padding:12px 18px;font-size:15px;font-weight:bold;cursor:pointer">Confirm unsubscribe</button></form>`;
      return res
        .type("html")
        .send(
          statusPage(
            "Unsubscribe from Fasil Kenema news",
            "Click below to stop receiving newsletter emails. This link only changes your email subscription.",
            action,
          ),
        );
    } catch (error) {
      console.error("Could not show unsubscribe page:", error);
      return res.status(500).type("html").send(
        statusPage("Something went wrong", "Please try again later."),
      );
    }
  });

  app.post("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      await ensureNewsletterSchema();
      const token = String(req.params.token ?? "");
      const updated = await db
        .update(newsletterSubscribers)
        .set({ status: "unsubscribed", unsubscribedAt: new Date() })
        .where(
          and(
            eq(newsletterSubscribers.unsubscribeToken, token),
            eq(newsletterSubscribers.status, "active"),
          ),
        )
        .returning({ id: newsletterSubscribers.id });
      if (updated.length > 0) {
        return res
          .type("html")
          .send(statusPage("You’re unsubscribed", "You will no longer receive newsletter emails."));
      }

      const [existing] = await db
        .select({ id: newsletterSubscribers.id, status: newsletterSubscribers.status })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.unsubscribeToken, token))
        .limit(1);
      if (existing?.status === "unsubscribed") {
        return res
          .type("html")
          .send(statusPage("Already unsubscribed", "This address is already off the newsletter list."));
      }
      return res
        .status(404)
        .type("html")
        .send(statusPage("Link not found", "This unsubscribe link is invalid."));
    } catch (error) {
      console.error("Could not process unsubscribe request:", error);
      return res
        .status(500)
        .type("html")
        .send(statusPage("Something went wrong", "Please try again later."));
    }
  });
}
