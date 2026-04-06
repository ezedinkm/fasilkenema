import { useMemo } from "react";
import { Calendar, CheckCircle2, Trophy } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Team = {
  id: number;
  name: string;
  color: string; // Tailwind doesn't like dynamic classes; we use inline colors instead.
  logo?: string | null;
};

type StandingRow = {
  clubId: number;
  name: string;
  logo?: string | null;
  color: string;
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

const FASIL_ID = 1;
const SEASON_LABEL = "2025/26 (Demo)";

// Static EPL clubs for development UI.
const CLUBS: Team[] = [
  { id: 1, name: "Fasil Kenema FC", color: "#DC2626" }, // Fasil red
  { id: 2, name: "Saint George", color: "#EF4444" },
  { id: 3, name: "Ethiopian Coffee", color: "#7C3AED" },
  { id: 4, name: "Dedebit", color: "#2563EB" },
  { id: 5, name: "Wolaitta Dicha", color: "#F59E0B" },
  { id: 6, name: "Wolkite City", color: "#06B6D4" },
  { id: 7, name: "Hawassa City", color: "#10B981" },
  { id: 8, name: "Dire Dawa City", color: "#3B82F6" },
  { id: 9, name: "Mekelle 70 Enderta", color: "#8B5CF6" },
  { id: 10, name: "Jimma Aba Jifar", color: "#F97316" },
  { id: 11, name: "Hadiya Hossana", color: "#22C55E" },
  { id: 12, name: "Bahir Dar Kenema", color: "#14B8A6" },
  { id: 13, name: "Gondar Kenema", color: "#64748B" },
  { id: 14, name: "Arba Minch Kenema", color: "#FB7185" },
  { id: 15, name: "Debub Police", color: "#0EA5E9" },
  { id: 16, name: "Addis Ababa City", color: "#94A3B8" },
  { id: 17, name: "Wallagga FC", color: "#A855F7" },
  { id: 18, name: "Sidama Bunna", color: "#84CC16" },
];

const CLUB_BY_ID = Object.fromEntries(CLUBS.map((c) => [c.id, c])) as Record<number, Team>;

// European-table style standings: deterministic “demo season” values.
const STANDINGS_RAW: Omit<StandingRow, "name" | "color" | "logo" | "goalDiff">[] = [
  { clubId: 1, played: 28, win: 17, draw: 7, loss: 4, goalsFor: 42, goalsAgainst: 18, points: 58 },
  { clubId: 2, played: 28, win: 16, draw: 6, loss: 6, goalsFor: 38, goalsAgainst: 20, points: 54 },
  { clubId: 3, played: 28, win: 15, draw: 6, loss: 7, goalsFor: 40, goalsAgainst: 26, points: 51 },
  { clubId: 4, played: 28, win: 13, draw: 9, loss: 6, goalsFor: 34, goalsAgainst: 25, points: 48 },
  { clubId: 5, played: 28, win: 12, draw: 7, loss: 9, goalsFor: 31, goalsAgainst: 29, points: 43 },
  { clubId: 6, played: 28, win: 11, draw: 6, loss: 11, goalsFor: 29, goalsAgainst: 32, points: 39 },
  { clubId: 7, played: 28, win: 11, draw: 6, loss: 11, goalsFor: 28, goalsAgainst: 33, points: 39 },
  { clubId: 8, played: 28, win: 10, draw: 8, loss: 10, goalsFor: 30, goalsAgainst: 31, points: 38 },
  { clubId: 9, played: 28, win: 10, draw: 7, loss: 11, goalsFor: 27, goalsAgainst: 28, points: 37 },
  { clubId: 10, played: 28, win: 10, draw: 6, loss: 12, goalsFor: 26, goalsAgainst: 31, points: 36 },
  { clubId: 11, played: 28, win: 9, draw: 7, loss: 12, goalsFor: 25, goalsAgainst: 34, points: 34 },
  { clubId: 12, played: 28, win: 9, draw: 6, loss: 13, goalsFor: 24, goalsAgainst: 36, points: 33 },
  { clubId: 13, played: 28, win: 8, draw: 6, loss: 14, goalsFor: 22, goalsAgainst: 35, points: 30 },
  { clubId: 14, played: 28, win: 8, draw: 5, loss: 15, goalsFor: 21, goalsAgainst: 38, points: 29 },
  { clubId: 15, played: 28, win: 7, draw: 7, loss: 14, goalsFor: 20, goalsAgainst: 37, points: 28 },
  { clubId: 16, played: 28, win: 7, draw: 6, loss: 15, goalsFor: 19, goalsAgainst: 39, points: 27 },
  { clubId: 17, played: 28, win: 6, draw: 6, loss: 16, goalsFor: 18, goalsAgainst: 41, points: 24 },
  { clubId: 18, played: 28, win: 5, draw: 5, loss: 18, goalsFor: 16, goalsAgainst: 44, points: 20 },
];

type MatchRaw = {
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: "finished" | "upcoming";
};

const MATCHES_RAW: MatchRaw[] = [
  // Upcoming
  { homeTeamId: 1, awayTeamId: 3, homeScore: null, awayScore: null, matchDate: "2026-03-23T13:00:00.000Z", status: "upcoming" },
  { homeTeamId: 2, awayTeamId: 1, homeScore: null, awayScore: null, matchDate: "2026-03-27T13:00:00.000Z", status: "upcoming" },
  { homeTeamId: 1, awayTeamId: 4, homeScore: null, awayScore: null, matchDate: "2026-04-01T13:00:00.000Z", status: "upcoming" },
  { homeTeamId: 5, awayTeamId: 1, homeScore: null, awayScore: null, matchDate: "2026-04-05T13:00:00.000Z", status: "upcoming" },
  { homeTeamId: 1, awayTeamId: 6, homeScore: null, awayScore: null, matchDate: "2026-04-10T13:00:00.000Z", status: "upcoming" },
  { homeTeamId: 7, awayTeamId: 1, homeScore: null, awayScore: null, matchDate: "2026-04-14T13:00:00.000Z", status: "upcoming" },

  // Finished
  { homeTeamId: 8, awayTeamId: 1, homeScore: 1, awayScore: 2, matchDate: "2026-03-12T13:00:00.000Z", status: "finished" },
  { homeTeamId: 1, awayTeamId: 9, homeScore: 0, awayScore: 1, matchDate: "2026-03-15T13:00:00.000Z", status: "finished" },
  { homeTeamId: 10, awayTeamId: 1, homeScore: 1, awayScore: 1, matchDate: "2026-03-16T13:00:00.000Z", status: "finished" },
  { homeTeamId: 1, awayTeamId: 11, homeScore: 2, awayScore: 0, matchDate: "2026-03-18T13:00:00.000Z", status: "finished" },
  { homeTeamId: 12, awayTeamId: 1, homeScore: 0, awayScore: 3, matchDate: "2026-03-19T13:00:00.000Z", status: "finished" },
  { homeTeamId: 13, awayTeamId: 1, homeScore: 2, awayScore: 2, matchDate: "2026-03-20T13:00:00.000Z", status: "finished" },
];

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeStyle: "short" }).format(d);
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
        <span
          className="h-6 w-6 rounded-sm border inline-flex items-center justify-center"
          style={{ backgroundColor: `${team.color}1A`, borderColor: `${team.color}80` }}
          aria-hidden="true"
        />
      )}
      <span className="truncate font-medium">{team.name}</span>
    </div>
  );
}

