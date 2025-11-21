import { Link } from 'wouter';
import { ASSETS } from '@/lib/mockData';
import { Facebook, Twitter, Instagram, Youtube, Smartphone } from 'lucide-react';
import appStoreBadge from '@assets/generated_images/app_store_badge.png';
import playStoreBadge from '@assets/generated_images/google_play_badge.png';

export default function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-border">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src={ASSETS.logo} alt="Fasil Kenema" className="h-12 w-12" />
              <span className="font-heading text-2xl text-primary">FASIL KENEMA</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              The official home of The Emperors. Connecting fans, players, and history since 1968.
            </p>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
            
            {/* App Download Section */}
            <div className="pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3 text-primary font-bold text-sm uppercase tracking-wide">
                <Smartphone className="h-4 w-4" />
                <span>Get The App</span>
              </div>
              <div className="flex gap-2">
                <a href="#" className="block transition-opacity hover:opacity-80">
                  <img src={appStoreBadge} alt="Download on the App Store" className="h-8 w-auto" />
                </a>
                <a href="#" className="block transition-opacity hover:opacity-80">
                  <img src={playStoreBadge} alt="Get it on Google Play" className="h-8 w-auto" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">History</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Latest News</Link></li>
              <li><Link href="/membership" className="hover:text-primary transition-colors">Membership</Link></li>
              <li><Link href="/donate" className="hover:text-primary transition-colors">Donate</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Club</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get the latest news and updates from the castle.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button className="h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Fasil Kenema Sport Club. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
