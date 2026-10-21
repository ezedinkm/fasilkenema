import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, RefreshCw, Trash2, Trophy } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

interface StandingRow {
  clubId: number;
  name: string;
  logo: string | null;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface StandingForm {
  name: string;
  logo: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const emptyForm = (): StandingForm => ({
  name: "",
  logo: "",
  played: 0,
  win: 0,
  draw: 0,
  loss: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
});

function toForm(row: StandingRow): StandingForm {
  return {
    name: row.name,
    logo: row.logo ?? "",
    played: row.played,
    win: row.win,
    draw: row.draw,
    loss: row.loss,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    points: row.points,
  };
}

const numberFields: {
  key: Exclude<keyof StandingForm, "name" | "logo">;
  label: string;
}[] = [
  { key: "played", label: "Played" },
  { key: "win", label: "Wins" },
  { key: "draw", label: "Draws" },
  { key: "loss", label: "Losses" },
  { key: "goalsFor", label: "Goals for" },
  { key: "goalsAgainst", label: "Goals against" },
  { key: "points", label: "Points" },
];

export default function AdminLeagueTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClubId, setEditingClubId] = useState<number | null>(null);
  const [form, setForm] = useState<StandingForm>(emptyForm);

  const {
    data: standings = [],
    isLoading,
    isError,
    error,
  } = useQuery<StandingRow[]>({
    queryKey: ["/api/admin/epl/standings"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/admin/epl/standings");
      const result = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Could not load the league table.",
        );
      }
      if (!Array.isArray(result)) throw new Error("Invalid league table response.");
      return result;
    },
  });

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/epl/standings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/epl"] });
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      clubId,
      values,
    }: {
      clubId: number | null;
      values: StandingForm;
    }) => {
      const response = await fetchWithAuth(
        clubId
          ? `/api/admin/epl/standings/${clubId}`
          : "/api/admin/epl/standings",
        {
          method: clubId ? "PATCH" : "POST",
          body: JSON.stringify(values),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not save league row.");
      }
      return result as StandingRow;
    },
    onSuccess: (_row, variables) => {
      refreshQueries();
      toast({
        title: variables.clubId ? "League row updated" : "Club added",
        description: "The public League Table will show the updated standings.",
      });
      closeForm();
    },
    onError: (mutationError) => {
      toast({
        title: "Could not save league row",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please check the values and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (clubId: number) => {
      const response = await fetchWithAuth(
        `/api/admin/epl/standings/${clubId}`,
        { method: "DELETE" },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not remove the league row.");
      }
    },
    onSuccess: () => {
      refreshQueries();
      toast({
        title: "League row removed",
        description: "The club and its match history are still preserved.",
      });
    },
    onError: (mutationError) => {
      toast({
        title: "Could not remove league row",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth("/api/scrape", { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not refresh league data.");
      }
      return result;
    },
    onSuccess: (result) => {
      refreshQueries();
      toast({
        title: "League data refreshed",
        description: `Updated ${result.table?.upserted ?? 0} standings rows and ${result.matches?.upserted ?? 0} matches.`,
      });
    },
    onError: (mutationError) => {
      toast({
        title: "Could not refresh league data",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  function closeForm() {
    setFormOpen(false);
    setEditingClubId(null);
    setForm(emptyForm());
  }

  function startAdd() {
    setEditingClubId(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function startEdit(row: StandingRow) {
    setEditingClubId(row.clubId);
    setForm(toForm(row));
    setFormOpen(true);
  }

  function handleDelete(row: StandingRow) {
    if (
      window.confirm(
        `Remove ${row.name} from the League Table? Its club record and match history will remain.`,
      )
    ) {
      deleteMutation.mutate(row.clubId);
    }
  }

  function handleImport() {
    if (
      window.confirm(
        "Import the latest source data? This may replace manually edited standings and also refreshes match results.",
      )
    ) {
      scrapeMutation.mutate();
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.win + form.draw + form.loss > form.played) {
      toast({
        title: "Check the match totals",
        description: "Wins, draws, and losses cannot exceed matches played.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate({ clubId: editingClubId, values: form });
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
              Competition data
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
              League Table
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit club results and points. Public positions are calculated from
              points and goal difference.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleImport}
              disabled={scrapeMutation.isPending}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${scrapeMutation.isPending ? "animate-spin" : ""}`}
              />
              {scrapeMutation.isPending ? "Refreshing…" : "Refresh from source"}
            </Button>
            {!formOpen && (
              <Button onClick={startAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add club
              </Button>
            )}
          </div>
        </header>

        {formOpen && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingClubId ? "Edit club standings" : "Add club to table"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSave}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="league-club-name">Club name *</Label>
                    <Input
                      id="league-club-name"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="league-club-logo">Club logo URL (optional)</Label>
                    <Input
                      id="league-club-logo"
                      value={form.logo}
                      maxLength={500}
                      placeholder="https://… or /uploads/logo.png"
                      onChange={(event) =>
                        setForm({ ...form, logo: event.target.value })
                      }
                    />
                  </div>
                  {numberFields.map(({ key, label }) => (
                    <div className="space-y-2" key={key}>
                      <Label htmlFor={`league-${key}`}>{label} *</Label>
                      <Input
                        id={`league-${key}`}
                        type="number"
                        min={0}
                        step={1}
                        required
                        value={form[key]}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            [key]: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    disabled={saveMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving…" : "Save standings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Current standings
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {standings.length} clubs
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">
                Loading standings…
              </p>
            ) : isError ? (
              <p className="p-6 text-sm text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Could not load the league table."}
              </p>
            ) : standings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-medium">No standings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add clubs manually or import the latest source data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead className="text-right">P</TableHead>
                      <TableHead className="text-right">W</TableHead>
                      <TableHead className="text-right">D</TableHead>
                      <TableHead className="text-right">L</TableHead>
                      <TableHead className="text-right">GF</TableHead>
                      <TableHead className="text-right">GA</TableHead>
                      <TableHead className="text-right">GD</TableHead>
                      <TableHead className="text-right">Pts</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((row, index) => (
                      <TableRow key={row.clubId}>
                        <TableCell className="font-semibold">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {row.logo ? (
                              <img
                                src={row.logo}
                                alt=""
                                className="h-7 w-7 rounded object-contain"
                              />
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500">
                                {row.name.slice(0, 1)}
                              </span>
                            )}
                            <span className="font-medium">{row.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.played}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.win}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.draw}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.loss}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.goalsFor}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.goalsAgainst}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.goalDiff}</TableCell>
                        <TableCell className="text-right font-bold tabular-nums">{row.points}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(row)}
                              aria-label={`Edit ${row.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(row)}
                              disabled={deleteMutation.isPending}
                              aria-label={`Remove ${row.name} from the table`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
