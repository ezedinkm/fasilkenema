import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Trophy, Calendar, CheckCircle2 } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";

type Team = { id: number; name: string; logo?: string | null };
type StandingRow = {
  clubId: number;
  name: string;
  logo?: string | null;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};
type MatchRow = {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: "finished" | "upcoming";
};
type EplPayload = {
  ok: boolean;
  standings: StandingRow[];
  matches: MatchRow[];
  finished: MatchRow[];
  upcoming: MatchRow[];
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function getMatchKey(m: MatchRow) {
  const parsed = new Date(m.matchDate);
  const normalizedDate = Number.isNaN(parsed.getTime())
    ? m.matchDate
    : parsed.toISOString();
  return `${m.homeTeam.id}-${m.awayTeam.id}-${normalizedDate}-${m.status}`;
}

function TeamPill({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team.logo ? (
        <img
          src={team.logo}
          alt=""
          className="h-6 w-6 rounded-sm object-contain bg-white border"
          loading="lazy"
        />
      ) : (
        <div className="h-6 w-6 rounded-sm bg-muted border" />
      )}
      <span className="truncate font-medium">{team.name}</span>
    </div>
  );
}

function MatchCard({ m }: { m: MatchRow }) {
  const isFinished = m.status === "finished";
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamPill team={m.homeTeam} />
              <div className="text-center">
                {isFinished ? (
                  <div className="font-heading text-lg font-bold tabular-nums">
                    {m.homeScore ?? 0}{" "}
                    <span className="text-muted-foreground font-medium">-</span>{" "}
                    {m.awayScore ?? 0}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-muted-foreground">
                    vs
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end min-w-0">
                <div className="text-right min-w-0">
                  <TeamPill team={m.awayTeam} />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(m.matchDate)}
              </span>
              {isFinished ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Finished
                </Badge>
              ) : (
                <Badge variant="outline">Upcoming</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EthiopianPremierLeague() {
  const [isRefreshNowPending, setIsRefreshNowPending] = useState(false);
  const { data, isLoading, error, refetch, isFetching } = useQuery<EplPayload>({
    queryKey: ["/api/epl"],
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const sortedStandings = useMemo(() => {
    const rows = data?.standings ?? [];
    return [...rows].sort(
      (a, b) =>
        (b.points ?? 0) - (a.points ?? 0) ||
        (b.goalDiff ?? 0) - (a.goalDiff ?? 0),
    );
  }, [data?.standings]);

  const finished = useMemo(() => {
    const seen = new Set<string>();
    return (data?.finished ?? []).filter((m) => {
      const key = getMatchKey(m);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data?.finished]);
  const upcoming = useMemo(() => {
    const seen = new Set<string>();
    return (data?.upcoming ?? []).filter((m) => {
      const key = getMatchKey(m);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data?.upcoming]);

  const handleRefreshNow = async () => {
    if (isRefreshNowPending) return;
    setIsRefreshNowPending(true);
    try {
      await apiRequest("GET", "/api/scrape");
      await refetch();
    } finally {
      setIsRefreshNowPending(false);
    }
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-red-600 to-red-700 text-white">
        <div className="container px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                <Trophy className="h-4 w-4" />
                Ethiopian Premier League
              </div>
              <h1 className="mt-3 font-heading text-3xl md:text-5xl font-extrabold leading-tight">
                Standings, Results & Fixtures
              </h1>
              <p className="mt-2 text-white/85 text-sm md:text-base">
                Live-like data from free web scraping (auto-updates every 6
                hours). Use “Refresh now” to trigger a manual update.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/15 hover:text-white"
                disabled={isFetching || isRefreshNowPending}
              >
                {isFetching ? "Refreshing…" : "Reload"}
              </Button>
              <Button
                onClick={handleRefreshNow}
                className="bg-white text-red-700 hover:bg-white/90"
                disabled={isFetching || isRefreshNowPending}
              >
                <RefreshCw
                  className={
                    isRefreshNowPending ? "h-4 w-4 animate-spin" : "h-4 w-4"
                  }
                />
                {isRefreshNowPending ? "Scraping..." : "Refresh now"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-10">
        {error ? (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">
                Failed to load league data
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {String(error)}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg md:text-xl">
                    League Table
                  </CardTitle>
                  <Badge variant="outline" className="bg-background">
                    {sortedStandings.length} clubs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Club</TableHead>
                        <TableHead className="text-right">P</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          W
                        </TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          D
                        </TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          L
                        </TableHead>
                        <TableHead className="text-right hidden md:table-cell">
                          GF
                        </TableHead>
                        <TableHead className="text-right hidden md:table-cell">
                          GA
                        </TableHead>
                        <TableHead className="text-right hidden md:table-cell">
                          GD
                        </TableHead>
                        <TableHead className="text-right font-bold">
                          Pts
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedStandings.map((r, idx) => (
                        <TableRow key={r.clubId}>
                          <TableCell className="font-semibold tabular-nums">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              {r.logo ? (
                                <img
                                  src={r.logo}
                                  alt=""
                                  className="h-7 w-7 rounded-sm object-contain bg-white border"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-sm bg-muted border" />
                              )}
                              <span className="truncate font-medium">
                                {r.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {r.played ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums hidden sm:table-cell">
                            {r.win ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums hidden sm:table-cell">
                            {r.draw ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums hidden sm:table-cell">
                            {r.loss ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums hidden md:table-cell">
                            {r.goalsFor ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums hidden md:table-cell">
                            {r.goalsAgainst ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums hidden md:table-cell">
                            <span
                              className={
                                r.goalDiff >= 0
                                  ? "text-emerald-600 font-medium"
                                  : "text-rose-600 font-medium"
                              }
                            >
                              {r.goalDiff >= 0 ? `+${r.goalDiff}` : r.goalDiff}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-bold">
                            {r.points ?? 0}
                          </TableCell>
                        </TableRow>
                      ))}
                      {sortedStandings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="py-10 text-center text-sm text-muted-foreground"
                          >
                            No league data yet. Click “Refresh now” to scrape
                            and store EPL standings & matches.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcoming.length})
                    </TabsTrigger>
                    <TabsTrigger value="finished">
                      Finished ({finished.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    <div className="mt-4 grid gap-3">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : upcoming.length ? (
                        upcoming
                          .slice(0, 10)
                          .map((m) => <MatchCard key={getMatchKey(m)} m={m} />)
                      ) : (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          No upcoming matches found yet.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="finished">
                    <div className="mt-4 grid gap-3">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </>
                      ) : finished.length ? (
                        finished
                          .slice(0, 10)
                          .map((m) => <MatchCard key={getMatchKey(m)} m={m} />)
                      ) : (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          No finished matches found yet.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
