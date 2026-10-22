const combiningMarksPattern = (() => {
  try {
    return new RegExp("\\p{M}", "gu");
  } catch {
    return /[\u0300-\u036f]/g;
  }
})();

const nonSearchCharactersPattern = (() => {
  try {
    return new RegExp("[^\\p{L}\\p{N}]+", "gu");
  } catch {
    return /[^a-z0-9\u1200-\u137f\u1380-\u139f\u2d80-\u2ddf]+/gi;
  }
})();

export function normalizeSearchText(value: unknown): string {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    return "";
  }

  return String(value)
    .normalize("NFD")
    .replace(combiningMarksPattern, "")
    .toLowerCase()
    .replace(nonSearchCharactersPattern, " ")
    .trim();
}

/**
 * Matches all query words, in any order, across the provided fields.
 * Null, undefined, punctuation, case, and diacritics do not break a match.
 */
export function matchesSearch(query: unknown, values: unknown[]): boolean {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchableText = normalizeSearchText(values.map((value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  }).join(" "));

  return terms.every((term) => searchableText.includes(term));
}
