import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { getPosts } from "@/lib/api";

type NormalizedNewsPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  category: string;
  isFeatured?: boolean;
};

type NewsCardProps = {
  post?: NormalizedNewsPost;
  limit?: number;
  featuredOnly?: boolean;
};

function normalizeApiPost(raw: any): NormalizedNewsPost {
  const id = Number(raw?.id);
  const slug = String(raw?.slug ?? "");

  // Drizzle posts table fields are camelCased (e.g. titleEn, imageUrl).
  const title = String(raw?.titleEn ?? raw?.title ?? "");
  const excerpt = String(raw?.contentEn ?? raw?.excerpt ?? "");
  const image = String(raw?.imageUrl ?? raw?.image ?? "");
  const category = String(raw?.category ?? "");
  const isFeatured = Boolean(raw?.isFeatured ?? raw?.is_featured);

  const published =
    raw?.publishedAt ?? raw?.published_at ?? raw?.createdAt ?? raw?.created_at;
  const dateStr =
    published == null
      ? ""
      : typeof published === "string"
        ? published.slice(0, 10)
        : new Date(published).toISOString().slice(0, 10);

  return { id, slug, title, excerpt, image, category, date: dateStr, isFeatured };
}

function NewsCardItem({ post }: { post: NormalizedNewsPost }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Load the image only when the card is close to the viewport.
    if (!("IntersectionObserver" in window)) {
      setShouldLoadImage(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShouldLoadImage(true);
          observer.disconnect();
          break;
        }
      },
      { root: null, rootMargin: "250px 0px", threshold: 0.01 },
    );

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card cursor-pointer">
        {post.image && (
        <div ref={wrapperRef} className="relative h-56 overflow-hidden">
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="bg-red-600 text-white hover:bg-red-700 uppercase font-bold tracking-wider text-xs rounded-sm"
            >
              {post.category}
            </Badge>
          </div>
          <div className="w-full h-full bg-gray-200" />
          {shouldLoadImage && (
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-100 transition-transform duration-500 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-red-600 transition-colors line-clamp-2 uppercase">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.excerpt}
          </p>
        </CardContent>

        <CardFooter className="pt-0 pb-6">
          <div className="text-sm font-bold text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wide">
            Read More <ArrowRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function NewsCard({
  post,
  limit,
  featuredOnly,
}: NewsCardProps) {
  // Card mode (used by Blog pages): render the provided post.
  if (post) return <NewsCardItem post={post} />;

  const [posts, setPosts] = useState<NormalizedNewsPost[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const apiPosts = await getPosts();
        if (cancelled) return;

        const normalized = (Array.isArray(apiPosts) ? apiPosts : [])
          .map(normalizeApiPost)
          .filter((p) => p.id && p.slug && p.title);
        setPosts(normalized);
      } catch {
        if (cancelled) return;
        setPosts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!posts) return null;

  const eligiblePosts = featuredOnly
    ? posts.filter((item) => item.isFeatured)
    : posts;
  const list =
    typeof limit === "number" && limit > 0
      ? eligiblePosts.slice(0, limit)
      : eligiblePosts;

  if (featuredOnly && list.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-dashed border-zinc-300 py-10 text-center text-sm text-muted-foreground">
        No news has been featured on the home page yet.
      </div>
    );
  }
  return (
    <>
      {list.map((p) => (
        <NewsCardItem key={p.id} post={p} />
      ))}
    </>
  );
}