function MatchCard({ m }: { m: MatchRow }) {
  const isFasil = m.homeTeam.id === FASIL_ID || m.awayTeam.id === FASIL_ID;
  const isFinished = m.status === "finished";

  return (
    <Card
      className={`shadow-sm ${
        isFasil ? "ring-1 ring-red-500/40 border border-red-200/60" : "border-border"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamPill team={m.homeTeam} />
              <div className="text-center">
                {isFinished ? (
                  <div className="font-heading text-lg font-bold tabular-nums">
                    {m.homeScore ?? 0} <span className="text-muted-foreground font-medium">-</span> {m.awayScore ?? 0}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-muted-foreground">vs</div>
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
                <Badge variant="secondary" className={isFasil ? "gap-1 bg-red-600/10 text-red-700" : "gap-1"}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Finished
                </Badge>
              ) : (
                <Badge variant={isFasil ? "destructive" : "outline"}>Upcoming</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EthiopianPremierLeagueStatic() {
  const standings = useMemo<StandingRow[]>(() => {
    const rows: StandingRow[] = STANDINGS_RAW.map((r) => {
      const club = CLUB_BY_ID[r.clubId];
      const goalDiff = r.goalsFor - r.goalsAgainst;
      return {
        ...r,
        name: club?.name ?? `Club ${r.clubId}`,
        logo: club?.logo ?? null,
        color: club?.color ?? "#DC2626",
        goalDiff,
      };
    });

    return rows.sort((a, b) => {
      return (
        (b.points ?? 0) - (a.points ?? 0) ||
        (b.goalDiff ?? 0) - (a.goalDiff ?? 0) ||
        (b.goalsFor ?? 0) - (a.goalsFor ?? 0)
      );
    });
  }, []);

  const matches = useMemo<MatchRow[]>(() => {
    return MATCHES_RAW
      .map((m) => {
        const homeTeam = CLUB_BY_ID[m.homeTeamId];
        const awayTeam = CLUB_BY_ID[m.awayTeamId];
        if (!homeTeam || !awayTeam) return null;
        return {
          homeTeam,
          awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          matchDate: m.matchDate,
          status: m.status,
        };
      })
      .filter(Boolean) as MatchRow[];
  }, []);

  const finished = useMemo(() => {
    return matches
      .filter((m) => m.status === "finished")
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  }, [matches]);

  const upcoming = useMemo(() => {
    return matches
      .filter((m) => m.status === "upcoming")
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  }, [matches]);

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
                League Table & Fixtures
              </h1>
              <p className="mt-2 text-white/85 text-sm md:text-base">
                {SEASON_LABEL} • Fasil Kenema FC–focused static preview (no backend calls).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="destructive" className="bg-white/10 text-white border border-white/30">
                  Fasil Kenema FC Focus
                </Badge>
                <Badge variant="outline" className="text-white border-white/40">
                  Demo data
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                className="md:hidden bg-white/10 border-white/30 text-white hover:bg-white/15 hover:text-white"
                disabled
              >
                Demo data
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg md:text-xl">League Table</CardTitle>
                  <Badge variant="outline" className="bg-background">
                    {standings.length} clubs
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {standings.length === 0 ? (
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
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Club</TableHead>
                        <TableHead className="text-right">P</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">W</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">D</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">L</TableHead>
                        <TableHead className="text-right hidden md:table-cell">GF</TableHead>
                        <TableHead className="text-right hidden md:table-cell">GA</TableHead>
                        <TableHead className="text-right hidden md:table-cell">GD</TableHead>
                        <TableHead className="text-right font-bold">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((r, idx) => {
                        const isFasilRow = r.clubId === FASIL_ID;
                        return (
                          <TableRow
                            key={r.clubId}
                            className={
                              isFasilRow
                                ? "bg-red-50/70 hover:bg-red-50/80 ring-1 ring-red-200"
                                : "hover:bg-muted/40"
                            }
                          >
                            <TableCell
                              className={
                                isFasilRow
                                  ? "font-semibold tabular-nums text-red-700"
                                  : "font-semibold tabular-nums"
                              }
                            >
                              {idx + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-7 w-7 rounded-sm border inline-flex items-center justify-center"
                                  style={{
                                    backgroundColor: `${r.color}1A`,
                                    borderColor: `${r.color}80`,
                                  }}
                                  aria-hidden="true"
                                />
                                <span className="truncate font-medium">{r.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{r.played ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums hidden sm:table-cell">{r.win ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums hidden sm:table-cell">{r.draw ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums hidden sm:table-cell">{r.loss ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums hidden md:table-cell">{r.goalsFor ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums hidden md:table-cell">{r.goalsAgainst ?? 0}</TableCell>
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
                            <TableCell className="text-right tabular-nums font-bold">{r.points ?? 0}</TableCell>
                          </TableRow>
                        );
                      })}
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
                      {upcoming.length ? (
                        upcoming.slice(0, 10).map((m) => (
                          <MatchCard
                            key={`${m.homeTeam.id}-${m.awayTeam.id}-${m.matchDate}-${m.status}`}
                            m={m}
                          />
                        ))
                      ) : (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          No upcoming matches in static data.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="finished">
                    <div className="mt-4 grid gap-3">
                      {finished.length ? (
                        finished.slice(0, 10).map((m) => (
                          <MatchCard
                            key={`${m.homeTeam.id}-${m.awayTeam.id}-${m.matchDate}-${m.status}`}
                            m={m}
                          />
                        ))
                      ) : (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          No finished matches in static data.
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

