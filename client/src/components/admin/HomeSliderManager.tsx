import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { homepageSliderSettingSchema, type HomepageSlide } from "@shared/homepageSlider";
import { getHomepageSlidesFromSettings } from "@/lib/homepageSlides";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

type PublicSetting = { key: string; value: unknown };

export default function HomeSliderManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState<HomepageSlide[]>(getHomepageSlidesFromSettings(null));
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: settings = [], isLoading, isError } = useQuery<PublicSetting[]>({
    queryKey: ["/api/public/settings"],
  });

  useEffect(() => {
    setSlides(getHomepageSlidesFromSettings(settings));
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (nextSlides: HomepageSlide[]) => {
      const response = await fetchWithAuth("/api/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "home.slider",
          value: nextSlides,
          description: "Homepage hero slider content and display order",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not save homepage slides.");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
      toast({
        title: "Homepage slider saved",
        description: "The homepage will now use the updated slides.",
      });
    },
    onError: (error) => {
      toast({
        title: "Could not save homepage slider",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSlide = (id: string, updates: Partial<HomepageSlide>) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, ...updates } : slide)),
    );
  };

  const addSlide = () => {
    const nextPriority =
      Math.max(0, ...slides.map((slide) => slide.priority)) + 1;
    setSlides((current) => [
      ...current,
      {
        id: `slide-${crypto.randomUUID()}`,
        title: "",
        description: "",
        imageUrl: "",
        priority: nextPriority,
        durationSeconds: 6,
        enabled: true,
      },
    ]);
  };

  const uploadSlideImage = async (id: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Choose an image",
        description: "Only image files can be uploaded.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Image is too large",
        description: "Choose an image smaller than 10 MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploadingSlideId(id);
    try {
      const response = await fetchWithAuth("/api/admin/posts/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.imageUrl !== "string") {
        throw new Error(result.error || "Image upload failed.");
      }
      updateSlide(id, { imageUrl: result.imageUrl });
      toast({ title: "Slide image uploaded" });
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingSlideId(null);
    }
  };

  const saveSlides = () => {
    const orderedSlides = [...slides].sort((a, b) => a.priority - b.priority);
    const validation = homepageSliderSettingSchema.safeParse(orderedSlides);
    if (!validation.success) {
      toast({
        title: "Check the slide details",
        description: validation.error.issues[0]?.message || "Complete every slide before saving.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(validation.data);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Homepage Slider</CardTitle>
            <CardDescription>
              Manage each slide’s background, title, description, display time, and order.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={addSlide}>
              <Plus className="mr-2 h-4 w-4" />
              Add slide
            </Button>
            <Button type="button" onClick={saveSlides} disabled={saveMutation.isPending || isLoading}>
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save slider
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isError && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Could not load the saved slider settings. The default slides are shown; retry before saving.
        </p>
      )}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        [...slides]
          .sort((a, b) => a.priority - b.priority)
          .map((slide, index) => (
            <Card key={slide.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-800">
                    {index + 1}
                  </span>
                  <div>
                    <CardTitle className="text-base">Slide {index + 1}</CardTitle>
                    <CardDescription>Priority {slide.priority}</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete slide ${index + 1}`}
                  onClick={() => setSlides((current) => current.filter((item) => item.id !== slide.id))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="space-y-3">
                  <div className="aspect-[16/8] overflow-hidden rounded-lg border bg-muted">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title || `Homepage slide ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Choose a background image
                      </div>
                    )}
                  </div>
                  <input
                    ref={(element) => {
                      fileInputRefs.current[slide.id] = element;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void uploadSlideImage(slide.id, event.currentTarget.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRefs.current[slide.id]?.click()}
                    disabled={uploadingSlideId === slide.id}
                  >
                    {uploadingSlideId === slide.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    {slide.imageUrl ? "Replace background image" : "Upload background image"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">Title</label>
                    <Input
                      id={`slide-title-${slide.id}`}
                      value={slide.title}
                      maxLength={160}
                      onChange={(event) => updateSlide(slide.id, { title: event.target.value })}
                      placeholder="Enter a headline"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`slide-description-${slide.id}`} className="text-sm font-medium">Description</label>
                    <Textarea
                      id={`slide-description-${slide.id}`}
                      value={slide.description}
                      maxLength={600}
                      rows={3}
                      onChange={(event) => updateSlide(slide.id, { description: event.target.value })}
                      placeholder="Add supporting text"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor={`slide-priority-${slide.id}`} className="text-sm font-medium">Priority number</label>
                      <Input
                        id={`slide-priority-${slide.id}`}
                        type="number"
                        min={1}
                        max={9999}
                        step={1}
                        value={slide.priority}
                        onChange={(event) => updateSlide(slide.id, { priority: Number(event.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">Smaller numbers appear first.</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`slide-duration-${slide.id}`} className="text-sm font-medium">Display time (seconds)</label>
                      <Input
                        id={`slide-duration-${slide.id}`}
                        type="number"
                        min={1}
                        max={120}
                        step={1}
                        value={slide.durationSeconds}
                        onChange={(event) => updateSlide(slide.id, { durationSeconds: Number(event.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">How long this slide stays visible.</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={slide.enabled}
                      onCheckedChange={(checked) => updateSlide(slide.id, { enabled: checked === true })}
                    />
                    Show this slide on the homepage
                  </label>
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}
