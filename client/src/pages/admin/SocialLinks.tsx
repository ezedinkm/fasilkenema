import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Share2, Trash2 } from "lucide-react";
import type { SocialIconName, SocialLink } from "@shared/socialLinks";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import {
  createSocialLinkId,
  getSocialIcon,
  getSocialLinksFromSettings,
  SOCIAL_ICON_OPTIONS,
  type SocialSetting,
} from "@/lib/socialLinks";

interface SocialLinkDraft {
  name: string;
  url: string;
  icon: SocialIconName;
}

const emptyDraft = (): SocialLinkDraft => ({
  name: "",
  url: "",
  icon: "website",
});

export default function AdminSocialLinks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SocialLinkDraft>(emptyDraft);

  const {
    data: settings = [],
    isLoading,
    isError,
    error,
  } = useQuery<SocialSetting[]>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/settings");
      const result = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Failed to load social links.",
        );
      }
      if (!Array.isArray(result)) throw new Error("Invalid settings response.");
      return result;
    },
  });

  const links = getSocialLinksFromSettings(settings);

  const saveMutation = useMutation({
    mutationFn: async (nextLinks: SocialLink[]) => {
      const response = await fetchWithAuth("/api/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "social.links",
          value: nextLinks,
          description: "Social links shown in the footer and contact page",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to save social links.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
      toast({
        title: "Social links saved",
        description: "The footer and Contact page now use the updated links.",
      });
      setFormOpen(false);
      setEditingId(null);
      setDraft(emptyDraft());
    },
    onError: (mutationError) => {
      toast({
        title: "Could not save social links",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const openAddForm = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setFormOpen(true);
  };

  const openEditForm = (link: SocialLink) => {
    setEditingId(link.id);
    setDraft({ name: link.name, url: link.url, icon: link.icon });
    setFormOpen(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUrl = draft.url.trim();
    try {
      const parsedUrl = new URL(normalizedUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error("Use a web address starting with http:// or https://.");
      }
    } catch {
      toast({
        title: "Invalid social link",
        description: "Enter a valid web address beginning with http:// or https://.",
        variant: "destructive",
      });
      return;
    }

    const nextLink: SocialLink = {
      id: editingId ?? createSocialLinkId(),
      name: draft.name.trim(),
      url: normalizedUrl,
      icon: draft.icon,
    };
    const nextLinks = editingId
      ? links.map((link) => (link.id === editingId ? nextLink : link))
      : [...links, nextLink];
    saveMutation.mutate(nextLinks);
  };

  const handleDelete = (link: SocialLink) => {
    if (!window.confirm(`Delete the ${link.name} link?`)) return;
    saveMutation.mutate(links.filter((item) => item.id !== link.id));
  };

  const cancelForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setDraft(emptyDraft());
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
              Site appearance
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
              Social links
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the links and icons shown in the footer and on Contact Us.
            </p>
          </div>
          {!formOpen && (
            <Button onClick={openAddForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add social link
            </Button>
          )}
        </header>

        {formOpen && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit social link" : "Add social link"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={handleSave}
                aria-label="Social link form"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="social-name">Platform name</Label>
                    <Input
                      id="social-name"
                      required
                      maxLength={60}
                      value={draft.name}
                      placeholder="e.g. TikTok"
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social-icon">Icon</Label>
                    <select
                      id="social-icon"
                      value={draft.icon}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          icon: event.target.value as SocialIconName,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {SOCIAL_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="social-url">Profile URL</Label>
                    <Input
                      id="social-url"
                      type="url"
                      required
                      placeholder="https://"
                      value={draft.url}
                      onChange={(event) =>
                        setDraft({ ...draft, url: event.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelForm}
                    disabled={saveMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving…" : "Save link"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading social links…
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load social links."}
            </CardContent>
          </Card>
        ) : links.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Share2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No social links added</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a profile to show it on the footer and Contact page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const Icon = getSocialIcon(link.icon);
              return (
                <Card key={link.id}>
                  <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900">
                          {link.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {link.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(link)}
                        aria-label={`Edit ${link.name}`}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link)}
                        disabled={saveMutation.isPending}
                        aria-label={`Delete ${link.name}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
