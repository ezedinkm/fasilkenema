const SESSION_STORAGE_KEY = "fasil.analytics.session";
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

type AnalyticsSession = {
  id: string;
  lastActivity: number;
};

type SessionIdentity = {
  id: string;
  isNew: boolean;
};

let lastTrackedPath = "";
let lastTrackedAt = 0;

function getSessionId(): SessionIdentity | null {
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AnalyticsSession;
      if (
        typeof parsed.id === "string" &&
        typeof parsed.lastActivity === "number" &&
        now - parsed.lastActivity < SESSION_IDLE_TIMEOUT_MS
      ) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ id: parsed.id, lastActivity: now }),
        );
        return { id: parsed.id, isNew: false };
      }
    }

    const id = window.crypto.randomUUID();
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ id, lastActivity: now }),
    );
    return { id, isNew: true };
  } catch {
    return null;
  }
}

function getDeviceCategory(): "mobile" | "tablet" | "desktop" | "unknown" {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(userAgent)) return "tablet";
  if (/mobi|iphone|ipod|android/.test(userAgent)) return "mobile";
  if (userAgent) return "desktop";
  return "unknown";
}

function getExternalReferrerHost(): string | null {
  if (!document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    return referrer.hostname === window.location.hostname
      ? null
      : referrer.hostname;
  } catch {
    return null;
  }
}

function getTrackingPayload() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const pagePath = window.location.pathname;
  if (
    pagePath === "/admin" ||
    pagePath.startsWith("/admin/") ||
    pagePath === "/member" ||
    pagePath.startsWith("/member/")
  ) {
    return null;
  }
  try {
    if (localStorage.getItem("admin_token")) return null;
  } catch {
    return null;
  }

  const session = getSessionId();
  if (!session) return null;

  return {
    sessionId: session.id,
    pagePath,
    deviceCategory: getDeviceCategory(),
    isNewSession: session.isNew,
  };
}

export function trackVisitorPageView() {
  const payload = getTrackingPayload();
  if (!payload) return;

  const now = Date.now();
  if (lastTrackedPath === payload.pagePath && now - lastTrackedAt < 1_000) return;
  lastTrackedPath = payload.pagePath;
  lastTrackedAt = now;

  void fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId: payload.sessionId,
      pagePath: payload.pagePath,
      deviceCategory: payload.deviceCategory,
      referrerHost: getExternalReferrerHost(),
    }),
  }).catch(() => {
    // Analytics must not interrupt public page navigation.
  });
}

export function trackVisitorHeartbeat() {
  if (document.visibilityState === "hidden" || !document.hasFocus()) return;
  const payload = getTrackingPayload();
  if (!payload) return;

  const endpoint = payload.isNewSession
    ? "/api/analytics/pageview"
    : "/api/analytics/heartbeat";
  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId: payload.sessionId,
      pagePath: payload.pagePath,
      deviceCategory: payload.deviceCategory,
      ...(payload.isNewSession
        ? { referrerHost: getExternalReferrerHost() }
        : {}),
    }),
  }).catch(() => {
    // Analytics must not interrupt public page navigation.
  });
}
