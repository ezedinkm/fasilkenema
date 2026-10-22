import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/context";
import AdminLayout from "@/components/AdminLayout";
import { matchesSearch } from "@shared/search";

interface AuditEvent {
  id: number;
  actorEmail: string;
  action: string;
  resource: string;
  statusCode: number;
  ipAddress: string | null;
  createdAt: string;
}

async function loadAuditEvents(token: string): Promise<AuditEvent[]> {
  const response = await fetch("/api/admin/audit-logs?limit=100", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(result.error || "Could not load audit logs.");
  }
  return Array.isArray(result) ? result : [];
}

export default function AdminAuditLogs() {
  const { token } = useApp();
  const [search, setSearch] = useState("");
  const auditQuery = useQuery({
    queryKey: ["/api/admin/audit-logs", token],
    enabled: !!token,
    queryFn: () => loadAuditEvents(token!),
  });

  const filteredEvents = useMemo(() => {
    const events = auditQuery.data ?? [];
    return events.filter((event) =>
      matchesSearch(search, [
        event.actorEmail,
        event.action,
        event.resource,
        event.ipAddress ?? "",
        String(event.statusCode),
        event.createdAt,
        new Date(event.createdAt).toLocaleString(),
      ]),
    );
  }, [auditQuery.data, search]);

  return (
    <AdminLayout>
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Security
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900">Audit Logs</h1>
        <p className="mt-2 text-zinc-600">
          Recent administrator sign-ins and change attempts. Passwords, message contents, and configuration values are not recorded.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription className="mt-1">
                Showing up to 100 events, newest first.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => void auditQuery.refetch()}
              disabled={auditQuery.isFetching}
            >
              {auditQuery.isFetching ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
          <div className="mt-4 flex max-w-md gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                aria-label="Search audit logs"
                className="pl-9"
                placeholder="Search actor, action, resource, date, or IP"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            {search.trim() && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearch("")}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {auditQuery.isLoading ? (
            <p className="py-10 text-center text-sm text-zinc-500">Loading audit events…</p>
          ) : auditQuery.isError ? (
            <p role="alert" className="py-10 text-center text-sm text-red-700">
              {auditQuery.error instanceof Error
                ? auditQuery.error.message
                : "Could not load audit logs."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Administrator</th>
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Resource</th>
                    <th className="px-3 py-3">Result</th>
                    <th className="px-3 py-3">IP address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b last:border-0">
                      <td className="whitespace-nowrap px-3 py-4 text-zinc-600">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-4 font-medium text-zinc-900">
                        {event.actorEmail || "Unknown account"}
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs">
                          {event.action}
                        </span>
                      </td>
                      <td className="max-w-[280px] truncate px-3 py-4 font-mono text-xs text-zinc-600" title={event.resource}>
                        {event.resource}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={
                            event.statusCode < 400
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800"
                          }
                        >
                          {event.statusCode}
                        </span>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs text-zinc-600">
                        {event.ipAddress || "—"}
                      </td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-zinc-500">
                        {search ? "No events match this search." : "No administrator activity recorded yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}
