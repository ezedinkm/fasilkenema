import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canAccessAdminPermission,
  getAdminPagePermission,
} from "../shared/adminAccess";
import { calculateDashboardRevenue } from "../server/revenueTotals";

test("admin roles keep read-only and content access boundaries", () => {
  assert.equal(canAccessAdminPermission("super_admin", "settings", true), true);
  assert.equal(canAccessAdminPermission("read_only", "members", false), true);
  assert.equal(canAccessAdminPermission("read_only", "members", true), false);
  assert.equal(canAccessAdminPermission("content_editor", "content", true), true);
  assert.equal(canAccessAdminPermission("content_editor", "members", true), false);
  assert.equal(canAccessAdminPermission("not_a_role", "content", false), false);
  assert.equal(getAdminPagePermission("/admin/users"), "user_management");
  assert.equal(getAdminPagePermission("/admin/audit-logs"), "audit_logs");
});

test("dashboard revenue separates completed membership, manual, and donation totals by currency", () => {
  const revenue = calculateDashboardRevenue(
    [
      { type: "membership", status: "completed", amount: 100, currency: "ETB" },
      {
        type: "membership_renewal",
        status: "completed",
        amount: "5.50",
        currency: "usd",
      },
      {
        type: "membership",
        status: "completed",
        amount: 50,
        currency: "ETB",
        metadata: { source: "admin_manual_membership" },
      },
      { type: "membership", status: "pending", amount: 900, currency: "ETB" },
      { type: "donation", status: "completed", amount: 999, currency: "ETB" },
    ],
    [
      { status: "completed", amount: 25, currency: "etb" },
      { status: "completed", amount: "3", currency: "USD" },
      { status: "failed", amount: 500, currency: "ETB" },
    ],
  );

  assert.deepEqual(revenue, {
    membershipETB: 150,
    membershipUSD: 5.5,
    manualMembershipETB: 50,
    manualMembershipUSD: 0,
    donationETB: 25,
    donationUSD: 3,
  });
});
