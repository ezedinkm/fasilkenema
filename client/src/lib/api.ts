export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("admin_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  return response;
}

export async function getMembers() {
  const response = await fetchWithAuth("/api/members");
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Failed to load members",
    );
  }
  if (!Array.isArray(data)) {
    throw new Error("The members response was invalid. Please try again.");
  }
  return data;
}

/** Public endpoint (no auth). Prefer `createAdminMember` from the admin UI. */
export async function createMember(data: any) {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

/** Admin: create member without Chapa payment (validated tier + phone). */
export async function createAdminMember(data: Record<string, unknown>) {
  const response = await fetchWithAuth("/api/admin/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof json.error === "string" ? json.error : "Failed to create member",
    );
  }
  return json;
}

/** Admin: membership tiers from database (same ids used on public signup). */
export async function getAdminMembershipTiers() {
  const response = await fetchWithAuth("/api/admin/membership-tiers");
  return response.json();
}

export async function updateMember(id: number, data: any) {
  const response = await fetchWithAuth(`/api/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof json.error === "string" ? json.error : "Failed to update member",
    );
  }
  return json;
}

export async function deleteMember(id: number) {
  const response = await fetchWithAuth(`/api/members/${id}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function getPayments() {
  const response = await fetchWithAuth("/api/payments");
  return response.json();
}

export async function getDonations() {
  const response = await fetchWithAuth("/api/donations");
  return response.json();
}

export async function createDonation(data: any) {
  const response = await fetch("/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function initializeDonationPayment(data: any) {
  const response = await fetch("/api/donations/initialize-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getPosts() {
  const response = await fetch("/api/posts");
  return response.json();
}

export async function createPost(data: any) {
  const response = await fetchWithAuth("/api/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updatePost(id: number, data: any) {
  const response = await fetchWithAuth(`/api/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deletePost(id: number) {
  const response = await fetchWithAuth(`/api/posts/${id}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function getSmsTemplates() {
  const response = await fetchWithAuth("/api/sms-templates");
  return response.json();
}

export async function createSmsTemplate(data: any) {
  const response = await fetchWithAuth("/api/sms-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSmsTemplate(id: number, data: any) {
  const response = await fetchWithAuth(`/api/sms-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSmsTemplate(id: number) {
  const response = await fetchWithAuth(`/api/sms-templates/${id}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function getSmsLogs() {
  const response = await fetchWithAuth("/api/sms-logs");
  return response.json();
}

export async function getSettings() {
  const response = await fetchWithAuth("/api/settings");
  return response.json();
}

export async function getSettingByKey(key: string) {
  const response = await fetch(`/api/settings/${key}`);
  if (!response.ok) return null;
  return response.json();
}

export async function getMembershipTiers() {
  const response = await fetch("/api/membership-tiers");
  if (!response.ok) return null;
  return response.json();
}

export async function saveSetting(data: any) {
  const response = await fetchWithAuth("/api/settings", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getRevenueStats() {
  const response = await fetchWithAuth("/api/stats/revenue");
  return response.json();
}

export async function getAdminDashboardStats() {
  const response = await fetchWithAuth("/api/admin/dashboard");
  return response.json();
}

export async function getAdminServerMonitor() {
  const response = await fetchWithAuth("/api/admin/server-monitor");
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof json.error === "string"
        ? json.error
        : "Failed to fetch server monitor metrics",
    );
  }
  return json;
}

export type VisitorAnalyticsRange = "24h" | "7d" | "30d" | "90d";

export type VisitorAnalyticsResponse = {
  range: VisitorAnalyticsRange;
  updatedAt: string;
  activeVisitors: number;
  visitors: number;
  pageviews: number;
  bounceRate: number;
  averageSessionSeconds: number;
  trend: Array<{ bucket: string; pageviews: number; visitors: number }>;
  topPages: Array<{ path: string; pageviews: number; visitors: number }>;
  sources: Array<{ source: string; visits: number; pageviews: number }>;
  devices: Array<{ device: string; visitors: number }>;
  activePages: Array<{ path: string; visitors: number }>;
};

export async function getAdminVisitorAnalytics(
  range: VisitorAnalyticsRange,
): Promise<VisitorAnalyticsResponse> {
  const response = await fetchWithAuth(
    `/api/admin/analytics?range=${encodeURIComponent(range)}`,
  );
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof json.error === "string"
        ? json.error
        : "Failed to load visitor analytics",
    );
  }
  return json as VisitorAnalyticsResponse;
}

export async function getAdminPayments() {
  const response = await fetchWithAuth("/api/admin/payments");
  const json = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(
      typeof json.error === "string" ? json.error : "Failed to load payments",
    );
  }
  return json;
}

export async function getAdminSmsAudiences() {
  const response = await fetchWithAuth("/api/admin/sms/audiences");
  return response.json();
}

export async function getAdminSmsBroadcasts() {
  const response = await fetchWithAuth("/api/admin/sms/broadcasts");
  return response.json();
}

/** Delivered count from `sms_logs` (status = sent): OTP, broadcasts, payment alerts, member welcome, etc. */
export type AdminSmsSendStats = {
  delivered: number;
};

export async function getAdminSmsStats(): Promise<AdminSmsSendStats | null> {
  const response = await fetchWithAuth("/api/admin/sms/stats");
  if (!response.ok) return null;
  return response.json();
}

export type AdminSmsBalance = {
  success: boolean;
  balance?: number;
  currency?: string;
  checkedAt?: string;
  message: string;
};

export async function getAdminSmsBalance(): Promise<AdminSmsBalance> {
  const response = await fetchWithAuth("/api/admin/sms/balance");
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof json.message === "string"
        ? json.message
        : "Could not load the IconicSMS balance",
    );
  }
  return json as AdminSmsBalance;
}

export async function queueAdminSmsBroadcast(data: {
  targetType: "all" | "tier" | "expired";
  targetValue?: string;
  message: string;
}) {
  const response = await fetchWithAuth("/api/admin/sms/broadcasts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}
