import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2, PlayCircle } from "lucide-react";
import { useState } from "react";

type WatchReview = {
  id: number;
  title: string;
  youtubeUrl: string;
  createdAt: string;
};

export default function AdminWatchReview() {
  const { token } = useApp();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: reviews = [],
    refetch,
    isLoading,
  } = useQuery<WatchReview[]>({
    queryKey: ["/api/admin/watch-reviews"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch("/api/admin/watch-reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch watch reviews");
      return response.json();
    },
  });

  const handleAdd = async () => {
    if (!title.trim() || !youtubeUrl.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please add title and YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/watch-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          youtubeUrl: youtubeUrl.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Failed to add watch review");

      setTitle("");
      setYoutubeUrl("");
      await refetch();
      toast({
        title: "Added",
        description: "Watch review added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add watch review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/watch-reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Failed to delete watch review");
      await refetch();
      toast({ title: "Deleted", description: "Watch review removed." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete watch review",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
            Watch Reviews
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage YouTube review videos shown on the public media page.
          </p>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              Add New Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-watchreview-title"
              />
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                data-testid="input-watchreview-url"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAdd}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Adding..." : "Add Review"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading watch reviews...
              </CardContent>
            </Card>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No watch reviews yet.
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card
                key={review.id}
                className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <PlayCircle className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        Review Video
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900">
                      {review.title}
                    </h3>
                    <a
                      href={review.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                    >
                      {review.youtubeUrl}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    data-testid={`button-delete-watchreview-${review.id}`}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === review.id ? "Deleting..." : "Delete"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
