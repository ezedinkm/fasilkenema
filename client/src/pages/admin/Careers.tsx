import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

type CareerStatus = "draft" | "published" | "closed";

interface CareerJob {
  id: number;
  title: string;
  department: string | null;
  location: string;
  employmentType: string;
  summary: string | null;
  description: string;
  requirements: string | null;
  applicationEmail: string | null;
  applicationUrl: string | null;
  closingDate: string | null;
  status: CareerStatus;
  createdAt: string;
  updatedAt: string;
}

interface CareerJobForm {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  summary: string;
  description: string;
  requirements: string;
  applicationEmail: string;
  applicationUrl: string;
  closingDate: string;
  status: CareerStatus;
}

const emptyForm = (): CareerJobForm => ({
  title: "",
  department: "",
  location: "Gondar, Ethiopia",
  employmentType: "Full-time",
  summary: "",
  description: "",
  requirements: "",
  applicationEmail: "",
  applicationUrl: "",
  closingDate: "",
  status: "draft",
});

function toForm(job: CareerJob): CareerJobForm {
  return {
    title: job.title,
    department: job.department ?? "",
    location: job.location,
    employmentType: job.employmentType,
    summary: job.summary ?? "",
    description: job.description,
    requirements: job.requirements ?? "",
    applicationEmail: job.applicationEmail ?? "",
    applicationUrl: job.applicationUrl ?? "",
    closingDate: job.closingDate ?? "",
    status: job.status,
  };
}

function statusStyle(status: CareerStatus) {
  if (status === "published") return "bg-green-100 text-green-800";
  if (status === "closed") return "bg-zinc-200 text-zinc-700";
  return "bg-amber-100 text-amber-800";
}

export default function AdminCareers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<CareerJobForm>(emptyForm);

  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
  } = useQuery<CareerJob[]>({
    queryKey: ["/api/admin/careers"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/admin/careers");
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Failed to load career openings.");
      }
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number | null;
      values: CareerJobForm;
    }) => {
      const payload = {
        ...values,
        department: values.department.trim() || null,
        summary: values.summary.trim() || null,
        requirements: values.requirements.trim() || null,
        applicationEmail: values.applicationEmail.trim() || null,
        applicationUrl: values.applicationUrl.trim() || null,
        closingDate: values.closingDate || null,
      };
      const response = await fetchWithAuth(
        id ? `/api/admin/careers/${id}` : "/api/admin/careers",
        {
          method: id ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to save career opening.");
      }
      return result as CareerJob;
    },
    onSuccess: (_job, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      toast({
        title: variables.id ? "Opening updated" : "Opening created",
        description: "Career listing saved successfully.",
      });
      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    },
    onError: (mutationError) => {
      toast({
        title: "Could not save opening",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`/api/admin/careers/${id}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete career opening.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      toast({ title: "Opening deleted" });
    },
    onError: (mutationError) => {
      toast({
        title: "Could not delete opening",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
  };

  const startEdit = (job: CareerJob) => {
    setEditingId(job.id);
    setForm(toForm(job));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleDelete = (job: CareerJob) => {
    if (
      window.confirm(
        `Delete "${job.title}"? This will permanently remove the listing.`,
      )
    ) {
      deleteMutation.mutate(job.id);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Careers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create openings and choose which roles appear on the public page.
            </p>
          </div>
          {!editorOpen && (
            <Button onClick={startCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add opening
            </Button>
          )}
        </header>

        {editorOpen && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit opening" : "Add a career opening"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveMutation.mutate({ id: editingId, values: form });
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="career-title">Job title *</Label>
                    <Input
                      id="career-title"
                      required
                      maxLength={160}
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-department">Department / team</Label>
                    <Input
                      id="career-department"
                      value={form.department}
                      onChange={(event) =>
                        setForm({ ...form, department: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-location">Location *</Label>
                    <Input
                      id="career-location"
                      required
                      value={form.location}
                      onChange={(event) =>
                        setForm({ ...form, location: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-type">Employment type *</Label>
                    <Input
                      id="career-type"
                      required
                      value={form.employmentType}
                      onChange={(event) =>
                        setForm({ ...form, employmentType: event.target.value })
                      }
                      placeholder="Full-time, part-time, contract…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-closing-date">Closing date</Label>
                    <Input
                      id="career-closing-date"
                      type="date"
                      value={form.closingDate}
                      onChange={(event) =>
                        setForm({ ...form, closingDate: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="career-summary">Short summary</Label>
                    <Textarea
                      id="career-summary"
                      maxLength={300}
                      rows={2}
                      value={form.summary}
                      onChange={(event) =>
                        setForm({ ...form, summary: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="career-description">Job description *</Label>
                    <Textarea
                      id="career-description"
                      required
                      rows={6}
                      value={form.description}
                      onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="career-requirements">Requirements</Label>
                    <Textarea
                      id="career-requirements"
                      rows={4}
                      value={form.requirements}
                      onChange={(event) =>
                        setForm({ ...form, requirements: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-email">Application email</Label>
                    <Input
                      id="career-email"
                      type="email"
                      value={form.applicationEmail}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          applicationEmail: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-url">Application link</Label>
                    <Input
                      id="career-url"
                      type="url"
                      placeholder="https://"
                      value={form.applicationUrl}
                      onChange={(event) =>
                        setForm({ ...form, applicationUrl: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-status">Listing status</Label>
                    <select
                      id="career-status"
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status: event.target.value as CareerStatus,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="draft">Draft — hidden from public</option>
                      <option value="published">Published — visible publicly</option>
                      <option value="closed">Closed — no longer accepting applications</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditor}
                    disabled={saveMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving…" : "Save opening"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading career openings…
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load career openings."}
            </CardContent>
          </Card>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No career openings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a role and publish it when it is ready.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-zinc-900">
                        {job.title}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[job.department, job.location, job.employmentType]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {job.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                        {job.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(job)}
                      aria-label={`Edit ${job.title}`}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(job)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Delete ${job.title}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
