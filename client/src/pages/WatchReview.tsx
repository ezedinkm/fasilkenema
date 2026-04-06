import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type WatchReview = {
  id: number;
  title: string;
  youtubeUrl: string;
};

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeVideoId(url);
  if (!id) return "https://i.ytimg.com/vi/default/hqdefault.jpg";
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
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
              Match analysis, fan reactions, and club highlights from our latest
              YouTube reviews.
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
              {reviews.map((review) => (
                <a
                  key={review.id}
                  href={review.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                  data-testid={`card-watchreview-${review.id}`}
                >
                  <Card className="overflow-hidden border-zinc-200 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 bg-white">
                    <div className="relative">
                      <img
                        src={getYouTubeThumbnail(review.youtubeUrl)}
                        alt={review.title}
                        className="w-full aspect-video object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-red-600/95 flex items-center justify-center shadow-lg">
                          <PlayCircle className="h-8 w-8 text-white fill-white/20" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <Youtube className="h-3.5 w-3.5 text-red-500" />
                        YouTube
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-zinc-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {review.title}
                      </h3>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
