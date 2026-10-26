export type ManagedPageSection = {
  heading: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
};

export type ManagedPageDraft = {
  intro: string;
  sections: ManagedPageSection[];
};

const MANAGED_PAGE_PREFIX = "FASIL_MANAGED_PAGE_SECTIONS_V1\n";

export function serializeManagedPageContent(draft: ManagedPageDraft): string {
  return `${MANAGED_PAGE_PREFIX}${JSON.stringify({
    intro: draft.intro,
    sections: draft.sections.map(({ heading, text, imageUrl, imageAlt }) => ({
      heading,
      text,
      imageUrl,
      imageAlt,
    })),
  })}`;
}

export function parseManagedPageContent(
  content: unknown,
  fallback: ManagedPageDraft,
): ManagedPageDraft {
  const raw = typeof content === "string" ? content : "";
  if (!raw.startsWith(MANAGED_PAGE_PREFIX)) {
    return {
      intro: fallback.intro,
      sections: fallback.sections.map((section) => ({ ...section })),
    };
  }

  try {
    const parsed = JSON.parse(raw.slice(MANAGED_PAGE_PREFIX.length));
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sections)) {
      throw new Error("Invalid managed page content");
    }
    return {
      intro: typeof parsed.intro === "string" ? parsed.intro : "",
      sections: parsed.sections
        .filter((section: unknown) => section && typeof section === "object")
        .map((section: Record<string, unknown>) => ({
          heading: typeof section.heading === "string" ? section.heading : "",
          text: typeof section.text === "string" ? section.text : "",
          imageUrl: typeof section.imageUrl === "string" ? section.imageUrl : "",
          imageAlt: typeof section.imageAlt === "string" ? section.imageAlt : "",
        })),
    };
  } catch {
    return {
      intro: fallback.intro,
      sections: fallback.sections.map((section) => ({ ...section })),
    };
  }
}
