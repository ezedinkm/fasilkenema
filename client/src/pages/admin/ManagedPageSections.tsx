import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import {
  getManagedPageConfig,
  MANAGED_PAGES,
  parseManagedPageContent,
  serializeManagedPageContent,
  type ManagedPageDraft,
  type ManagedPageSection,
} from "@/lib/managedPages";
import type { Page } from "@shared/schema";

type EditableSection = ManagedPageSection & { editorId: string };
type EditableDraft = Omit<ManagedPageDraft, "sections"> & {
  title: string;
  sections: EditableSection[];
};

function newSection(section: Partial<ManagedPageSection> = {}): EditableSection {
  return {
    editorId: `managed-section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    heading: section.heading ?? "",
    text: section.text ?? "",
    imageUrl: section.imageUrl ?? "",
    imageAlt: section.imageAlt ?? "",
  };
}

function makeDraft(slug: string, page?: Page): EditableDraft {
  const config = getManagedPageConfig(slug);
  if (!config) {
    return { title: "", intro: "", sections: [] };
  }
  const parsed = parseManagedPageContent(page?.contentEn, {
    intro: config.intro,
    sections: config.sections,
  });
  return {
    title: page?.titleEn || config.title,
    intro: parsed.intro,
    sections: parsed.sections.map((section) => newSection(section)),
  };
}

function isValidImageUrl(value: string) {
  const url = value.trim();
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("..")) {
    return true;
  }
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

export default function ManagedPageSections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlug, setActiveSlug] = useState<"stadium" | "gondar">("stadium");
  const [draft, setDraft] = useState<EditableDraft>(() => makeDraft("stadium"));
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const {
    data: pages = [],
    isLoading,
    isError,
  } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const config = getManagedPageConfig(activeSlug)!;
  const currentPage = pages.find((page) => page.slug === activeSlug);

  useEffect(() => {
    if (!isLoading) setDraft(makeDraft(activeSlug, currentPage));
  }, [activeSlug, currentPage?.id, currentPage?.updatedAt, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const invalidImage = draft.sections.some(
        (section) => !isValidImageUrl(section.imageUrl),
      );
      if (invalidImage) {
        throw new Error("Use an uploaded image or a valid HTTP(S) image URL.");
      }

      const body = {
        slug: activeSlug,
        titleEn: draft.title.trim(),
        contentEn: serializeManagedPageContent({
          intro: draft.intro,
          sections: draft.sections,
        }),
        status: "published",
      };
      const response = await fetchWithAuth(
        currentPage ? `/api/pages/${currentPage.id}` : "/api/pages",
        {
          method: currentPage ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not save this page.");
      }
      return result as Page;
    },
    onSuccess: (page) => {
      queryClient.setQueryData<Page[]>(
        ["/api/pages"],
        (existing = []) => [
          page,
          ...existing.filter((item) => item.slug !== page.slug),
        ],
      );
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/pages/${activeSlug}`],
      });
      toast({
        title: "Page saved",
        description: `${config.title} is now updated on the public site.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Could not save page",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSection = (
    index: number,
    updates: Partial<ManagedPageSection>,
  ) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...updates } : section,
      ),
    }));
  };

  const uploadSelectedImage = async (file?: File) => {
    if (!file || uploadTargetIndex === null) return;
    const index = uploadTargetIndex;
    setUploadingIndex(index);
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      const response = await fetchWithAuth("/api/admin/posts/upload-image", {
        method: "POST",
        body: uploadData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.imageUrl !== "string") {
        throw new Error(result.error || "Image upload failed.");
      }
      updateSection(index, {
        imageUrl: result.imageUrl,
        imageAlt:
          draft.sections[index]?.imageAlt ||
          file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      });
      toast({ title: "Image uploaded", description: "Save the page to publish it." });
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
      setUploadTargetIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Stadium &amp; Gondar pages</CardTitle>
          <CardDescription>
            Edit the public page title, introduction, and each text and image
            section. Changes appear after you save.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Page to edit">
            {MANAGED_PAGES.map((page) => (
              <Button
                key={page.slug}
                type="button"
                variant={activeSlug === page.slug ? "default" : "outline"}
                onClick={() => setActiveSlug(page.slug)}
                role="tab"
                aria-selected={activeSlug === page.slug}
              >
                {page.title}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load the existing page data. Reload before editing so
              your changes do not overwrite current content.
            </p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="managed-page-title">Page title</Label>
                  <Input
                    id="managed-page-title"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    maxLength={160}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managed-page-intro">Short introduction</Label>
                  <Textarea
                    id="managed-page-intro"
                    value={draft.intro}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        intro: event.target.value,
                      }))
                    }
                    rows={3}
                    maxLength={1200}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-zinc-900">Page sections</h3>
                    <p className="text-sm text-muted-foreground">
                      Add text, an image, or both to each section.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        sections: [...current.sections, newSection()],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add section
                  </Button>
                </div>

                {draft.sections.length === 0 && (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    This page has no sections. Add one to start building the page.
                  </div>
                )}

                {draft.sections.map((section, index) => (
                  <Card key={section.editorId} className="border-zinc-200">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                      <div>
                        <CardTitle className="text-base">Section {index + 1}</CardTitle>
                        <CardDescription>
                          Text and image fields are optional.
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete section ${index + 1}`}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            sections: current.sections.filter(
                              (_, sectionIndex) => sectionIndex !== index,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Heading</Label>
                          <Input
                            value={section.heading}
                            onChange={(event) =>
                              updateSection(index, { heading: event.target.value })
                            }
                            maxLength={200}
                            placeholder="Section heading"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Text</Label>
                          <Textarea
                            value={section.text}
                            onChange={(event) =>
                              updateSection(index, { text: event.target.value })
                            }
                            rows={7}
                            maxLength={12000}
                            placeholder="Write the section text"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Section image</Label>
                        {section.imageUrl ? (
                          <div className="relative overflow-hidden rounded-lg border bg-zinc-50">
                            <img
                              src={section.imageUrl}
                              alt={section.imageAlt || ""}
                              className="h-48 w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute right-2 top-2"
                              onClick={() =>
                                updateSection(index, { imageUrl: "", imageAlt: "" })
                              }
                            >
                              Remove image
                            </Button>
                          </div>
                        ) : (
                          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-zinc-50 text-muted-foreground">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setUploadTargetIndex(index);
                              fileInputRef.current?.click();
                            }}
                            disabled={uploadingIndex === index}
                          >
                            {uploadingIndex === index ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload image
                          </Button>
                          {section.imageUrl && (
                            <span className="self-center text-xs text-muted-foreground">
                              Upload replaces the current image.
                            </span>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) =>
                            void uploadSelectedImage(event.target.files?.[0])
                          }
                        />
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input
                            value={section.imageUrl}
                            onChange={(event) =>
                              updateSection(index, {
                                imageUrl: event.target.value,
                              })
                            }
                            placeholder="Upload an image or paste an HTTP(S) URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image description</Label>
                          <Input
                            value={section.imageAlt}
                            onChange={(event) =>
                              updateSection(index, {
                                imageAlt: event.target.value,
                              })
                            }
                            maxLength={300}
                            placeholder="Describe the image for accessibility"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !draft.title.trim()}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save {config.title}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
