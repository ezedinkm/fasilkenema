import { Link } from 'wouter';
import { ASSETS } from '@/lib/mockData';
import { Facebook, Twitter, Instagram, Youtube, Smartphone } from 'lucide-react';
import appStoreBadge from '@assets/generated_images/app_store_badge.png';
import playStoreBadge from '@assets/generated_images/google_play_badge.png';
import { useQuery } from '@tanstack/react-query';

export default function Footer() {
  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/public/settings'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    headerText: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerText')?.value : null) || 'FASIL F.C',
    logo: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.logo')?.value : null) || ASSETS.logo,
    footerTagline: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.footerTagline')?.value : null) || "The official home of FASIL S.C Ethiopian football excellence.",
    copyrightText: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.copyrightText')?.value : null) || 'FASIL S.C',
    facebookUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.facebook')?.value : null) || '#',
    twitterUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.twitter')?.value : null) || '#',
    instagramUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.instagram')?.value : null) || '#',
    youtubeUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.youtube')?.value : null) || '#',
  };

  return (
    <footer className="bg-white text-sidebar-foreground border-t border-border/60 font-sans">
      <div className="container px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img
                src={brandingSettings.logo}
                alt="Fasil Kenema SC"
                className="h-12 w-12 md:h-12 md:w-12 object-contain"
              />
              <span className="font-heading text-xl md:text-2xl font-bold text-red-600">
                {brandingSettings.headerText}
              </span>
            </Link>
            <p className="text-sm md:text-[13px] leading-relaxed text-muted-foreground mb-7">
              {brandingSettings.footerTagline}
            </p>
            <div className="flex items-center gap-4 mb-7">
              <a
                href="https://web.facebook.com/FKSCOfficial/?_rdc=1&_rdr"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/fcfasil"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/fasil_kenema_sc?igsh=MTgyZXVrbHA4ZWxxcg=="
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              {/* <a
                href={brandingSettings.youtubeUrl}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a> */}
            </div>

            <div className="pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3 text-red-600 font-bold text-sm uppercase tracking-wide">
                <Smartphone className="h-4 w-4" />
                <span>Get The App</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="#" className="block transition-opacity hover:opacity-80" aria-label="App Store">
                  <img src={appStoreBadge} alt="Download on the App Store" className="h-9 w-auto" />
                </a>
                <a href="#" className="block transition-opacity hover:opacity-80" aria-label="Google Play">
                  <img src={playStoreBadge} alt="Get it on Google Play" className="h-9 w-auto" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm md:text-[15px] font-semibold mb-4 uppercase tracking-wide text-slate-900">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm md:text-[13px]">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-primary transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-primary transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm md:text-[15px] font-semibold mb-4 uppercase tracking-wide text-slate-900">
              Club
            </h3>
            <ul className="space-y-2 text-sm md:text-[13px]">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm md:text-[15px] font-semibold mb-4 uppercase tracking-wide text-slate-900">
              Newsletter
            </h3>
            <p className="text-sm md:text-[13px] text-muted-foreground mb-4 leading-relaxed">
              Subscribe to get the latest news and updates from FASIL S.C.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button className="h-10 px-4 py-2 bg-red-600 text-primary-foreground shadow hover:bg-red-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-2 pt-8 border-t border-border/50 text-center text-sm md:text-[13px] text-muted-foreground">
          &copy; {new Date().getFullYear()} {brandingSettings.copyrightText}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
