import { cpus } from "node:os";
import { performance } from "node:perf_hooks";
import { getHeapStatistics } from "node:v8";
import type { NextFunction, Request, Response } from "express";

const MONITORING_WINDOW_MS = 5 * 60 * 1000;
const MAX_HTTP_SAMPLES = 5000;

type HttpSample = {
  recordedAt: number;
  statusCode: number;
  durationMs: number;
};

const httpSamples: HttpSample[] = [];
const cpuCount = Math.max(1, cpus().length);
let cpuSampleStartedAt = process.hrtime.bigint();
let cpuSampleBaseline = process.cpuUsage();
let latestCpuPercent = 0;

const cpuSampler = setInterval(() => {
  const elapsedMicros =
    Number(process.hrtime.bigint() - cpuSampleStartedAt) / 1000;
  const cpuDelta = process.cpuUsage(cpuSampleBaseline);
  latestCpuPercent = Math.min(
    100,
    Math.max(
      0,
      ((cpuDelta.user + cpuDelta.system) / Math.max(1, elapsedMicros * cpuCount)) *
        100,
    ),
  );
  cpuSampleBaseline = process.cpuUsage();
  cpuSampleStartedAt = process.hrtime.bigint();
}, 5000);
cpuSampler.unref();

function pruneHttpSamples(now = Date.now()) {
  while (
    httpSamples.length > 0 &&
    (now - httpSamples[0].recordedAt > MONITORING_WINDOW_MS ||
      httpSamples.length > MAX_HTTP_SAMPLES)
  ) {
    httpSamples.shift();
  }
}

export function serverMonitoringMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const startedAt = performance.now();
  res.once("finish", () => {
    httpSamples.push({
      recordedAt: Date.now(),
      statusCode: res.statusCode,
      durationMs: Math.max(0, performance.now() - startedAt),
    });
    pruneHttpSamples();
  });
  next();
}

export function getHttpMonitorMetrics() {
  pruneHttpSamples();
  const responseTimes = httpSamples
    .map((sample) => sample.durationMs)
    .sort((a, b) => a - b);
  const requestCount = httpSamples.length;
  const serverErrors = httpSamples.filter(
    (sample) => sample.statusCode >= 500,
  ).length;
  const percentile95Index = Math.max(
    0,
    Math.ceil(responseTimes.length * 0.95) - 1,
  );

  return {
    windowMinutes: MONITORING_WINDOW_MS / 60_000,
    requestCount,
    serverErrors,
    serverErrorRatePercent: requestCount
      ? (serverErrors / requestCount) * 100
      : 0,
    averageResponseTimeMs: requestCount
      ? responseTimes.reduce((sum, value) => sum + value, 0) / requestCount
      : 0,
    p95ResponseTimeMs: responseTimes[percentile95Index] ?? 0,
  };
}

export function getProcessMonitorMetrics() {
  const memory = process.memoryUsage();
  const heapLimitBytes = getHeapStatistics().heap_size_limit;

  return {
    cpuPercent: latestCpuPercent,
    cpuSampleWindowSeconds: 5,
    memory: {
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
      heapLimitBytes,
      externalBytes: memory.external,
      heapUsagePercent: heapLimitBytes
        ? (memory.heapUsed / heapLimitBytes) * 100
        : 0,
    },
    process: {
      uptimeSeconds: process.uptime(),
      startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment: process.env.NODE_ENV ?? "unknown",
    },
    http: getHttpMonitorMetrics(),
  };
}
