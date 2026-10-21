import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
type EplPayload = {
  ok: boolean;
  standings: StandingRow[];
};

export default function EthiopianPremierLeague() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<EplPayload>({
    queryKey: ["/api/epl"],
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const sortedStandings = useMemo(() => {
    const rows = data?.standings ?? [];
    return [...rows].sort((a, b) => (b.points ?? 0) - (a.points ?? 0) || (b.goalDiff ?? 0) - (a.goalDiff ?? 0));
  }, [data?.standings]);

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
                League Standings
              </h1>
            </div>

            <div className="flex w-full md:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/15 hover:text-white"
                disabled={isFetching}
              >
                {isFetching ? "Refreshing…" : "Reload"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-10">
        {error ? (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Failed to load league data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {String(error)}
            </CardContent>
          </Card>
        ) : null}

        <div className="mx-auto w-full max-w-6xl">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg md:text-xl">League Table</CardTitle>
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
                  <div className="overflow-x-auto">
                    <Table className="md:min-w-[760px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8 px-2 py-2 text-xs md:text-sm">#</TableHead>
                          <TableHead className="min-w-[150px] px-2 py-2 text-xs md:text-sm">Club</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">P</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">W</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">D</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">L</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">GF</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">GA</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs md:text-sm">GD</TableHead>
                          <TableHead className="px-1.5 py-2 text-right text-xs font-bold md:text-sm">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedStandings.map((r, idx) => {
                          const isFasilKenema = r.name.toLowerCase() === "fasil kenema";
                          const highlightedCellClass = isFasilKenema
                            ? "bg-red-50/70 border-y border-red-500"
                            : "";
                          return (
                          <TableRow
                            key={r.clubId}
                            className={isFasilKenema ? "hover:bg-red-50/70" : undefined}
                          >
                            <TableCell
                              className={`px-2 py-2 text-xs font-semibold tabular-nums md:text-sm ${
                                isFasilKenema ? `${highlightedCellClass} border-l` : ""
                              }`}
                            >
                              {idx + 1}
                            </TableCell>
                            <TableCell
                              className={
                                isFasilKenema
                                  ? `px-2 py-2 ${highlightedCellClass}`
                                  : "px-2 py-2"
                              }
                            >
                              <div className="flex items-center gap-1.5 min-w-0 md:gap-2">
                                {r.logo ? (
                                  <img
                                    src={r.logo}
                                    alt=""
                                    className="h-5 w-5 rounded-sm object-contain bg-white border md:h-7 md:w-7"
                                    loading="lazy"
                                    onError={(event) => {
                                      event.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="h-5 w-5 rounded-sm bg-muted border md:h-7 md:w-7" />
                                )}
                                <span
                                  className={
                                    isFasilKenema
                                      ? "truncate text-xs font-semibold text-red-700 md:text-sm"
                                      : "truncate text-xs font-medium md:text-sm"
                                  }
                                >
                                  {r.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>{r.played ?? 0}</TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>{r.win ?? 0}</TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>{r.draw ?? 0}</TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>{r.loss ?? 0}</TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>{r.goalsFor ?? 0}</TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>{r.goalsAgainst ?? 0}</TableCell>
                            <TableCell className={`px-1.5 py-2 text-right text-xs tabular-nums md:text-sm ${highlightedCellClass}`}>
                              <span className={r.goalDiff >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                                {r.goalDiff >= 0 ? `+${r.goalDiff}` : r.goalDiff}
                              </span>
                            </TableCell>
                            <TableCell
                              className={`px-1.5 py-2 text-right text-xs tabular-nums font-bold md:text-sm ${
                                isFasilKenema ? `${highlightedCellClass} border-r` : ""
                              }`}
                            >
                              {r.points ?? 0}
                            </TableCell>
                          </TableRow>
                        )})}
                        {sortedStandings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                              No league data is available yet. Check back soon.
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

