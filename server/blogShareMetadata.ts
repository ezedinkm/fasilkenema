import type { Request } from "express";
import { getBlogContentText } from "@shared/blogContent";
import type { Post } from "@shared/schema";
import { storage } from "./storage";

const SOCIAL_METADATA_MARKER = "<!-- BLOG_SOCIAL_METADATA -->";
const DEFAULT_TITLE = "Fasil Kenema S.C.";
const DEFAULT_DESCRIPTION =
  "Official home of Fasil Kenema Sport Club, Ethiopian football.";

export type BlogSharePost = Pick<
  Post,
  "slug" | "titleEn" | "contentEn" | "shareImageUrl" | "imageUrl"
>;

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getRequestOrigin(req: Request): string {
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.get("host")?.trim();
  if (!host) return "";

  const forwardedProtocol = req
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : req.protocol;

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return "";
  }
}

function absoluteHttpUrl(value: string, origin: string, fallback: string): string {
  try {
    const url = new URL(value, origin || "https://fasilkenema.invalid");
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    ) {
      return url.toString();
    }
  } catch {
    // Use the known page fallback for malformed or unsupported image URLs.
  }
  return fallback;
}

function compactDescription(content: string): string {
  const text = getBlogContentText(content).replace(/\s+/g, " ").trim();
  if (!text) return DEFAULT_DESCRIPTION;
  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text;
}

export function renderBlogShareMetadata(
  post: BlogSharePost | null,
  origin: string,
): string {
  const isArticle = Boolean(post);
  const title = isArticle ? post!.titleEn : DEFAULT_TITLE;
  const description = isArticle
    ? compactDescription(post!.contentEn)
    : DEFAULT_DESCRIPTION;
  const pageUrl = isArticle
    ? absoluteHttpUrl(`/blog/${encodeURIComponent(post!.slug)}`, origin, "")
    : absoluteHttpUrl("/", origin, "");
  const imagePath = isArticle
    ? post!.shareImageUrl || post!.imageUrl || "/fasillogo.png"
    : "/fasillogo.png";
  const imageUrl = absoluteHttpUrl(imagePath, origin, "");
  const safeTitle = escapeHtmlAttribute(title);
  const safeDescription = escapeHtmlAttribute(description);
  const safePageUrl = escapeHtmlAttribute(pageUrl);
  const safeImageUrl = escapeHtmlAttribute(imageUrl);
  const type = isArticle ? "article" : "website";

  return [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}">`,
    `<link rel="canonical" href="${safePageUrl}">`,
    `<meta property="og:site_name" content="Fasil Kenema S.C.">`,
    `<meta property="og:title" content="${safeTitle}">`,
    `<meta property="og:description" content="${safeDescription}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:url" content="${safePageUrl}">`,
    `<meta property="og:image" content="${safeImageUrl}">`,
    `<meta property="og:image:alt" content="${safeTitle}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${safeTitle}">`,
    `<meta name="twitter:description" content="${safeDescription}">`,
    `<meta name="twitter:image" content="${safeImageUrl}">`,
  ].join("\n    ");
}

export async function injectBlogShareMetadata(
  html: string,
  req: Request,
): Promise<string> {
  const origin = getRequestOrigin(req);
  let post: Post | null = null;

  try {
    const requestUrl = new URL(req.originalUrl, origin || "http://localhost");
    const match = requestUrl.pathname.match(/^\/blog\/([^/]+)\/?$/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      const found = await storage.getPostBySlug(slug);
      if (found?.status === "published") post = found;
    }
  } catch {
    // An unavailable post should keep the normal site metadata and page shell.
  }

  return html.replace(
    SOCIAL_METADATA_MARKER,
    renderBlogShareMetadata(post, origin),
  );
}
