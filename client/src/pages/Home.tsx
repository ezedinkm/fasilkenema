import PublicLayout from '@/components/PublicLayout';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import { NEWS_POSTS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Users, Heart, Award } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/settings'],
    staleTime: Infinity,
  });

  const homeContent = {
    newsTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.newsTitle')?.value : null) || 'Latest From The Horsemen',
    newsSubtitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.newsSubtitle')?.value : null) || 'Stay updated with match reports, club announcements, and exclusive interviews.',
    stat1Value: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.stat1Value')?.value : null) || '16',
    stat1Label: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.stat1Label')?.value : null) || 'Premier League Titles',
    stat2Value: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.stat2Value')?.value : null) || '8',
    stat2Label: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.stat2Label')?.value : null) || 'Ethiopian Cup Victories',
    stat3Value: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.stat3Value')?.value : null) || '1935',
    stat3Label: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.stat3Label')?.value : null) || 'Club Founded',
    ctaTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.ctaTitle')?.value : null) || 'Become A Horseman',
    ctaSubtitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'home.ctaSubtitle')?.value : null) || "Join the official fan club today. Get exclusive access, voting rights, and digital membership cards. Your support builds our future.",
  };

  return (
    <PublicLayout>
        <Hero />
        
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-2">{homeContent.newsTitle}</h2>
                <p className="text-muted-foreground text-lg max-w-2xl">{homeContent.newsSubtitle}</p>
              </div>
              <Link href="/blog">
                <Button variant="ghost" className="hidden md:flex gap-2 uppercase font-bold tracking-wide hover:text-primary hover:bg-primary/10">
                  View All News <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {NEWS_POSTS.map(post => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link href="/blog">
                <Button variant="outline" className="w-full uppercase font-bold">
                  View All News
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Trophy className="h-12 w-12 mb-4 text-secondary" />
                <span className="text-5xl font-heading font-bold mb-2">{homeContent.stat1Value}</span>
                <span className="text-sm uppercase tracking-widest opacity-80">{homeContent.stat1Label}</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Users className="h-12 w-12 mb-4 text-secondary" />
                <span className="text-5xl font-heading font-bold mb-2">{homeContent.stat2Value}</span>
                <span className="text-sm uppercase tracking-widest opacity-80">{homeContent.stat2Label}</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Award className="h-12 w-12 mb-4 text-secondary" />
                <span className="text-5xl font-heading font-bold mb-2">{homeContent.stat3Value}</span>
                <span className="text-sm uppercase tracking-widest opacity-80">{homeContent.stat3Label}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-zinc-900 text-white relative overflow-hidden">
          <div className="container px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-none">
                {homeContent.ctaTitle.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{homeContent.ctaTitle.split(' ').slice(-1)}</span>
              </h2>
              <p className="text-xl text-zinc-300 mb-8 font-light">
                {homeContent.ctaSubtitle}
              </p>
              <div className="flex gap-4">
                <Link href="/membership">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-display uppercase tracking-wider h-14 px-8 text-lg">
                    Join Now
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-display uppercase tracking-wider h-14 px-8 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-primary to-amber-900 rounded-full opacity-20 blur-3xl absolute right-0 top-0 md:relative md:opacity-100 md:blur-xl md:rounded-none md:bg-transparent">
            </div>
          </div>
        </section>
    </PublicLayout>
  );
}
