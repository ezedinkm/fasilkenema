import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  Pencil,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type { Player } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  NATIONALITY_OPTIONS,
  createTeamPlayer,
  deleteTeamPlayer,
  listTeamPlayers,
  updateTeamPlayer,
  type TeamPlayerPayload,
} from "@/lib/teamAdminApi";

type TeamManagerProps = {
  title: string;
  subtitle?: string;
  positions: string[];
  storageKey: string;
  defaultNationality?: string;
};

type PlayerDraft = Omit<Player, "id">;

const DEFAULT_NATIONALITY = "Ethiopia";
const COACHING_STAFF_TITLES = [
  "HEAD COACH",
  "ASSISTANT COACH",
  "TEAM LEADER",
  "PHYSICAL FITNESS TRAINER",
  "PHYSIOTHERAPY",
  "GOALKEEPER COACH",
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function isNonEmpty(value: string) {
  return value.trim().length > 0;
}

const teamPlayersQueryKey = (teamKey: string) =>
  ["team-admin-players", teamKey] as const;

export default function TeamManager({
  title,
  subtitle,
  positions,
  storageKey,
  defaultNationality = DEFAULT_NATIONALITY,
}: TeamManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: teamPlayersQueryKey(storageKey),
    queryFn: () => listTeamPlayers(storageKey),
  });

  // Create form
  const [name, setName] = useState("");
  const [position, setPosition] = useState<string>("");
  const [nationality, setNationality] = useState(defaultNationality);
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editDraft, setEditDraft] = useState<PlayerDraft>({
    name: "",
    position: "",
    nationality: defaultNationality,
    image: "",
  });
  const [editError, setEditError] = useState<string>("");

  const normalizedPositions = useMemo(
    () => positions.map((p) => p.trim()).filter(Boolean),
    [positions],
  );

  const nationalityChoices = useMemo(() => {
    const set = new Set<string>(NATIONALITY_OPTIONS);
    [defaultNationality, nationality, editDraft.nationality].forEach((v) => {
      if (v?.trim()) set.add(v.trim());
    });
    const list = Array.from(set);
    return list.sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    );
  }, [defaultNationality, nationality, editDraft.nationality]);

  useEffect(() => {
    setNationality((prev) => {
      if (prev && NATIONALITY_OPTIONS.includes(prev)) return prev;
      if (
        defaultNationality &&
        NATIONALITY_OPTIONS.includes(defaultNationality)
      )
        return defaultNationality;
      return NATIONALITY_OPTIONS[0] ?? DEFAULT_NATIONALITY;
    });
  }, [defaultNationality]);

  const createMutation = useMutation({
    mutationFn: (payload: TeamPlayerPayload) =>
      createTeamPlayer(storageKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamPlayersQueryKey(storageKey),
      });
      resetCreateForm();
      toast({
        title: "Member added",
        description: "The team roster was updated.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not add member",
        description: err.message || "Request failed.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TeamPlayerPayload }) =>
      updateTeamPlayer(storageKey, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamPlayersQueryKey(storageKey),
      });
      setEditOpen(false);
      setEditingPlayer(null);
      toast({ title: "Changes saved", description: "Team member updated." });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not save changes",
        description: err.message || "Request failed.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeamPlayer(storageKey, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamPlayersQueryKey(storageKey),
      });
      toast({ title: "Removed", description: "Team member deleted." });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete",
        description: err.message || "Request failed.",
        variant: "destructive",
      });
    },
  });

  const resetCreateForm = () => {
    setName("");
    setPosition("");
    setNationality(
      defaultNationality && NATIONALITY_OPTIONS.includes(defaultNationality)
        ? defaultNationality
        : (NATIONALITY_OPTIONS[0] ?? DEFAULT_NATIONALITY),
    );
    setImageDataUrl("");
    setFormError("");
  };

  const validateDraft = (draft: {
    name: string;
    position: string;
    nationality: string;
    image: string;
  }) => {
    if (!isNonEmpty(draft.name)) return "Name is required.";
    if (!isNonEmpty(draft.position)) return "Position is required.";
    if (!isNonEmpty(draft.nationality)) return "Nationality is required.";
    if (!isNonEmpty(draft.image)) return "Player image is required.";
    return "";
  };

  const handleCreate = () => {
    const error = validateDraft({
      name,
      position,
      nationality,
      image: imageDataUrl,
    });
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    createMutation.mutate({
      name: name.trim(),
      position: position.trim(),
      nationality: nationality.trim(),
      image: imageDataUrl,
    });
  };

  const openEdit = (p: Player) => {
    setEditingPlayer(p);
    setEditDraft({
      name: p.name,
      position: p.position,
      nationality: p.nationality,
      image: p.image,
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingPlayer) return;
    const error = validateDraft(editDraft);
    if (error) {
      setEditError(error);
      return;
    }
    setEditError("");
    updateMutation.mutate({
      id: editingPlayer.id,
      payload: {
        name: editDraft.name.trim(),
        position: editDraft.position.trim(),
        nationality: editDraft.nationality.trim(),
        image: editDraft.image,
      },
    });
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("Delete this team member?");
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-heading font-bold text-zinc-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Add or edit team members for the {title} team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`${storageKey}-name`}>Name</Label>
              <Input
                id={`${storageKey}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Player full name"
              />
            </div>

            <div className="grid gap-2">
              <Label>Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Team positions</SelectLabel>
                    {normalizedPositions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                    {!normalizedPositions.some((p) => p.toLowerCase() === "player") && (
                      <SelectItem value="PLAYER">PLAYER</SelectItem>
                    )}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Coaching staff</SelectLabel>
                    {COACHING_STAFF_TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Nationality</Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger id={`${storageKey}-nationality`}>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="max-h-[65vh] overflow-y-auto"
                >
                  {nationalityChoices.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 cursor-pointer">
                  <Upload className="h-4 w-4 text-zinc-700" />
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await readFileAsDataUrl(file);
                        setImageDataUrl(url);
                        setFormError("");
                      } catch {
                        setFormError(
                          "Could not read image. Try a different file.",
                        );
                      }
                    }}
                  />
                </label>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <ImageIcon className="h-4 w-4" />
                  {imageDataUrl ? "Preview ready" : "No image selected"}
                </div>
              </div>
            </div>
          </div>

          {imageDataUrl && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center gap-4">
                <img
                  src={imageDataUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg object-cover border border-zinc-200 bg-white"
                />
                <div className="text-sm text-zinc-600">
                  <p className="font-medium text-zinc-900">Image Preview</p>
                  <p className="text-xs text-zinc-500">
                    Sent to the server as part of the player record.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formError && (
            <div className="text-sm text-red-600 font-medium">{formError}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button variant="outline" onClick={resetCreateForm} disabled={busy}>
              Clear
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreate}
              disabled={busy}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-heading font-bold text-zinc-900">
          Team Members
        </h3>
        <p className="text-sm text-muted-foreground">{players.length} total</p>
      </div>

      {playersLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-600">
            No team members yet. Add your first player using the form above.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-zinc-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-sm text-zinc-600">{p.position}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600">
                  <span className="font-medium text-zinc-800">
                    Nationality:
                  </span>{" "}
                  {p.nationality}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(p)}
                    disabled={busy}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(p.id)}
                    disabled={busy}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingPlayer(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={editDraft.name}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, name: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Position</Label>
              <Select
                value={editDraft.position}
                onValueChange={(v) =>
                  setEditDraft((d) => ({ ...d, position: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Team positions</SelectLabel>
                    {normalizedPositions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                    {!normalizedPositions.some((pos) => pos.toLowerCase() === "player") && (
                      <SelectItem value="PLAYER">PLAYER</SelectItem>
                    )}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Coaching staff</SelectLabel>
                    {COACHING_STAFF_TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Nationality</Label>
              <Select
                value={editDraft.nationality}
                onValueChange={(v) =>
                  setEditDraft((d) => ({ ...d, nationality: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="max-h-[65vh] overflow-y-auto"
                >
                  {nationalityChoices.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 cursor-pointer">
                  <Upload className="h-4 w-4 text-zinc-700" />
                  Replace image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await readFileAsDataUrl(file);
                        setEditDraft((d) => ({ ...d, image: url }));
                        setEditError("");
                      } catch {
                        setEditError(
                          "Could not read image. Try a different file.",
                        );
                      }
                    }}
                  />
                </label>
                <span className="text-xs text-zinc-500">
                  {editDraft.image ? "Preview ready" : "No image selected"}
                </span>
              </div>

              {editDraft.image && (
                <img
                  src={editDraft.image}
                  alt="Edit preview"
                  className="mt-3 h-24 w-24 rounded-lg object-cover border border-zinc-200"
                />
              )}
            </div>

            {editError && (
              <div className="text-sm text-red-600 font-medium">
                {editError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleEditSave}
              disabled={busy}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
