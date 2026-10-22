import PublicLayout from "@/components/PublicLayout";
import NewsCard from "@/components/NewsCard";
import { Trophy, Newspaper, Users, Calendar } from "lucide-react";
import { getPosts } from "@/lib/api";
import { getBlogContentText } from "@shared/blogContent";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type NormalizedNewsPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
};

function normalizeApiPost(raw: any): NormalizedNewsPost {
  const id = Number(raw?.id);
  const slug = String(raw?.slug ?? "");
  const title = String(raw?.titleEn ?? raw?.title ?? "");
  const excerpt = getBlogContentText(raw?.contentEn ?? raw?.excerpt ?? "");
  const image = String(raw?.imageUrl ?? raw?.image ?? "");
  const category = String(raw?.category ?? "");

  const published = raw?.publishedAt ?? raw?.published_at ?? raw?.createdAt ?? raw?.created_at;
  const dateStr =
    published == null
      ? ""
      : typeof published === "string"
        ? published.slice(0, 10)
        : new Date(published).toISOString().slice(0, 10);

  // Keep excerpt reasonably sized for the card UI.
  const trimmedExcerpt =
    excerpt.length > 260 ? `${excerpt.slice(0, 260)}…` : excerpt;

  return { id, slug, title, excerpt: trimmedExcerpt, date: dateStr, image, category };
}

export default function Blog() {
  
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<NormalizedNewsPost[]>([]);

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
        setLoading(false);
      } catch {
        if (cancelled) return;
        setPosts([]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PublicLayout>
      {loading && (
        <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Loading news…</p>
          </div>
        </div>
      )}

<section>
      <div className="bg-red-600 text-white relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          {/* <div className="container px-4 relative z-10 text-center"> */}
          <div className="container px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-12 bg-amber-400 rounded-full" />
            <span className="text-amber-400 font-bold uppercase tracking-widest text-sm">
              ዜና | News
            </span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
            የፋሲል ከነማ ዜና
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            FASIL S.C News - Latest updates from FASIL S.C, match
            reports, transfer news, and community events.
          </p>

        </div>
          </div>
        {/* </div> */}
      </section>

      <div className="container px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl font-bold text-zinc-900">
            <span className="text-primary">ዜናዎች</span> | Latest News
          </h2>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live from Addis Ababa
          </div>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-16 bg-red-600 text-white relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container px-8 py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                ከፋሲል ከነማ ጋር ይቀላቀሉ | Join the FASIL S.C Family
                </h3>
                <p className="text-white/80 mb-0 max-w-xl">
                  Become a member and get exclusive access to news, match
                  tickets, and community events.
                </p>
              </div>
              <Link
                href="/membership"
                className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-lg transition-colors text-lg"
                data-testid="link-join-membership"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
