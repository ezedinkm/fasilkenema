import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { KeyRound, UserCheck, UserPlus, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/lib/context";
import { ADMIN_ROLES, ADMIN_ROLE_LABELS, type AdminRole } from "@shared/adminAccess";

interface AdminAccount {
  id: number;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

interface AdminForm {
  fullName: string;
  email: string;
  password: string;
  role: AdminRole;
}

async function adminRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Request failed");
  }
  return result as T;
}

const emptyForm: AdminForm = {
  fullName: "",
  email: "",
  password: "",
  role: "content_editor",
};

export default function AdminUsers() {
  const { token, admin, logout } = useApp();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [resetTarget, setResetTarget] = useState<AdminAccount | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const usersQuery = useQuery({
    queryKey: ["/api/admin/users", token],
    enabled: !!token,
    queryFn: () => adminRequest<AdminAccount[]>("/api/admin/users", token!),
  });

  const refreshUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users", token] });

  const createUser = useMutation({
    mutationFn: (data: AdminForm) =>
      adminRequest<AdminAccount>("/api/admin/users", token!, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      setForm(emptyForm);
      setError("");
      setNotice("Administrator account created.");
      await refreshUsers();
    },
    onError: (cause) => {
      setNotice("");
      setError(cause instanceof Error ? cause.message : "Could not create account.");
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<AdminAccount> }) =>
      adminRequest<AdminAccount>(`/api/admin/users/${id}`, token!, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: async () => {
      setError("");
      setNotice("Administrator account updated.");
      await refreshUsers();
    },
    onError: (cause) => {
      setNotice("");
      setError(cause instanceof Error ? cause.message : "Could not update account.");
    },
  });

  const resetUserPassword = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      adminRequest<{ success: boolean }>(
        `/api/admin/users/${id}/reset-password`,
        token!,
        { method: "POST", body: JSON.stringify({ password }) },
      ),
    onSuccess: async (_result, variables) => {
      setResetTarget(null);
      setResetPassword("");
      setError("");
      setNotice("Password reset. The account must sign in again.");
      if (variables.id === admin?.id) {
        logout();
        setLocation("/admin/login");
        return;
      }
      await refreshUsers();
    },
    onError: (cause) => {
      setNotice("");
      setError(cause instanceof Error ? cause.message : "Could not reset password.");
    },
  });

  const users = usersQuery.data ?? [];

  return (
    <AdminLayout>
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Security
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900">User Management</h1>
        <p className="mt-2 text-zinc-600">
          Create administrator accounts, assign access, and deactivate accounts that no longer need access.
        </p>
      </div>

      {notice && (
        <div role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Access roles</CardTitle>
          <CardDescription>
            User Management, Audit Logs, and application settings are limited to Super Admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{ADMIN_ROLE_LABELS.super_admin}</p>
            <p className="mt-1 text-sm text-zinc-600">
              Full access, including account and audit-log management.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{ADMIN_ROLE_LABELS.operations_manager}</p>
            <p className="mt-1 text-sm text-zinc-600">
              Members, payments, newsletter, SMS, reviews, messages, team, and league table.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{ADMIN_ROLE_LABELS.content_editor}</p>
            <p className="mt-1 text-sm text-zinc-600">
              News and pages, careers, and social links.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{ADMIN_ROLE_LABELS.read_only}</p>
            <p className="mt-1 text-sm text-zinc-600">
              View available admin pages without saving changes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Add administrator
          </CardTitle>
          <CardDescription>
            Passwords must be at least 12 characters. New accounts are active immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setNotice("");
              createUser.mutate(form);
            }}
          >
            <Input
              aria-label="Full name"
              placeholder="Full name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            />
            <Input
              aria-label="Email"
              placeholder="Email address"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <Input
              aria-label="Temporary password"
              placeholder="Temporary password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={200}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <select
              aria-label="Role"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as AdminRole })
              }
            >
              {ADMIN_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ADMIN_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Creating…" : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Administrator accounts</CardTitle>
              <CardDescription className="mt-1">
                {users.length} account{users.length === 1 ? "" : "s"} · role changes take effect immediately.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void usersQuery.refetch()} disabled={usersQuery.isFetching}>
              {usersQuery.isFetching ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Loading accounts…</p>
          ) : usersQuery.isError ? (
            <p role="alert" className="py-8 text-center text-sm text-red-700">
              {usersQuery.error instanceof Error ? usersQuery.error.message : "Could not load accounts."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-3">Administrator</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Created</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => {
                    const isSelf = account.id === admin?.id;
                    return (
                      <tr key={account.id} className="border-b last:border-0">
                        <td className="px-3 py-4">
                          <p className="font-medium text-zinc-900">{account.fullName}</p>
                          <p className="mt-1 text-zinc-500">{account.email}</p>
                          {isSelf && <span className="mt-1 inline-block text-xs text-blue-700">You</span>}
                        </td>
                        <td className="px-3 py-4">
                          <select
                            aria-label={`Role for ${account.fullName}`}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={account.role}
                            disabled={isSelf || updateUser.isPending}
                            onChange={(event) =>
                              updateUser.mutate({
                                id: account.id,
                                updates: { role: event.target.value as AdminRole },
                              })
                            }
                          >
                            {ADMIN_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ADMIN_ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={
                              account.isActive
                                ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                                : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"
                            }
                          >
                            {account.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-zinc-600">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSelf || updateUser.isPending}
                              onClick={() =>
                                updateUser.mutate({
                                  id: account.id,
                                  updates: { isActive: !account.isActive },
                                })
                              }
                              title={isSelf ? "You cannot deactivate your own account" : undefined}
                            >
                              {account.isActive ? (
                                <><UserX className="mr-1.5 h-4 w-4" /> Deactivate</>
                              ) : (
                                <><UserCheck className="mr-1.5 h-4 w-4" /> Activate</>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResetTarget(account);
                                setResetPassword("");
                                setError("");
                              }}
                            >
                              <KeyRound className="mr-1.5 h-4 w-4" /> Reset password
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-zinc-500">
                        No administrator accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {resetTarget && (
        <Card>
          <CardHeader>
            <CardTitle>Reset password for {resetTarget.fullName}</CardTitle>
            <CardDescription>
              Their current password will stop working immediately. The new password is never displayed again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                resetUserPassword.mutate({
                  id: resetTarget.id,
                  password: resetPassword,
                });
              }}
            >
              <Input
                aria-label="New password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={200}
                required
                placeholder="New password (at least 12 characters)"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
              <Button type="submit" disabled={resetUserPassword.isPending}>
                {resetUserPassword.isPending ? "Saving…" : "Save new password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetTarget(null)}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
    </AdminLayout>
  );
}
