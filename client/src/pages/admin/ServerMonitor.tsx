import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  type LucideIcon,
} from "lucide-react";
import { getAdminServerMonitor } from "@/lib/api";

type MonitorStatus = "healthy" | "warning" | "critical";

type ServerMonitorData = {
  status: MonitorStatus;
  checkedAt: string;
  cpuPercent: number;
  cpuSampleWindowSeconds: number;
  memory: {
    rssBytes: number;
    heapUsedBytes: number;
    heapTotalBytes: number;
    heapLimitBytes: number;
    externalBytes: number;
    heapUsagePercent: number;
  };
  process: {
    uptimeSeconds: number;
    startedAt: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
    environment: string;
  };
  http: {
    windowMinutes: number;
    requestCount: number;
    serverErrors: number;
    serverErrorRatePercent: number;
    averageResponseTimeMs: number;
    p95ResponseTimeMs: number;
  };
  database: {
    status: "healthy" | "unavailable";
    latencyMs: number | null;
    pool: {
      total: number;
      idle: number;
      waiting: number;
    };
  };
  alerts: Array<{
    severity: "warning" | "critical";
    message: string;
  }>;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatUptime(seconds: number) {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    `${minutes}m`,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function StatusBadge({ status }: { status: MonitorStatus }) {
  const styles: Record<MonitorStatus, string> = {
    healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    critical: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <Badge variant="outline" className={`capitalize ${styles[status]}`}>
      {status}
    </Badge>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminServerMonitor() {
  const [metrics, setMetrics] = useState<ServerMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMetrics = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = (await getAdminServerMonitor()) as ServerMonitorData;
      setMetrics(data);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load server monitoring data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshMetrics();
    const intervalId = window.setInterval(() => {
      void refreshMetrics();
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [refreshMetrics]);

  const status = metrics?.status ?? "warning";
  const heapUsedPercent = metrics?.memory.heapUsagePercent ?? 0;

  return (
    <AdminLayout>
      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-zinc-900 sm:text-3xl">
              Server Monitor
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Live application, database, resource, and request-health signals.
              Metrics refresh every 30 seconds and contain no secret values or
              request content.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshMetrics()}
            disabled={refreshing}
            className="w-full shrink-0 sm:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh now
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            Loading server health…
          </div>
        ) : metrics ? (
          <>
            <Card className="border-zinc-200">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-3">
                  {status === "healthy" ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle
                      className={`h-6 w-6 ${
                        status === "critical"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                  )}
                  <div>
                    <p className="font-semibold text-zinc-900">
                      Overall system status
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last checked {formatTimestamp(metrics.checkedAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={status} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Process CPU"
                value={`${metrics.cpuPercent.toFixed(1)}%`}
                detail={`Process CPU, sampled over ${metrics.cpuSampleWindowSeconds}s`}
                icon={Cpu}
              />
              <MetricCard
                title="Memory (RSS)"
                value={formatBytes(metrics.memory.rssBytes)}
                detail="Total resident process memory"
                icon={HardDrive}
              />
              <MetricCard
                title="Node.js heap"
                value={`${heapUsedPercent.toFixed(1)}%`}
                detail={`${formatBytes(metrics.memory.heapUsedBytes)} used of ${formatBytes(metrics.memory.heapLimitBytes)} limit`}
                icon={Activity}
              />
              <MetricCard
                title="Database response"
                value={
                  metrics.database.latencyMs === null
                    ? "Unavailable"
                    : `${metrics.database.latencyMs} ms`
                }
                detail={`Connection check: ${metrics.database.status}`}
                icon={Database}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Request performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Detail label={`Requests (${metrics.http.windowMinutes} min)`} value={metrics.http.requestCount.toLocaleString()} />
                  <Detail label="Server errors (5xx)" value={metrics.http.serverErrors.toLocaleString()} />
                  <Detail label="5xx error rate" value={`${metrics.http.serverErrorRatePercent.toFixed(2)}%`} />
                  <Detail label="Average response" value={`${metrics.http.averageResponseTimeMs.toFixed(0)} ms`} />
                  <Detail label="95th percentile" value={`${metrics.http.p95ResponseTimeMs.toFixed(0)} ms`} />
                  <Detail label="Measurement window" value="Rolling 5 minutes" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Detail label="Status" value={metrics.database.status} />
                  <Detail label="Open connections" value={metrics.database.pool.total.toLocaleString()} />
                  <Detail label="Idle connections" value={metrics.database.pool.idle.toLocaleString()} />
                  <Detail label="In use" value={Math.max(0, metrics.database.pool.total - metrics.database.pool.idle).toLocaleString()} />
                  <Detail label="Waiting queries" value={metrics.database.pool.waiting.toLocaleString()} />
                  <Detail label="Probe latency" value={metrics.database.latencyMs === null ? "—" : `${metrics.database.latencyMs} ms`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Application runtime
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Detail label="Process uptime" value={formatUptime(metrics.process.uptimeSeconds)} />
                  <Detail label="Environment" value={metrics.process.environment} />
                  <Detail label="Node.js" value={metrics.process.nodeVersion} />
                  <Detail label="Platform" value={`${metrics.process.platform} (${metrics.process.architecture})`} />
                  <Detail label="Started at" value={formatTimestamp(metrics.process.startedAt)} />
                  <Detail label="External memory" value={formatBytes(metrics.memory.externalBytes)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5" />
                    Decision signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.alerts.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      No monitored thresholds are currently exceeded.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {metrics.alerts.map((alert, index) => (
                        <li
                          key={`${alert.severity}-${index}`}
                          className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                            alert.severity === "critical"
                              ? "bg-red-50 text-red-800"
                              : "bg-amber-50 text-amber-900"
                          }`}
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          {alert.message}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Alerts use process-level measurements and a short rolling
                    request window. They are operational signals, not a
                    replacement for host-level monitoring.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            Server metrics are not available yet. Use Refresh now to try again.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold capitalize text-zinc-900">
        {value}
      </p>
    </div>
  );
}
