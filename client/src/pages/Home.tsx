import PublicLayout from "@/components/PublicLayout";
import Hero from "@/components/Hero";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getLocalAssetUrl } from "@/lib/localAssets";

const GONDER_IMAGE_URL = getLocalAssetUrl("gonder/gonder.webp");

function Gonder() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoadImage(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShouldLoadImage(true);
          observer.disconnect();
          break;
        }
      },
      { root: null, rootMargin: "250px 0px", threshold: 0.01 },
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 max-w-6xl mx-auto">
        <div
          ref={rootRef}
          className={`grid grid-cols-1 ${GONDER_IMAGE_URL ? "md:grid-cols-2" : ""} gap-10 items-center`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Home City Story
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              Gondar & FASIL S.C
            </h2>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Gondar is the historical heart of Ethiopia's north, and it is
              where FASIL S.C was founded. The club's identity is shaped by
              local support, with the Gondar City Administration sponsoring
              FASIL S.C and helping the team grow through community programs.
              <Link href="/gonder">
                <span className="pl-2 text-red-600 font-semibold hover:text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded">
                  read more
                </span>
              </Link>
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-red-600 font-heading text-2xl font-bold">
                  Funding
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Built and supported by Gondar's community.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-red-600 font-heading text-2xl font-bold">
                  Sponsorship
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Gondar City Administration backs FASIL S.C
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-red-600 font-heading text-2xl font-bold">
                  Youth
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Training pathways for the next generation.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-red-600 font-heading text-2xl font-bold">
                  Pride
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  A club that represents Gondar every season.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/stadium"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Visit Stadium
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-red-600 font-bold border border-red-100 hover:bg-red-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className={GONDER_IMAGE_URL ? "relative" : "hidden"}>
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600/15 to-amber-500/15 rounded-[2rem] blur-[10px]" />
            <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {!shouldLoadImage && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                )}
                <img
                  src={shouldLoadImage ? GONDER_IMAGE_URL : undefined}
                  alt="Gondar, Ethiopia"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    shouldLoadImage ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <div className="absolute top-4 left-4">
                <div className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                    Gondar City Administration
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Sponsor of FASIL S.C
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/public/settings"],
    staleTime: Infinity,
  });

  const homeContent = {
    newsTitle:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "home.newsTitle")?.value
        : null) || "Latest From FASIL S.C",
    newsSubtitle:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "home.newsSubtitle")?.value
        : null) ||
      "Stay updated with match reports, club announcements, and exclusive interviews.",
    ctaTitle:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "home.ctaTitle")?.value
        : null) || "Join FASIL S.C",
    ctaSubtitle:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "home.ctaSubtitle")?.value
        : null) ||
      "Join the official fan club today. Get exclusive access, voting rights, and digital membership cards. Your support builds our future.",
  };

  return (
    <PublicLayout>
      <Hero />

      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-red-600 mb-2">
                {homeContent.newsTitle}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {homeContent.newsSubtitle}
              </p>
            </div>
            <Link href="/blog">
              <Button
                variant="ghost"
                className="hidden md:flex gap-2 uppercase font-bold tracking-wide text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                View All News <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <NewsCard limit={6} />
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

      <section className="py-16 bg-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="container px-4 relative z-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10 text-yellow-300">
            Trophies and Honors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                no: 1,
                name: "የኢትዮጵያ ፕሪሚየር ሊግ ክለቦች የአሸናፊዎች አሸናፊ ዋንጫ",
                english: "Ethiopian Premier League Super Cup Winner",
                year: "2011",
                place: "አዲስ አበባ",
              },
              {
                no: 2,
                name: "የኢትዮጵያ ፕሪሚየር ሊግ ክለቦች የወንዶች ጥሎ ማለፍ ዋንጫ አሸናፊ",
                english: "Ethiopian Premier League Men's Knockout Cup Winner",
                year: "2011",
                place: "ደብረ ዘይት",
              },
              {
                no: 3,
                name: "18ኛዉ የአዲስአበባ ከተማ ዋንጫ አሸናፊ",
                english: "18th Addis Ababa City Cup Winner",
                year: "2016",
                place: "አዲስ አበባ",
              },
              {
                no: 4,
                name: "የቤትኪንግ ኢትዮጵያ ፕሪሚየር ሊግ ዋንጫ አሸናፊ",
                english: "BetKing Ethiopian Premier League Champions",
                year: "2013",
                place: "ሐዋሳ",
              },
              {
                no: 5,
                name: "በኢትዮጵያ እግርኳስ ፌደረሽን የከፍተኛ ሊግ የአሸናፊዎች አሸናፊ",
                english: "EFF Higher League Overall Champions",
                year: "2009",
                place: "አዲስ አበባ",
              },
              {
                no: 6,
                name: "በኢትዮጵያ እግርኳስ ፌደረሽን የከፍተኛ ሊግ ምድብ ሀ አሸናፊ",
                english: "EFF Higher League Group A Winners",
                year: "2008",
                place: "ጎንደር",
              },
              {
                no: 7,
                name: "የብሔራዊ ሊግ በሰሜን ዞን ምድብ ለ አሸናፊ",
                english: "National League Northern Zone Group B Winners",
                year: "2007",
                place: "ድሬዳዋ",
              },
            ].map((t) => (
              <div
                key={t.no}
                className="flex flex-col h-full p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="h-10 w-10 text-yellow-300 shrink-0" />
                  <span className="font-heading font-bold text-yellow-200 text-lg">
                    ተ.ቁ {t.no}
                  </span>
                </div>
                <p className="text-white text-sm leading-snug mb-4 flex-grow">
                  {t.name}
                </p>
                <p className="text-white text-sm leading-snug mb-4 flex-grow">
                  {t.english}
                </p>
                <div className="flex justify-between text-sm pt-3 border-t border-white/20">
                  <span>
                    <span className="text-yellow-200/90 opacity-90">ዓ.ም</span>{" "}
                    {t.year}
                  </span>
                  <span>
                    <span className="text-yellow-200/90 opacity-90">ቦታ</span>{" "}
                    {t.place}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="container px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <ShoppingBag className="h-16 w-16 text-white" />
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-white">
                  Shop Our Merchandise
                </h2>
                <p className="text-lg opacity-90 text-white">
                  Show your support with official FASIL S.C gear and apparel!
                </p>
              </div>
            </div>
            <a
              href="https://tinamart.com/products/20fad3e9-8997-43bc-a7ed-86cc852671c6"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 font-display uppercase tracking-wider h-14 px-8 text-lg"
              >
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white text-zinc-900 relative overflow-hidden px-4">
        <div className="container px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-none text-zinc-900">
              {homeContent.ctaTitle.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-red-600">
                {homeContent.ctaTitle.split(" ").slice(-1)}
              </span>
            </h2>
            <p className="text-xl text-zinc-700 mb-8 font-light">
              {homeContent.ctaSubtitle}
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/membership">
                <Button
                  size="lg"
                  className="bg-red-600 text-white hover:bg-red-700 font-display uppercase tracking-wider h-14 px-8 text-lg"
                >
                  Join Now
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 font-display uppercase tracking-wider h-14 px-8 text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative w-full max-w-md aspect-square bg-gradient-to-br from-red-600 to-amber-900 rounded-full opacity-20 blur-3xl absolute right-0 top-0 md:relative md:opacity-100 md:blur-xl md:rounded-none md:bg-transparent"></div>
        </div>
      </section>

      <Gonder />
    </PublicLayout>
  );
}
