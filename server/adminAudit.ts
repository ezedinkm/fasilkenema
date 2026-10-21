import { adminAuditLogs } from "@shared/schema";
import { db } from "./db";

export interface AdminAuditEvent {
  actorAdminId: number | null;
  actorEmail: string;
  action: string;
  resource: string;
  statusCode: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordAdminAuditEvent(
  event: AdminAuditEvent,
): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values({
      ...event,
      ipAddress: event.ipAddress || null,
      userAgent: event.userAgent || null,
    });
  } catch (error) {
    console.error("Failed to write administrator audit event.");
  }
}
