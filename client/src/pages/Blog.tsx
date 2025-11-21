import PublicLayout from '@/components/PublicLayout';
import NewsCard from '@/components/NewsCard';
import { NEWS_POSTS } from '@/lib/mockData';

export default function Blog() {
  return (
    <PublicLayout>
      <div className="bg-zinc-100 py-12">
        <div className="container px-4">
          <h1 className="font-heading text-5xl font-bold text-primary mb-2">Club News</h1>
          <p className="text-xl text-muted-foreground">Latest updates from the team, matches, and club announcements.</p>
        </div>
      </div>

      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NEWS_POSTS.map(post => (
            <NewsCard key={post.id} post={post} />
          ))}
          {/* Duplicate for grid effect */}
          {NEWS_POSTS.map(post => (
            <NewsCard key={`dup-${post.id}`} post={{...post, id: post.id + 10, title: post.title + ' (Archive)'}} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
