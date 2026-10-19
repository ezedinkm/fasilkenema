import { Link } from 'wouter';
import { ASSETS } from '@/lib/mockData';
import { Facebook, Twitter, Instagram, Youtube, Smartphone, Mail, CheckCircle, X } from 'lucide-react';
import appStoreBadge from '@assets/generated_images/app_store_badge.png';
import playStoreBadge from '@assets/generated_images/google_play_badge.png';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');

  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/public/settings'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    headerText: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerText')?.value : null) || 'FASIL F.C',
    headerSubtext: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerSubtext')?.value : null) || 'sport Club',
    logo: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.logo')?.value : null) || ASSETS.logo,
    footerTagline: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.footerTagline')?.value : null) || "The official home of FASIL S.C Ethiopian football excellence.",
    copyrightText: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.copyrightText')?.value : null) || 'FASIL S.C',
    facebookUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.facebook')?.value : null) || '#',
    twitterUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.twitter')?.value : null) || '#',
    instagramUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.instagram')?.value : null) || '#',
    youtubeUrl: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'social.youtube')?.value : null) || '#',
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubscribed(true);
    setEmail('');
    
    setTimeout(() => {
      setIsSubscribed(false);
    }, 5500);
  };

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 text-slate-600 border-t border-slate-200 font-sans">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <motion.img
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
                src={brandingSettings.logo}
                alt="Fasil Kenema SC"
                className="h-12 w-12 md:h-14 md:w-14 object-contain"
              />
              <span className="flex flex-col">
                <span className="font-heading text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {brandingSettings.headerText}
                </span>
                <span className="text-xs font-semibold tracking-wide text-slate-500">
                  {brandingSettings.headerSubtext}
                </span>
              </span>
            </Link>
            
            <p className="text-sm md:text-sm leading-relaxed text-slate-500 max-w-md">
              {brandingSettings.footerTagline}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://web.facebook.com/FKSCOfficial/?_rdc=1&_rdr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-red-500 text-slate-600 hover:text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/fcfasil"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-red-500 text-slate-600 hover:text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/fasil_kenema_sc?igsh=MTgyZXVrbHA4ZWxxcg=="
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-red-500 text-slate-600 hover:text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>

            {/* App Store Badges */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-4 w-4 text-red-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Get The App</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="transition-transform hover:scale-105 duration-200">
                  <img src={appStoreBadge} alt="Download on the App Store" className="h-10 w-auto" />
                </a>
                <a href="#" className="transition-transform hover:scale-105 duration-200">
                  <img src={playStoreBadge} alt="Get it on Google Play" className="h-10 w-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - 2 columns */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-sm md:text-base mb-5 uppercase tracking-wider text-slate-800 relative inline-block">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
  {[
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Membership", href: "/membership" },
    { label: "Donate", href: "/donate" },
  ].map((item, index) => (
    <li key={index}>
      <Link
        href={item.href}
        className="text-sm text-slate-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-2 group"
      >
        <span className="w-0 group-hover:w-1.5 h-1.5 bg-red-500 rounded-full transition-all duration-300"></span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">
          {item.label}
        </span>
      </Link>
    </li>
  ))}
</ul>
          </div>

          {/* Club Links - 2 columns */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-sm md:text-base mb-5 uppercase tracking-wider text-slate-800 relative inline-block">
              Club
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
  {[
    { label: "Contact Us", href: "/contact" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ].map((item, index) => (
    <li key={index}>
      <Link
        href={item.href}
        className="text-sm text-slate-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-2 group"
      >
        <span className="w-0 group-hover:w-1.5 h-1.5 bg-red-500 rounded-full transition-all duration-300"></span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">
          {item.label}
        </span>
      </Link>
    </li>
  ))}
</ul>
          </div>

          {/* Newsletter Section - 4 columns */}
          <div className="md:col-span-4">
            <h3 className="font-semibold text-sm md:text-base mb-5 uppercase tracking-wider text-slate-800 relative inline-block">
              Newsletter
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-500 rounded-full"></div>
            </h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Subscribe to get the latest news, match updates, and exclusive offers from FASIL S.C.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Your email address"
                    className={`w-full h-11 pl-10 pr-3 rounded-xl border ${
                      error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                    } text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                    disabled={isSubscribed}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubscribed}
                  className={`h-11 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSubscribed
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Subscribed!
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </motion.button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 flex items-center gap-1"
                >
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </motion.p>
              )}
            </form>

            {/* Trust Badge */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>
                  ))}
                </div>
                <span>Join 10,000+ subscribers</span>
                
              </div>
              
            </div>
           
          </div>
          <div className="flex justify-center items-center">
          <p className="text-xs md:text-sm text-slate-400 md:hidden block">
            &copy; {new Date().getFullYear()} {brandingSettings.copyrightText}. All rights reserved. 
          </p>
          </div>
        </div>

        {/* Copyright Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-8 md:pt-4 border-t border-slate-200 text-center"
        >
          <p className="text-xs md:text-sm text-slate-400 hidden md:block">
            &copy; {new Date().getFullYear()} {brandingSettings.copyrightText}. All rights reserved. 
            <span className="hidden md:inline mx-2">•</span>
            <br className="md:hidden" />
            <span className="text-slate-300">Built with passion for Ethiopian football</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}