export const ADMIN_ROLES = [
  "super_admin",
  "operations_manager",
  "content_editor",
  "read_only",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  operations_manager: "Operations Manager",
  content_editor: "Content Editor",
  read_only: "Read-only",
};

export const ADMIN_PERMISSIONS = [
  "dashboard",
  "members",
  "payments",
  "content",
  "careers",
  "social_links",
  "league",
  "newsletter",
  "sms",
  "reviews",
  "messages",
  "team",
  "settings",
  "user_management",
  "audit_logs",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const OPERATIONS_PERMISSIONS: AdminPermission[] = [
  "dashboard",
  "members",
  "payments",
  "league",
  "newsletter",
  "sms",
  "reviews",
  "messages",
  "team",
];

const CONTENT_PERMISSIONS: AdminPermission[] = [
  "dashboard",
  "content",
  "careers",
  "social_links",
];

const READ_ONLY_PERMISSIONS: AdminPermission[] = ADMIN_PERMISSIONS.filter(
  (permission) =>
    permission !== "settings" &&
    permission !== "user_management" &&
    permission !== "audit_logs",
);

export function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && ADMIN_ROLES.includes(role as AdminRole);
}

export function canAccessAdminPermission(
  role: unknown,
  permission: AdminPermission,
  isWrite = false,
): boolean {
  if (!isAdminRole(role)) return false;
  if (role === "super_admin") return true;
  if (isWrite && role === "read_only") return false;

  if (role === "operations_manager") {
    return OPERATIONS_PERMISSIONS.includes(permission);
  }
  if (role === "content_editor") {
    return CONTENT_PERMISSIONS.includes(permission);
  }
  return READ_ONLY_PERMISSIONS.includes(permission);
}

export function getAdminPagePermission(path: string): AdminPermission | null {
  const pagePermissions: Record<string, AdminPermission> = {
    "/admin/dashboard": "dashboard",
    "/admin/members": "members",
    "/admin/payments": "payments",
    "/admin/content": "content",
    "/admin/careers": "careers",
    "/admin/social-links": "social_links",
    "/admin/league-table": "league",
    "/admin/newsletter": "newsletter",
    "/admin/sms": "sms",
    "/admin/watchreview": "reviews",
    "/admin/usermessage": "messages",
    "/admin/team": "team",
    "/admin/settings": "settings",
    "/admin/users": "user_management",
    "/admin/audit-logs": "audit_logs",
  };
  return pagePermissions[path] ?? null;
}
