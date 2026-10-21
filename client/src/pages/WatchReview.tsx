import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type WatchReview = {
  id: number;
  title: string;
  youtubeUrl: string;
};

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isShortDomain = ["youtu.be", "www.youtu.be"].includes(hostname);
    const isYouTubeDomain = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
    ].includes(hostname);

    if (isShortDomain) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (!isYouTubeDomain) return null;

    let id = parsed.searchParams.get("v");
    if (!id) {
      const [, route, pathId] = parsed.pathname.split("/");
      if (["embed", "shorts", "live", "v"].includes(route)) {
        id = pathId ?? null;
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

export default function WatchReview() {
  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery<WatchReview[]>({
    queryKey: ["/api/watch-reviews"],
    queryFn: async () => {
      const response = await fetch("/api/watch-reviews");
      if (!response.ok) throw new Error("Failed to fetch watch reviews");
      return response.json();
    },
  });

  return (
    <PublicLayout>
      <div className="bg-zinc-50 min-h-screen">
        <div className="bg-red-600 text-white relative overflow-hidden py-16 md:py-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container px-4 relative z-10 text-center">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">
              Watch Reviews
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90">
              Watch match analysis, fan reactions, and club highlights right
              here on our website.
            </p>
          </div>
        </div>

        <div className="container px-4 py-12 md:py-16">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-14">
              Loading videos...
            </div>
          ) : isError ? (
            <div className="text-center text-red-600 py-14">
              Failed to load videos. Please try again.
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-14">
              No videos available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => {
                  const embedUrl = getYouTubeEmbedUrl(review.youtubeUrl);

                  return (
                    <Card
                      key={review.id}
                      className="overflow-hidden border-zinc-200 shadow-sm bg-white"
                      data-testid={`card-watchreview-${review.id}`}
                    >
                      <div className="relative aspect-video bg-zinc-950">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={review.title}
                            className="absolute inset-0 h-full w-full"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/80">
                            This review has an invalid YouTube link.
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <Youtube className="h-4 w-4" />
                          Video review
                        </div>
                        <h3 className="font-semibold text-zinc-900 line-clamp-2">
                          {review.title}
                        </h3>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
