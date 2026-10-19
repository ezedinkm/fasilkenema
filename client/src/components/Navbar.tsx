import { Link, useLocation } from 'wouter';
import { useApp } from '@/lib/context';
import { LANGUAGES, ASSETS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Search, User, ChevronDown, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getLocalAssetUrl } from '@/lib/localAssets';

const partner1 = getLocalAssetUrl('partners/1.jpg');
const partner2 = getLocalAssetUrl('partners/2.jpg');
const partner3 = getLocalAssetUrl('partners/3.jpg');
const partner4 = getLocalAssetUrl('partners/4.jpg');
const partner5 = getLocalAssetUrl('partners/vcardet_logo.jpg');

const SECONDARY_LINKS = [
  { href: '/meetings-events', label: 'MEETINGS & EVENTS' },
  { href: '/shopping', label: 'SHOP NOW' },
];

type StaticSearchRoute = {
  path: string;
  keywords: string[];
};

const STATIC_SEARCH_ROUTES: StaticSearchRoute[] = [
  {
    path: '/',
    keywords: [
      'home',
      'main',
      'start',
      'welcome',
      'landing',
      'homepage',
      'index',
      'dashboard',
      'front',
      'intro',
    ],
  },
  {
    path: '/team/men',
    keywords: [
      'men team',
      'male players',
      'men squad',
      'first team',
      'football men',
      'male squad',
      'players men',
      'roster men',
    ],
  },
  {
    path: '/team/women',
    keywords: [
      'women team',
      'female players',
      'women squad',
      'football women',
      'female squad',
      'players women',
      'roster women',
    ],
  },
  {
    path: '/team/junior',
    keywords: [
      'junior team',
      'youth players',
      'academy squad',
      'football junior',
      'junior squad',
      'players junior',
      'roster junior',
    ],
  },
  {
    path: '/about',
    keywords: [
      'about',
      'about us',
      'history',
      'club history',
      'who we are',
      'background',
      'information',
      'details',
      'club info',
      'foundation',
      'origin',
      'story',
      'mission',
      'vision',
      'values',
      'overview',
    ],
  },
  {
    path: '/news',
    keywords: [
      'news',
      'latest news',
      'updates',
      'latest',
      'blog',
      'articles',
      'announcement',
      'stories',
      'press',
      'club news',
      'recent news',
      'breaking news',
      'football news',
      'team news',
    ],
  },
  {
    path: '/epl',
    keywords: [
      'epl',
      'table',
      'result',
      'ethiopian premier league',
      'matches',
      'games',
      'schedule',
      'calendar',
      'results',
      'scores',
      'match results',
      'fixtures list',
      'next match',
      'upcoming matches',
      'played matches',
      'league table',
      'standings',
    ],
  },
  {
    path: '/donate',
    keywords: [
      'donate',
      'donation',
      'support',
      'fund',
      'help',
      'give',
      'contribute',
      'charity',
      'fundraising',
      'one-time donation',
      'monthly support',
      'campaign',
      'current campaigns',
      'support club',
      'donate now',
    ],
  },
  {
    path: '/programs/basketball',
    keywords: [
      'basketball',
      'basketball program',
      'basketball training',
      'basketball academy',
    ],
  },
  {
    path: '/programs/boxing',
    keywords: ['boxing', 'boxing program', 'boxing training', 'boxing academy'],
  },
  {
    path: '/programs/handball',
    keywords: [
      'handball',
      'handball program',
      'handball training',
      'handball academy',
    ],
  },
  {
    path: '/programs/charity',
    keywords: [
      'charity',
      'charity program',
      'community',
      'support program',
      'social program',
    ],
  },
  {
    path: '/contact',
    keywords: [
      'contact',
      'contact us',
      'email',
      'phone',
      'call',
      'reach',
      'location',
      'address',
      'get in touch',
      'support contact',
      'help desk',
    ],
  },
  {
    path: '/meetings-events',
    keywords: [
      'events',
      'meetings',
      'club events',
      'fixtures events',
      'upcoming events',
      'schedule events',
      'event calendar',
    ],
  },
  {
    path: '/member/login',
    keywords: [
      'login',
      'sign in',
      'member login',
      'access account',
      'enter credentials',
    ],
  },
];

