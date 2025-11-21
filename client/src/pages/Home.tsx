import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import { NEWS_POSTS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Users, Heart } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        
        {/* Latest News Section */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-2">Latest From The Castle</h2>
                <p className="text-muted-foreground text-lg max-w-2xl">Stay updated with match reports, club announcements, and exclusive interviews.</p>
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

        {/* Stats/Achievements Banner */}
        <section className="py-16 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Trophy className="h-12 w-12 mb-4 text-secondary" />
                <span className="text-5xl font-heading font-bold mb-2">2021</span>
                <span className="text-sm uppercase tracking-widest opacity-80">Premier League Champions</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Users className="h-12 w-12 mb-4 text-secondary" />
                <span className="text-5xl font-heading font-bold mb-2">500k+</span>
                <span className="text-sm uppercase tracking-widest opacity-80">Active Supporters</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Heart className="h-12 w-12 mb-4 text-secondary" />
                <span className="text-5xl font-heading font-bold mb-2">1968</span>
                <span className="text-sm uppercase tracking-widest opacity-80">Club Founded</span>
              </div>
            </div>
          </div>
        </section>

        {/* Membership CTA */}
        <section className="py-24 bg-zinc-900 text-white relative overflow-hidden">
          <div className="container px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-none">
                Become An <span className="text-primary">Emperor</span>
              </h2>
              <p className="text-xl text-zinc-300 mb-8 font-light">
                Join the official fan club today. Get exclusive access, voting rights, and digital membership cards. Your support builds our future.
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
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-primary to-red-900 rounded-full opacity-20 blur-3xl absolute right-0 top-0 md:relative md:opacity-100 md:blur-xl md:rounded-none md:bg-transparent">
               {/* Abstract visuals or 3d card mockups would go here */}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
