import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  Clock3,
  Eye,
  Globe2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Users,
  Wifi,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminVisitorAnalytics } from "@/lib/api";
import type {
  VisitorAnalyticsRange,
  VisitorAnalyticsResponse,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ranges: Array<{ value: VisitorAnalyticsRange; label: string }> = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const numberFormat = new Intl.NumberFormat("en-US");

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function formatBucket(value: string, range: VisitorAnalyticsRange) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", range === "24h"
    ? { hour: "numeric" }
    : { month: "short", day: "numeric" });
}

function formatUpdatedAt(value?: string) {
  if (!value) return "Waiting for first update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  return `Updated ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function EmptyRows({ label }: { label: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-emerald-900/15 bg-[#f7f8f2] px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default function VisitorAnalytics() {
  const [range, setRange] = useState<VisitorAnalyticsRange>("7d");
  const [data, setData] = useState<VisitorAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);
  const loadedRangeRef = useRef<VisitorAnalyticsRange | null>(null);

  const loadData = useCallback(async (manual = false) => {
    const requestId = ++requestRef.current;
    if (manual) setRefreshing(true);
    else if (loadedRangeRef.current !== range) {
      setLoading(true);
      setData(null);
    }
    try {
      const response = await getAdminVisitorAnalytics(range);
      if (requestRef.current !== requestId) return;
      setData(response);
      loadedRangeRef.current = range;
      setError("");
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : "Unable to load visitor analytics.");
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [range]);

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(() => void loadData(), 30_000);
    return () => {
      window.clearInterval(interval);
      requestRef.current += 1;
    };
  }, [loadData]);

  const hasAnyActivity = !!data && (
    data.visitors > 0 ||
    data.pageviews > 0 ||
    data.activeVisitors > 0 ||
    data.trend.some((item) => item.pageviews > 0 || item.visitors > 0) ||
    data.topPages.some((item) => item.pageviews > 0 || item.visitors > 0) ||
    data.sources.some((item) => item.visits > 0 || item.pageviews > 0)
  );

  const metrics = [
    {
      label: "Anonymous sessions",
      value: data ? numberFormat.format(data.visitors) : "—",
      note: "Visitors are anonymous sessions, not identified people",
      icon: Users,
      accent: "text-[#285c42]",
    },
    {
      label: "Pageviews",
      value: data ? numberFormat.format(data.pageviews) : "—",
      note: "Total pages viewed",
      icon: Eye,
      accent: "text-[#b38527]",
    },
    {
      label: "Bounce rate",
      value: data ? `${Number(data.bounceRate || 0).toFixed(1)}%` : "—",
      note: "Sessions with one pageview",
      icon: ArrowDownRight,
      accent: "text-[#a64e43]",
    },
    {
      label: "Avg. session",
      value: data ? formatDuration(data.averageSessionSeconds) : "—",
      note: "Time spent per session",
      icon: Clock3,
      accent: "text-[#536e83]",
    },
  ];

  const maxSourceVisits = Math.max(1, ...(data?.sources.map((item) => item.visits) ?? []));

  return (
    <section aria-labelledby="visitor-analytics-heading" className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-[#9B0F06] px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-1 -top-16 h-48 w-48 rounded-full border border-white/15" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              <Activity className="h-3.5 w-3.5" />
              Public site pulse
            </div>
            <h2 id="visitor-analytics-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Visitor analytics
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
              A clear view of how supporters find and explore Fasil Kenema online.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-lg border border-white/15 bg-white/[0.07] p-1" aria-label="Choose analytics time range">
              {ranges.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  aria-pressed={range === item.value}
                  className={`rounded-md px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                    range === item.value
                      ? "bg-white text-[#9B0F06] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void loadData(true)}
              disabled={refreshing || loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/20 px-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh visitor analytics"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2 text-xs text-white/75">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span>{formatUpdatedAt(data?.updatedAt)}</span>
          <span className="text-white/30">·</span>
          <span>Auto-refreshes every 30 seconds</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-medium text-white">
            <Wifi className="h-3.5 w-3.5" />
            {numberFormat.format(data?.activeVisitors ?? 0)} active now
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#c7796c]/30 bg-[#fff5f1] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-[#8c3f35]">Analytics could not be refreshed</p>
            <p className="mt-1 text-sm text-[#8c5d55]">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadData(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#c7796c]/35 bg-white px-3 py-2 text-sm font-medium text-[#8c3f35] hover:bg-[#fffaf8]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-[#e4e8df] bg-[#fffefa] shadow-[0_2px_12px_rgba(35,55,41,0.04)]">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-[#637267]">{metric.label}</p>
                  <span className="rounded-lg bg-[#f0f3eb] p-2">
                    <Icon className={`h-4 w-4 ${metric.accent}`} />
                  </span>
                </div>
                {loading && !data ? (
                  <div className="mt-4 h-8 w-28 animate-pulse rounded bg-[#e9ede5]" />
                ) : (
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1c3427]">{metric.value}</p>
                )}
                <p className="mt-2 text-xs leading-5 text-[#899389]">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && !data ? (
        <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
          {[0, 1].map((item) => (
            <div key={item} className="h-[310px] animate-pulse rounded-xl border border-[#e4e8df] bg-[#f5f6f0]" />
          ))}
        </div>
      ) : !hasAnyActivity ? (
        <div className="rounded-xl border border-dashed border-[#cfd8ce] bg-[#f8f9f4] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8eee5] text-[#285c42]">
            <Globe2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#294333]">No visits in this window</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Public-site activity will appear here as anonymous session data is collected.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <Card className="overflow-hidden border-[#e4e8df] bg-[#fffefa] shadow-[0_2px_12px_rgba(35,55,41,0.04)]">
              <CardHeader className="flex-row items-start justify-between space-y-0 px-4 pb-2 pt-5 sm:px-5">
                <div>
                  <CardTitle className="text-base text-[#294333]">Traffic over time</CardTitle>
                  <p className="mt-1 text-xs text-[#899389]">Pageviews and anonymous sessions</p>
                </div>
                <div className="flex gap-3 pt-1 text-xs text-[#66756b]">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#285c42]" />Pageviews</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#d0ae4b]" />Sessions</span>
                </div>
              </CardHeader>
              <CardContent className="px-1 pb-4 sm:px-3">
                {data?.trend.length ? (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.trend} margin={{ top: 14, right: 12, left: -18, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#e9ede6" strokeDasharray="3 5" />
                        <XAxis
                          dataKey="bucket"
                          tickFormatter={(value) => formatBucket(value, range)}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#899389", fontSize: 11 }}
                          minTickGap={24}
                        />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#899389", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(value) => formatBucket(String(value), range)}
                          contentStyle={{ border: "1px solid #e4e8df", borderRadius: 10, boxShadow: "0 8px 20px rgba(35,55,41,.08)", fontSize: 12 }}
                        />
                        <Line type="monotone" dataKey="pageviews" name="Pageviews" stroke="#285c42" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="visitors" name="Sessions" stroke="#c19a35" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyRows label="No trend data available for this period." />}
              </CardContent>
            </Card>

            <Card className="border-[#e4e8df] bg-[#fffefa] shadow-[0_2px_12px_rgba(35,55,41,0.04)]">
              <CardHeader className="px-4 pb-3 pt-5 sm:px-5">
                <CardTitle className="text-base text-[#294333]">Where visits come from</CardTitle>
                <p className="mt-1 text-xs text-[#899389]">Traffic sources by visit count</p>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-5 sm:px-5">
                {data?.sources.length ? data.sources.slice(0, 6).map((source) => (
                  <div key={source.source}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-[#405348]">{source.source || "Direct"}</span>
                      <span className="shrink-0 tabular-nums text-[#68786d]">{numberFormat.format(source.visits)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0e9]">
                      <div className="h-full rounded-full bg-[#78945c]" style={{ width: `${Math.max(3, (source.visits / maxSourceVisits) * 100)}%` }} />
                    </div>
                  </div>
                )) : <EmptyRows label="Source information will appear as visits are recorded." />}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-[#e4e8df] bg-[#fffefa] shadow-[0_2px_12px_rgba(35,55,41,0.04)]">
              <CardHeader className="px-4 pb-3 pt-5 sm:px-5">
                <CardTitle className="text-base text-[#294333]">Most visited pages</CardTitle>
                <p className="mt-1 text-xs text-[#899389]">Pages drawing the most supporter attention</p>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-5">
                {data?.topPages.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[410px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#edf0e9] text-xs uppercase tracking-wider text-[#899389]">
                          <th className="pb-3 font-medium">Page</th>
                          <th className="pb-3 text-right font-medium">Pageviews</th>
                          <th className="pb-3 text-right font-medium">Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topPages.slice(0, 7).map((page) => (
                          <tr key={page.path} className="border-b border-[#f0f2ed] last:border-0">
                            <td className="max-w-0 py-3 pr-4">
                              <span className="block truncate font-medium text-[#405348]" title={page.path}>{page.path || "/"}</span>
                            </td>
                            <td className="py-3 text-right tabular-nums text-[#526358]">{numberFormat.format(page.pageviews)}</td>
                            <td className="py-3 text-right tabular-nums text-[#526358]">{numberFormat.format(page.visitors)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyRows label="No page activity to show yet." />}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="border-[#e4e8df] bg-[#fffefa] shadow-[0_2px_12px_rgba(35,55,41,0.04)]">
                <CardHeader className="px-4 pb-3 pt-5 sm:px-5">
                  <CardTitle className="text-base text-[#294333]">Devices</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 px-4 pb-5 sm:px-5">
                  {data?.devices.length ? data.devices.slice(0, 3).map((device) => {
                    const normalized = device.device.toLowerCase();
                    const Icon = normalized.includes("phone") || normalized.includes("mobile")
                      ? Smartphone
                      : normalized.includes("tablet") ? Tablet : Monitor;
                    return (
                      <div key={device.device} className="rounded-lg bg-[#f5f6f0] px-2 py-3 text-center">
                        <Icon className="mx-auto h-4 w-4 text-[#67805b]" />
                        <p className="mt-2 truncate text-xs text-[#758177]">{device.device}</p>
                        <p className="mt-0.5 text-lg font-semibold text-[#294333]">{numberFormat.format(device.visitors)}</p>
                      </div>
                    );
                  }) : <div className="col-span-3"><EmptyRows label="Device mix is not available yet." /></div>}
                </CardContent>
              </Card>

              <Card className="border-[#e4e8df] bg-[#fffefa] shadow-[0_2px_12px_rgba(35,55,41,0.04)]">
                <CardHeader className="px-4 pb-3 pt-5 sm:px-5">
                  <CardTitle className="flex items-center gap-2 text-base text-[#294333]">
                    <span className="h-2 w-2 rounded-full bg-[#7a9a5b]" />
                    Active pages
                  </CardTitle>
                  <p className="mt-1 text-xs text-[#899389]">Currently viewed pages</p>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-5 sm:px-5">
                  {data?.activePages.length ? data.activePages.slice(0, 4).map((page) => (
                    <div key={page.path} className="flex items-center justify-between gap-3 rounded-lg bg-[#f5f6f0] px-3 py-2.5">
                      <span className="min-w-0 truncate text-sm font-medium text-[#405348]" title={page.path}>{page.path || "/"}</span>
                      <span className="shrink-0 rounded-full bg-[#e6ecdf] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#46613d]">{page.visitors}</span>
                    </div>
                  )) : <EmptyRows label="No active pages right now." />}
                  {data && data.activePages.length === 0 && data.activeVisitors > 0 && (
                    <p className="text-center text-xs text-[#899389]">{numberFormat.format(data.activeVisitors)} active sessions across the site</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
