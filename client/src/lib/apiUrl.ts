/**
 * Prefix for `/api/...` requests. Default is same-origin (Express serving the built SPA).
 * If the client is hosted separately, set `VITE_API_BASE_URL` (no trailing slash), e.g.
 * `https://your-api.example.com`.
 */
export function apiUrl(path: string): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const base = typeof raw === "string" ? raw.replace(/\/+$/, "") : "";
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}
