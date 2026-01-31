import { Link, useLocation } from 'wouter';
import { useApp } from '@/lib/context';
import { LANGUAGES, ASSETS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function Navbar() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/settings'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    headerText: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerText')?.value : null) || 'MECHAL FC',
    headerSubtext: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerSubtext')?.value : null) || 'SPORT CLUB',
    logo: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.logo')?.value : null) || ASSETS.logo,
    favicon: Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.favicon')?.value : null,
  };

  useEffect(() => {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (brandingSettings.favicon) {
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'icon');
        document.head.appendChild(link);
      }
      link.setAttribute('href', brandingSettings.favicon);
    } else {
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'icon');
        document.head.appendChild(link);
      }
      link.setAttribute('href', '/favicon.png');
    }
  }, [brandingSettings.favicon]);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/membership', label: t('nav.membership') },
    { href: '/donate', label: t('nav.donate') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 mr-6">
          <img src={brandingSettings.logo} alt="Logo" className="h-12 w-12 object-contain" />
          <div className="hidden md:flex flex-col">
            <span className="font-heading text-2xl leading-none text-primary">{brandingSettings.headerText}</span>
            <span className="text-xs font-bold tracking-widest text-muted-foreground">{brandingSettings.headerSubtext}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary uppercase tracking-wide",
                location === link.href ? "text-primary font-bold" : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                <span className="text-lg">{currentLang.flag}</span>
                <span className="sr-only">Switch Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code} 
                  onClick={() => setLanguage(lang.code)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/member/login">
            <Button size="sm" className="font-display uppercase tracking-wider hidden sm:flex" data-testid="button-member-login">
              Member Login
            </Button>
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="flex items-center gap-2 mb-4" onClick={() => setIsOpen(false)}>
                  <img src={brandingSettings.logo} alt="Logo" className="h-10 w-10" />
                  <span className="font-heading text-xl text-primary">{brandingSettings.headerText}</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary uppercase",
                        location === link.href ? "text-primary" : "text-foreground/80"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Link href="/member/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full font-display uppercase">
                    Member Login
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
