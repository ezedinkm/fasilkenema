import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { adminUsers } from "@shared/schema";
import {
  canAccessAdminPermission,
  isAdminRole,
  type AdminPermission,
  type AdminRole,
} from "@shared/adminAccess";
import { db } from "../db";
import { recordAdminAuditEvent } from "../adminAudit";

export const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

type AdminClaims = {
  id: number;
  email: string;
  role: AdminRole;
  sessionVersion: number;
};

async function findAuthenticatedAdmin(
  req: Request,
  res: Response,
): Promise<AdminClaims | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return null;
  }

  let claims: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded === "string") {
      res.status(403).json({ error: "Invalid or expired token" });
      return null;
    }
    claims = decoded;
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
    return null;
  }

  const id = Number(claims.id);
  if (
    claims.type === "member" ||
    !Number.isSafeInteger(id) ||
    typeof claims.email !== "string"
  ) {
    res.status(403).json({ error: "Administrator access required" });
    return null;
  }

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  if (!admin || !admin.isActive) {
    res.status(403).json({ error: "Administrator account is inactive" });
    return null;
  }
  if (
    claims.email.toLowerCase() !== admin.email.toLowerCase() ||
    claims.sessionVersion !== admin.sessionVersion
  ) {
    res.status(401).json({ error: "Please sign in again" });
    return null;
  }
  if (!isAdminRole(admin.role)) {
    res.status(403).json({ error: "Administrator role is not configured" });
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role as AdminRole,
    sessionVersion: admin.sessionVersion,
  };
}

function attachAdminAuditLogging(
  req: Request,
  res: Response,
  admin: AdminClaims,
): void {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase())) {
    return;
  }

  res.once("finish", () => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ipAddress =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim().slice(0, 64)
        : req.ip?.slice(0, 64);

    void recordAdminAuditEvent({
      actorAdminId: admin.id,
      actorEmail: admin.email,
      action:
        res.statusCode >= 400
          ? `${req.method.toLowerCase()}_failed`
          : req.method.toLowerCase(),
      resource: req.originalUrl.split("?")[0].slice(0, 500),
      statusCode: res.statusCode,
      ipAddress,
      userAgent: req.headers["user-agent"]?.slice(0, 500),
    });
  });
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: unknown, user: unknown) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    const claims =
      user && typeof user === "object"
        ? (user as { type?: unknown; id?: unknown })
        : null;
    if (!claims || claims.type !== "member") {
      res.status(403).json({ error: "Member access required" });
      return;
    }
    (req as Request & { user?: unknown }).user = user;
    next();
  });
}

export function authenticateAdminPermission(permission: AdminPermission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      const admin = await findAuthenticatedAdmin(req, res);
      if (!admin) return;

      attachAdminAuditLogging(req, res, admin);
      const isWrite = !["GET", "HEAD", "OPTIONS"].includes(
        req.method.toUpperCase(),
      );
      if (!canAccessAdminPermission(admin.role, permission, isWrite)) {
        res.status(403).json({ error: "Your role cannot perform this action" });
        return;
      }

      (req as Request & { user?: unknown }).user = {
        ...admin,
        type: "admin",
      };
      next();
    })().catch((error) => {
      console.error("Administrator authentication failed.");
      if (!res.headersSent) {
        res.status(500).json({ error: "Unable to verify administrator access" });
      }
    });
  };
}

/** Legacy admin-only middleware; restricted to Super Admin privileges. */
export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  authenticateAdminPermission("user_management")(req, res, next);
}
