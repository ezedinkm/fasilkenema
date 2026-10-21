import type { Express } from "express";
import bcrypt from "bcryptjs";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ADMIN_ROLES } from "@shared/adminAccess";
import { adminAuditLogs, adminUsers } from "@shared/schema";
import { db } from "./db";
import { authenticateAdminPermission } from "./middleware/authMiddleware";

const createAdminSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(200),
  role: z.enum(ADMIN_ROLES),
});

const updateAdminSchema = z
  .object({
    role: z.enum(ADMIN_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined);

const resetPasswordSchema = z.object({
  password: z.string().min(12).max(200),
});

function safeAdminUser(admin: typeof adminUsers.$inferSelect) {
  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
  };
}

export function registerAdminAccessRoutes(app: Express): void {
  app.get(
    "/api/admin/users",
    authenticateAdminPermission("user_management"),
    async (_req, res) => {
      try {
        const rows = await db
          .select()
          .from(adminUsers)
          .orderBy(desc(adminUsers.createdAt));
        res.json(rows.map(safeAdminUser));
      } catch (error) {
        console.error("Failed to load administrator accounts.");
        res.status(500).json({ error: "Failed to load administrator accounts" });
      }
    },
  );

  app.post(
    "/api/admin/users",
    authenticateAdminPermission("user_management"),
    async (req, res) => {
      const validation = createAdminSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      try {
        const [created] = await db
          .insert(adminUsers)
          .values({
            fullName: validation.data.fullName,
            email: validation.data.email.toLowerCase(),
            password: await bcrypt.hash(validation.data.password, 12),
            role: validation.data.role,
            isActive: true,
            sessionVersion: 0,
          })
          .returning();
        res.status(201).json(safeAdminUser(created));
      } catch (error: any) {
        if (error?.code === "23505") {
          return res
            .status(409)
            .json({ error: "An administrator with this email already exists" });
        }
        console.error("Failed to create administrator account.");
        res.status(500).json({ error: "Failed to create administrator account" });
      }
    },
  );

  app.patch(
    "/api/admin/users/:id",
    authenticateAdminPermission("user_management"),
    async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid administrator ID" });
      }
      const validation = updateAdminSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      const actor = (req as typeof req & { user?: { id?: number } }).user;
      if (actor?.id === id) {
        return res
          .status(400)
          .json({ error: "You cannot change your own role or active status" });
      }

      try {
        const [target] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, id))
          .limit(1);
        if (!target) {
          return res.status(404).json({ error: "Administrator not found" });
        }

        const demotingOrDisablingLastSuperAdmin =
          target.role === "super_admin" &&
          target.isActive &&
          ((validation.data.role !== undefined &&
            validation.data.role !== "super_admin") ||
            validation.data.isActive === false);
        if (demotingOrDisablingLastSuperAdmin) {
          const activeSuperAdmins = await db
            .select({ id: adminUsers.id })
            .from(adminUsers)
            .where(
              and(
                eq(adminUsers.role, "super_admin"),
                eq(adminUsers.isActive, true),
              ),
            );
          if (activeSuperAdmins.length <= 1) {
            return res.status(409).json({
              error: "At least one active Super Admin must remain",
            });
          }
        }

        const role = validation.data.role ?? target.role;
        const isActive = validation.data.isActive ?? target.isActive;
        if (role === target.role && isActive === target.isActive) {
          return res.json(safeAdminUser(target));
        }

        const [updated] = await db
          .update(adminUsers)
          .set({
            role,
            isActive,
            sessionVersion: target.sessionVersion + 1,
          })
          .where(eq(adminUsers.id, id))
          .returning();
        res.json(safeAdminUser(updated));
      } catch (error) {
        console.error("Failed to update administrator account.");
        res.status(500).json({ error: "Failed to update administrator account" });
      }
    },
  );

  app.post(
    "/api/admin/users/:id/reset-password",
    authenticateAdminPermission("user_management"),
    async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid administrator ID" });
      }
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: fromZodError(validation.error).message });
      }

      try {
        const [updated] = await db
          .update(adminUsers)
          .set({
            password: await bcrypt.hash(validation.data.password, 12),
            sessionVersion: sql`${adminUsers.sessionVersion} + 1`,
          })
          .where(eq(adminUsers.id, id))
          .returning({ id: adminUsers.id });
        if (!updated) {
          return res.status(404).json({ error: "Administrator not found" });
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Failed to reset administrator password.");
        res.status(500).json({ error: "Failed to reset administrator password" });
      }
    },
  );

  app.get(
    "/api/admin/audit-logs",
    authenticateAdminPermission("audit_logs"),
    async (req, res) => {
      const requestedLimit = Number(req.query.limit);
      const requestedOffset = Number(req.query.offset);
      const limit = Number.isInteger(requestedLimit)
        ? Math.min(100, Math.max(1, requestedLimit))
        : 50;
      const offset = Number.isInteger(requestedOffset)
        ? Math.max(0, requestedOffset)
        : 0;

      try {
        const logs = await db
          .select()
          .from(adminAuditLogs)
          .orderBy(desc(adminAuditLogs.createdAt))
          .limit(limit)
          .offset(offset);
        res.json(logs);
      } catch (error) {
        console.error("Failed to load administrator audit logs.");
        res.status(500).json({ error: "Failed to load audit logs" });
      }
    },
  );
}
