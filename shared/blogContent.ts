const BLOG_SECTIONS_PREFIX = "FASIL_BLOG_SECTIONS_V1\n";

export type BlogContentSection = {
  heading: string;
  text: string;
  images: string[];
};

function legacySection(content: string): BlogContentSection[] {
  return content ? [{ heading: "", text: content, images: [] }] : [];
}

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url || url.length > 2048) return null;

  if (url.startsWith("/uploads/") && !url.includes("..")) return url;
  try {
    const parsed = new URL(url);
    if (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      !parsed.username &&
      !parsed.password
    ) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

export function parseBlogContentSections(content: unknown): BlogContentSection[] {
  const value = typeof content === "string" ? content : "";
  if (!value.startsWith(BLOG_SECTIONS_PREFIX)) return legacySection(value);

  try {
    const parsed = JSON.parse(value.slice(BLOG_SECTIONS_PREFIX.length));
    if (!Array.isArray(parsed?.sections)) return legacySection(value);
    return parsed.sections
      .filter((section: unknown) => section && typeof section === "object")
      .map((section: Record<string, unknown>) => ({
        heading: typeof section.heading === "string" ? section.heading : "",
        text: typeof section.text === "string" ? section.text : "",
        images: Array.isArray(section.images)
          ? section.images
              .map(normalizeImageUrl)
              .filter((image): image is string => Boolean(image))
          : [],
      }));
  } catch {
    return legacySection(value);
  }
}

export function serializeBlogContentSections(
  sections: BlogContentSection[],
): string {
  const normalized = sections
    .map((section) => ({
      heading: section.heading.trim(),
      text: section.text,
      images: section.images
        .map(normalizeImageUrl)
        .filter((image): image is string => Boolean(image)),
    }))
    .filter(
      (section) =>
        section.heading.length > 0 ||
        section.text.trim().length > 0 ||
        section.images.length > 0,
    );

  return `${BLOG_SECTIONS_PREFIX}${JSON.stringify({ sections: normalized })}`;
}

export function getBlogContentText(content: unknown): string {
  return parseBlogContentSections(content)
    .map((section) => [section.heading.trim(), section.text.trim()]
      .filter(Boolean)
      .join("\n"))
    .filter(Boolean)
    .join("\n\n");
}
