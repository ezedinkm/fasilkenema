import PublicLayout from '@/components/PublicLayout';
import { useRoute } from 'wouter';
import { NEWS_POSTS } from '@/lib/mockData';
import { Calendar, User, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function BlogPost() {
  const [match, params] = useRoute('/blog/:slug');
  const slug = params?.slug;
  const post = NEWS_POSTS.find(p => p.slug === slug) || NEWS_POSTS[0];

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
              <Button variant="link" className="text-white pl-0 mb-4 hover:text-primary uppercase font-bold tracking-wider">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-white/80 mb-4 text-sm font-medium uppercase tracking-widest">
              <span className="bg-primary px-2 py-1 text-white">{post.category}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
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
            <p className="lead text-xl font-medium text-foreground/80 mb-8">
              {post.excerpt}
            </p>
            
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            
            <h3>A Dominant Performance</h3>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            
            <blockquote>
              "We played with the heart of The Browns today. The fans were incredible." — Head Coach
            </blockquote>
            
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            
            <img src={post.image} alt="Match action" className="w-full rounded-lg my-8 shadow-lg" />
            
            <h3>Looking Ahead</h3>
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
            </p>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}