function tokenizeStaticSearch(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

type KeywordTokens = { keyword: string; tokens: string[] };
type RouteIndex = { path: string; keywords: KeywordTokens[] };

const STATIC_SEARCH_INDEX: RouteIndex[] = STATIC_SEARCH_ROUTES.map((r) => ({
  path: r.path,
  keywords: r.keywords.map((keyword) => ({
    keyword,
    tokens: tokenizeStaticSearch(keyword),
  })),
}));

function scoreRouteByStaticKeywords(inputTokens: string[]): { path: string; score: number } {
  if (inputTokens.length === 0) return { path: '/not-found', score: 0 };
  const inputSet = new Set(inputTokens);

  let bestPath = '/not-found';
  let bestScore = 0;

  for (const route of STATIC_SEARCH_INDEX) {
    let routeScore = 0;

    for (const k of route.keywords) {
      if (k.tokens.length === 0) continue;

      let matched = 0;
      for (const tok of k.tokens) {
        if (inputSet.has(tok)) matched += 1;
      }

      if (matched === 0) continue;

      // Base score = number of matched words in the keyword phrase.
      let phraseScore = matched;

      // Bonus if the whole phrase is covered (e.g. "about us").
      if (matched === k.tokens.length) phraseScore += k.tokens.length * 2;

      routeScore = Math.max(routeScore, phraseScore);
    }

    if (routeScore > bestScore) {
      bestScore = routeScore;
      bestPath = route.path;
    }
  }

  return { path: bestPath, score: bestScore };
}

type MegaColumnItem =
  | { label: string; href: string }
  | { label: string; children: { label: string; href: string }[] };

type MegaColumn = {
  title: string;
  description?: string;
  items: MegaColumnItem[];
};

type NavSubLink =
  | { label: string; href: string }
  | { label: string; children: { label: string; href: string }[] };

type NavLinkItem = {
  href: string;
  label: string;
  sublinks?: NavSubLink[];
  megaIntro?: string;
  megaContent?: MegaColumn[];
  isPartners?: boolean;
  partnerLogos?: string[];
};

function buildNavLinks(t: (key: string) => string): NavLinkItem[] {
  return [
    {
      href: '/',
      label: t('nav.home'),
      megaIntro: 'Everything you need to follow the club — latest news, fixtures, results, and official merchandise.',
      sublinks: [
        { label: 'League Table', href: '/epl' },
      ],
      megaContent: [
        { title: 'Quick links', description: 'Stay up to date with matches and club updates.', items: [
          { label: 'Latest News', href: '/blog' },
          { label: 'League Table', href: '/epl' },
        ]},
        { title: 'Shop', description: 'Official club gear and partners.', items: [
        ]},
      ],
    },
    {
      href: '/team/men',
      label: t('nav.team'),
      megaIntro: 'Meet our squads — men’s first team, women, juniors, and our trophies.',
      sublinks: [
        { label: 'Men FASIL', href: '/team/men' },
        { label: 'Women FASIL', href: '/team/women' },
        { label: 'Junior FASIL', href: '/team/junior' },
        { label: 'Basketball', href: '/programs/basketball' },
        { label: 'Boxing', href: '/programs/boxing' },
        { label: 'Handball', href: '/programs/handball' },
        { label: 'Trophies & Honours', href: '/team/trophies' },
      ],
      megaContent: [
        { title: 'Squads', description: 'First team and academy.', items: [
          { label: 'List of Team', href: '/programs' },
          { label: 'Men FASIL', href: '/team/men' },
          { label: 'Women FASIL', href: '/team/women' },
          { label: 'Junior FASIL', href: '/team/junior' },
        ]},
        { title: 'More', description: 'Women FC, Juniors, events & shop.', items: [
          { label: 'Basketball', href: '/programs/basketball' },
          { label: 'Boxing', href: '/programs/boxing' },
          { label: 'Handball', href: '/programs/handball' },

        ]},
      ],
    },
    {
      href: '/about',
      label: t('nav.about'),
      megaIntro: 'Discover our history, leadership, and the values that define Fasil Kenema Sport Club.',
      sublinks: [
        { label: 'History', href: '/about' },
        { label: 'Gonder', href: '/gonder' },
        { label: 'Stadium', href: '/stadium' },
      ],
      megaContent: [
        { title: 'Club', description: 'Our story and identity.', items: [
          { label: 'History', href: '/about' },
          { label: 'Gonder', href: '/gonder' },
        ]},
        { title: 'Club Overview', description: 'Explore trophies, honours, and stadium information', items: [
          { label: 'Trophies & Honours', href: '/team/trophies' },
          { label: 'Stadium', href: '/stadium' },
        ]},
      ],
    },
    {
      href: '/blog',
      label: t('nav.blog'),
      megaIntro: 'All the latest — breaking news, match insights, exclusive interviews, and stories that shape our club.',
      sublinks: [
        { label: 'News Archive', href: '/blog' },
        { label: 'Interviews', href: '/blog' },

      ],
      megaContent: [
        { title: 'News', description: 'Latest from the club.', items: [
          { label: 'News Archive', href: '/blog' },
          { label: 'Match Reports', href: '/media' },
        ]},
        { title: 'More', description: 'Interviews and community.', items: [
          { label: 'Interviews', href: '/blog' },
          { label: 'Community', href: '/programs/charity' },
        ]},
      ],
    },
    {
      href: '/membership',
      label: t('nav.membership'),
      megaIntro: 'Join the official fan base. Enjoy benefits, priority access, and a voice in the club.',
      sublinks: [
        { label: 'Join Now', href: '/membership' },
        { label: 'Member Login', href: '/member/login' },
      ],
      megaContent: [
        { title: 'Join', description: 'Become a member.', items: [
          { label: 'Join Now', href: '/membership' },
        ]},
        { title: 'Members', description: 'Existing members.', items: [
          { label: 'Member Login', href: '/member/login' },
        ]},
      ],
    },
    {
      href: '/donate',
      label: t('nav.donate'),
      megaIntro: 'Support the club with a one-time gift or ongoing contribution. Every amount helps.',
      sublinks: [
        { label: 'One-time Donation', href: '/donate' }
      ],
      megaContent: [
        { title: 'Ways to give', description: 'Choose how you support.', items: [
          { label: 'One-time Donation', href: '/donate' },
        ]},
      ],
    },
    {
      href: '/programs/charity',
      label: t('community'),
      megaIntro: 'More than sport — discover our community spirit, charitable initiatives, and the programs that uplift and empower people beyond the game',
      sublinks: [
      
        { label: 'Charity Work', href: '/programs/charity' },
        
      ],
      megaContent: [
       
        { title: 'Community', description: 'Giving back.', items: [
          { label: 'Charity Work', href: '/programs/charity' },
        ]},
      ],
    },
    {
      href: '/contact',
      label: t('nav.contact'),
      megaIntro: 'Get in touch, find stadium information, or connect with us on social media.',
      sublinks: [
        { label: 'Get in Touch', href: '/contact' },
        {
          label: 'Social Media',
          children: [
            { label: 'Facebook', href: 'https://web.facebook.com/FKSCOfficial/?_rdc=1&_rdr' },
            { label: 'Instagram', href: 'https://www.instagram.com/fasil_kenema_sc?igsh=MTgyZXVrbHA4ZWxxcg==' },
            { label: 'Twitter (X)', href: 'https://x.com/fcfasil' },
          ],
        },
      ],
      megaContent: [
        { title: 'Contact', description: 'Reach us directly.', items: [
          { label: 'Get in Touch', href: '/contact' },
        ]},
        {
          title: 'Connect',
          description: 'Follow the club online.',
          items: [
            {
              label: 'Social Media',
              children: [
                { label: 'Facebook', href: 'https://facebook.com' },
                { label: 'Instagram', href: 'https://instagram.com' },
                { label: 'Twitter (X)', href: 'https://x.com' },
              ],
            },
          ],
        },
        { 
          title: 'Media', 
          description: 'Watch our latest sports updates and highlights.', 
          items: [
            { label: 'Watch Highlight', href: '/media' },
          ]
        },
      ],
    },
    {
      href: '/partners',
      label: t('nav.partners'),
      isPartners: true,
      partnerLogos: [
        partner1,
        partner2,
        partner3,
        partner4,
        partner5,
      ].filter((logo): logo is string => Boolean(logo)),
      sublinks: [],
    },
  ];
}

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { language, setLanguage, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState<number | null>(null);
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navPanelRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks = buildNavLinks(t);

  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/public/settings'],
    staleTime: Infinity,
  });

  const brandingSettings = {
    headerText: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerText')?.value : null) || 'FASIL S.C',
    headerSubtext: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'branding.headerSubtext')?.value : null) || 'sport Club',
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
      link.setAttribute('href', '/fasillogo.png');
      link.setAttribute('type', 'image/png');
    }
  }, [brandingSettings.favicon]);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => setActiveNavIndex(null), 120);
  };

  const handleNavEnter = (index: number) => {
    clearHideTimeout();
    setSearchOpen(false);
    setSearchFeedback(null);
    setActiveNavIndex(index);
  };

  const handleNavAreaLeave = () => {
    scheduleHide();
    setSearchOpen(false);
    setSearchFeedback(null);
  };

  const handlePanelEnter = () => {
    clearHideTimeout();
  };

  const handlePanelLeave = () => {
    scheduleHide();
  };

  useEffect(() => () => clearHideTimeout(), []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const openSearch = (open: boolean) => {
    setSearchOpen(open);
    if (open) {
      setSearchFeedback(null);
      setActiveNavIndex(null);
    } else {
      setSearchFeedback(null);
    }
  };

  const handleStaticSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchFeedback('Enter a search term.');
      return;
    }

    const inputTokens = tokenizeStaticSearch(searchQuery);
    const { path, score } = scoreRouteByStaticKeywords(inputTokens);

    if (score > 0) {
      setLocation(path);
      openSearch(false);
      setSearchQuery('');
      setSearchFeedback(null);
    } else {
      setSearchFeedback('Nothing matched your search. Try different keywords.');
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 bg-red-600 shadow-lg pt-4">
  {/* <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div> */}

      {/* Top tier: secondary / utility bar — red bg, white text */}
      <div className="w-full h-9 border-b border-red-500/50">
        <div className="container flex h-full max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4 my-2 display-none">
            
          <Button
  variant="ghost"
  size="sm"
  className="h-7 md:hidden rounded-sm px-3 text-[15px] font-semibold tracking-wide text-white hover:bg-white/10"
>
  FASIL S.C
</Button>
        
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <nav className="hidden xl:flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wide text-white/95">
              {SECONDARY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white transition-colors whitespace-nowrap">
                  <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-sm border-white/40 bg-transparent px-3 text-[11px] font-semibold tracking-wide text-white hover:bg-white/10 hover:text-white hover:border-white/60"
              >
                {link.label}
              </Button>
                </Link>
              ))}
              {/* <a key="partners" href="https://tinamart.com/products/20fad3e9-8997-43bc-a7ed-86cc852671c6" className="hover:text-white transition-colors whitespace-nowrap">
              </a> */}
              {/* <Link href="/shopping" >
                  <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-sm border-white/40 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/10 hover:text-white hover:border-white/60"
              >
                shop now
              </Button>
              </Link> */}
            </nav>
            <Link href="/member/login" className="text-white hover:text-white/90 transition-colors" aria-label="Account">
              <User className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            </Link>
            
            <button
              type="button"
              className="text-white hover:text-white/90 transition-colors p-1 rounded hover:bg-white/10"
              aria-label="Search"
              onClick={() => openSearch(!searchOpen)}
            >
              <Search className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tier: primary bar — logo + navLinks + right area + mega panel */}
      <div
        className="relative w-full"
        onMouseLeave={handleNavAreaLeave}
      >
        <div className="container flex h-14 md:h-16 max-w-screen-2xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-white rounded">
            <img src={brandingSettings.logo} alt="" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="block font-heading text-lg md:text-xl font-bold uppercase tracking-tight text-white">
                {brandingSettings.headerText}
              </span>
              <span className="block text-[10px] font-semibold tracking-wide text-white/80">
                {brandingSettings.headerSubtext}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 lg:gap-3 h-full">
            {navLinks.map((link, index) => (
              <div
                key={link.isPartners ? 'partners' : link.href}
                className="h-full flex items-center"
                onMouseEnter={() => handleNavEnter(index)}
              >
                {link.isPartners ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavEnter(index)}
                    className={cn(
                      'px-2 lg:px-3 py-2 text-xs lg:text-sm font-semibold uppercase tracking-wide h-full flex items-center border-b-2 border-transparent rounded-sm cursor-default',
                      'text-white/95 hover:bg-white/10',
                      activeNavIndex === index && 'bg-white/10 text-white border-b-2 border-white'
                    )}
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      'px-2 lg:px-3 py-2 text-xs lg:text-sm font-semibold uppercase tracking-wide h-full flex items-center border-b-2 border-transparent rounded-sm',
                      location === link.href ? 'bg-white/15 text-white' : 'text-white/95 hover:bg-white/10',
                      activeNavIndex === index && 'bg-white/10 text-white border-b-2 border-white'
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
          </nav>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <button
              type="button"
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-sm text-white hover:bg-white/10 transition-colors"
              aria-label="Search"
              onClick={() => openSearch(!searchOpen)}
            >
              <Search className="h-4 w-4" />
            </button>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-sm text-white hover:bg-white/10 hover:text-white p-0">
                  <span className="text-base">{currentLang.flag}</span>
                  <span className="sr-only">Switch Language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
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
            </DropdownMenu> */}

            <Link href="/member/login" className="hidden sm:block">
              <Button
                size="sm"
                className="h-9 font-semibold uppercase tracking-wide text-red-600 bg-white hover:bg-gray-100 rounded-sm px-4"
                data-testid="button-member-login"
              >
                Member Login
              </Button>
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-white hover:bg-white/10 hover:text-white">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-[320px] sm:max-w-[360px] bg-slate-50 border-l border-slate-200 flex flex-col p-0"
              >
                <div className="flex-1 flex flex-col overflow-y-auto">
                  {/* Header */}
                  <div className="shrink-0 px-5 pt-6 pb-4 border-b border-slate-200 bg-white">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center p-1 bg-white rounded-md shadow-sm">
                        <img src={brandingSettings.logo} alt="" className="h-10 w-10 object-contain" />
                      </div>
                      <div>
                        <span className="font-heading text-lg font-bold uppercase tracking-tight text-slate-900 block">
                          {brandingSettings.headerText}
                        </span>
                        <span className="text-[10px] font-semibold tracking-wide text-slate-500">
                          {brandingSettings.headerSubtext}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Main nav */}
                  <nav className="flex flex-col px-4 py-5 gap-0.5">
                    {navLinks.map((link, index) => (
                      link.sublinks && link.sublinks.length > 0 ? (
                        <Collapsible
                          key={link.href}
                          open={mobileExpandedIndex === index}
                          onOpenChange={(open) => setMobileExpandedIndex(open ? index : null)}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'w-full flex items-center justify-between py-3 px-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors text-left',
                                location === link.href
                                  ? 'bg-red-600 text-white'
                                  : 'text-slate-700 hover:bg-slate-200/80 active:bg-slate-200'
                              )}
                            >
                              {link.label}
                              <ChevronDown className={cn('h-4 w-4 shrink-0 ml-2 transition-transform', mobileExpandedIndex === index && 'rotate-180')} />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <ul className="pl-4 mt-1 mb-2 space-y-0.5 border-l-2 border-slate-200 ml-3">
                              {link.sublinks.map((sub) =>
                                'children' in sub ? (
                                  <li key={sub.label} className="list-none py-0.5">
                                    <Collapsible className="group">
                                      <CollapsibleTrigger asChild>
                                        <button
                                          type="button"
                                          className="w-full flex items-center justify-between gap-2 py-2 text-sm text-slate-600 hover:text-red-600 font-medium text-left rounded-md pr-1"
                                        >
                                          {sub.label}
                                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                        </button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <ul className="pl-3 mt-1 mb-1 space-y-0.5 border-l border-slate-200 ml-1">
                                          {sub.children.map((c) => (
                                            <li key={c.href}>
                                              <a
                                                href={c.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block py-2 text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
                                                onClick={() => setIsOpen(false)}
                                              >
                                                {c.label}
                                              </a>
                                            </li>
                                          ))}
                                        </ul>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </li>
                                ) : (
                                  <li key={sub.href}>
                                    <Link
                                      href={sub.href}
                                      className="block py-2.5 text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'block py-3 px-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors',
                            location === link.href
                              ? 'bg-red-600 text-white'
                              : 'text-slate-700 hover:bg-slate-200/80 active:bg-slate-200'
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      )
                    ))}
                  </nav>

                  {/* Secondary links */}
                  <div className="shrink-0 px-4 py-4 border-t border-slate-200 bg-white/80">
                    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      More
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {SECONDARY_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 p-4 pt-2">
                    <Link href="/member/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wide rounded-lg shadow-sm">
                        Member Login
                      </Button>
                    </Link>
                  </div>
                  
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search panel — same slot below nav, full width */}
        {searchOpen && (
          <div
            className="absolute left-0 right-0 top-full z-40 w-full bg-white shadow-lg border-t border-gray-200 max-h-[min(70vh,28rem)] overflow-y-auto"
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
            <div className="container max-w-screen-2xl px-3 sm:px-4 py-4 sm:py-5">
              <div className="flex flex-col gap-3 max-w-2xl mx-auto sm:flex-row sm:items-stretch sm:gap-3">
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  {/* <Search className="h-5 w-5 text-gray-400 shrink-0" aria-hidden /> */}
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search news, matches, membership…"
                    className="w-full min-w-0 h-11 sm:h-12 px-3 sm:px-4 text-base text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    aria-label="Search"
                    aria-invalid={Boolean(searchFeedback)}
                    aria-describedby={searchFeedback ? 'navbar-search-feedback' : undefined}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (searchFeedback) setSearchFeedback(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        openSearch(false);
                        return;
                      }
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleStaticSearch();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleStaticSearch}
                    className="flex-1 sm:flex-none min-h-11 sm:min-h-12 h-11 sm:h-12 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors"
                    aria-label="Search"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => openSearch(false)}
                    className="shrink-0 min-h-11 min-w-11 sm:min-h-12 sm:min-w-12 inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {searchFeedback && (
                <p
                  id="navbar-search-feedback"
                  role="alert"
                  className="mt-3 max-w-2xl mx-auto text-sm text-red-600 font-medium px-1"
                >
                  {searchFeedback}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Partners panel — 5 logos marquee (right to left), no route */}
        {!searchOpen && activeNavIndex !== null && navLinks[activeNavIndex]?.isPartners && navLinks[activeNavIndex].partnerLogos?.length && (
          <div
            ref={navPanelRef}
            className="absolute left-0 right-0 top-full z-40 w-full bg-white shadow-xl border-t border-gray-100 overflow-hidden"
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
            <div className="py-6">
              <div className="flex animate-marquee gap-12 whitespace-nowrap">
                {[...navLinks[activeNavIndex].partnerLogos!, ...navLinks[activeNavIndex].partnerLogos!].map((src, i) => (
                  <div key={i} className="inline-flex items-center justify-center shrink-0 w-28 h-16">
                    <img src={src} alt="" className="max-h-12 max-w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mega menu panel — full-width, intro + columns with descriptions */}
        {!searchOpen && activeNavIndex !== null && navLinks[activeNavIndex]?.megaContent && (
          <div
            ref={navPanelRef}
            className="absolute left-0 right-0 top-full z-40 w-full bg-white shadow-xl border-t border-gray-100"
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
            <div className="container max-w-screen-2xl px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                {navLinks[activeNavIndex].megaIntro && (
                  <div className="md:col-span-4 lg:col-span-4 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {navLinks[activeNavIndex].megaIntro}
                    </p>
                    <Link
                      href={navLinks[activeNavIndex].href}
                      className="inline-block mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      View all →
                    </Link>
                  </div>
                )}
                <div className={cn(
                  'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8',
                  navLinks[activeNavIndex].megaIntro ? 'md:col-span-8 lg:col-span-8' : 'md:col-span-12'
                )}>
                  {navLinks[activeNavIndex].megaContent!.map((col) => (
                    <div key={col.title} className="min-w-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                        {col.title}
                      </h3>
                      {col.description && (
                        <p className="text-xs text-gray-500 mb-3 leading-snug">{col.description}</p>
                      )}
                      <ul className="space-y-2.5">
                        {col.items.map((item) => (
                          <li key={'children' in item ? item.label : item.href} className="min-w-0">
                            {'children' in item ? (
                              <Collapsible className="group">
                                <CollapsibleTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-gray-700 hover:text-red-600 transition-colors py-0.5"
                                  >
                                    <span>{item.label}</span>
                                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-data-[state=open]:rotate-180" />
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <ul className="mt-2 space-y-2 pl-2 border-l-2 border-gray-100">
                                    {item.children.map((c) => (
                                      <li key={c.href}>
                                        <a
                                          href={c.href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-gray-700 hover:text-red-600 transition-colors"
                                        >
                                          {c.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : (
                              <Link
                                href={item.href}
                                className="text-sm text-gray-700 hover:text-red-600 transition-colors"
                              >
                                {item.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
