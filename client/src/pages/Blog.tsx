import PublicLayout from '@/components/PublicLayout';
import NewsCard from '@/components/NewsCard';
import { NEWS_POSTS } from '@/lib/mockData';
import { Trophy, Newspaper, Users, Calendar } from 'lucide-react';

export default function Blog() {
  const categories = [
    { icon: Trophy, label: 'ዋንጫ | Trophies', count: 1 },
    { icon: Newspaper, label: 'ግጥሚያ | Matches', count: 2 },
    { icon: Users, label: 'ማህበረሰብ | Community', count: 1 },
    { icon: Calendar, label: 'ክለብ | Club', count: 2 },
  ];

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-primary via-amber-800 to-amber-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white/20 rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-amber-400/30 rotate-45" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-12 bg-amber-400 rounded-full" />
            <span className="text-amber-400 font-bold uppercase tracking-widest text-sm">ዜና | News</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
            የቡናማዎቹ ዜና
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Browns News - Latest updates from Ethiopian Bunna FC, match reports, transfer news, and community events.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <cat.icon className="h-4 w-4 text-amber-400" />
                <span className="text-white text-sm font-medium">{cat.label}</span>
                <span className="text-amber-400 text-xs font-bold">({cat.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NEWS_POSTS.map(post => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-8 text-center">
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            ከቡናማዎቹ ጋር ይቀላቀሉ | Join The Browns Family
          </h3>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Become a member and get exclusive access to news, match tickets, and community events.
          </p>
          <a 
            href="/membership" 
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            data-testid="link-join-membership"
          >
            Become a Member
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
