import PublicLayout from "@/components/PublicLayout";
import { useRoute } from "wouter";
import { Calendar, User, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getPosts } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  getBlogContentText,
  parseBlogContentSections,
} from "@shared/blogContent";

type NormalizedNewsPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
};

function normalizeApiPost(raw: any): NormalizedNewsPost {
  const id = Number(raw?.id);
  const slug = String(raw?.slug ?? "");
  const title = String(raw?.titleEn ?? raw?.title ?? "");
  const content = String(raw?.contentEn ?? raw?.content ?? raw?.excerpt ?? "");
  const plainContent = getBlogContentText(content);
  const image = String(raw?.imageUrl ?? raw?.image ?? "");
  const category = String(raw?.category ?? "");

  const blocks = plainContent
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const firstBlock = blocks[0] ?? content;
  const excerpt =
    firstBlock.length > 240 ? `${firstBlock.slice(0, 240)}…` : firstBlock;

  const published =
    raw?.publishedAt ?? raw?.published_at ?? raw?.createdAt ?? raw?.created_at;
  const dateStr =
    published == null
      ? ""
      : typeof published === "string"
        ? published.slice(0, 10)
        : new Date(published).toISOString().slice(0, 10);

  return { id, slug, title, excerpt, content, date: dateStr, image, category };
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const [post, setPost] = useState<NormalizedNewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    setLoading(true);
    setPost(null);

    void (async () => {
      try {
        const apiPosts = await getPosts();
        if (cancelled) return;

        const normalized = (Array.isArray(apiPosts) ? apiPosts : [])
          .map(normalizeApiPost)
          .filter((p) => p.id && p.slug && p.title);

        const found = normalized.find((p) => p.slug === slug) || null;
        setPost(found);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setPost(null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-4xl mx-auto">
          <p className="text-muted-foreground">Loading post...</p>
          <div className="mt-6">
            <Link href="/blog">
              <Button variant="outline">Back to News</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 max-w-4xl mx-auto">
          <p className="text-muted-foreground">Post not found.</p>
          <div className="mt-6">
            <Link href="/blog">
              <Button variant="outline">Back to News</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const contentSections = parseBlogContentSections(post.content);

  return (
    <PublicLayout>
      <div className="bg-background">
        {/* Hero Header */}
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 container px-4 flex flex-col justify-end pb-12">
            <Link href="/blog">
              <Button
                variant="link"
                className="text-white pl-0 mb-4 hover:text-primary uppercase font-bold tracking-wider"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-white/80 mb-4 text-sm font-medium uppercase tracking-widest">
              <span className="bg-primary px-2 py-1 text-white">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {post.date}
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white max-w-4xl leading-tight">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="container px-4 py-12 max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <p className="font-bold text-sm uppercase">By Club Media</p>
                <p className="text-xs text-muted-foreground">Official Source</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-primary">
            {contentSections.map((section, sectionIndex) => (
              <section
                key={sectionIndex}
                className="mb-10 border-b border-border/60 pb-8 last:border-0"
              >
                {section.heading && (
                  <h2 className="mb-4 text-2xl font-bold">
                    {section.heading}
                  </h2>
                )}
                {section.text
                  .split(/\n+/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, paragraphIndex) => (
                    <p key={`${sectionIndex}-text-${paragraphIndex}`}>
                      {paragraph}
                    </p>
                  ))}
                {section.images.length > 0 && (
                  <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {section.images.map((image, imageIndex) => (
                      <figure
                        key={`${sectionIndex}-image-${imageIndex}`}
                        className="overflow-hidden rounded-xl bg-zinc-100"
                      >
                        <img
                          src={image}
                          alt={`${post.title}, section ${sectionIndex + 1}, image ${imageIndex + 1}`}
                          loading="lazy"
                          className="max-h-[640px] w-full object-contain"
                        />
                      </figure>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}
