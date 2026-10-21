import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";
import { getLocalAssetUrl } from "@/lib/localAssets";

const ABOUT_TEXT = `Beyond sport, FASIL S.C Sport Club gives back through dedicated charity work. We support underprivileged youth with access to sport and education, run health and community outreach initiatives, and partner with local organisations to strengthen our community. Our charity arm focuses on youth development, equipment donations to schools, and events that bring people together. Together we build a stronger, healthier community.`;

const GALLERY_IMAGES = [
  {
    src: getLocalAssetUrl("charity-work/ambassadors.webp"),
    alt: "Fasil S.C community ambassadors supporting an elderly care campaign",
  },
  {
    src: getLocalAssetUrl("charity-work/blood-donation.webp"),
    alt: "Community members taking part in a blood donation drive",
  },
  {
    src: getLocalAssetUrl("charity-work/environmental-work.webp"),
    alt: "Fasil S.C volunteers participating in environmental work",
  },
  {
    src: getLocalAssetUrl("charity-work/elderly-support.webp"),
    alt: "Fasil S.C members delivering support supplies to older adults",
  },
  {
    src: getLocalAssetUrl("charity-work/student-support-1.webp"),
    alt: "Club volunteers providing school materials to students",
  },
  {
    src: getLocalAssetUrl("charity-work/student-support-2.webp"),
    alt: "Students receiving educational support from the club",
  },
].filter((image): image is { src: string; alt: string } => Boolean(image.src));

export default function Charity() {
  const [loadedImageIndexes, setLoadedImageIndexes] = useState<boolean[]>(() =>
    Array(GALLERY_IMAGES.length).fill(false),
  );

  useEffect(() => {
    const loaded = new Set<number>();
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          const idxRaw = target.dataset.charityImageIndex;
          if (!idxRaw) continue;

          const idx = Number(idxRaw);
          if (Number.isNaN(idx) || idx < 0 || idx >= GALLERY_IMAGES.length)
            continue;
          if (loaded.has(idx)) continue;

          loaded.add(idx);
          setLoadedImageIndexes((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });

          if (cancelled) return;
          observer.unobserve(target);
        }
      },
      { root: null, rootMargin: "250px 0px", threshold: 0.01 },
    );

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-charity-image-index]"),
    );
    for (const el of nodes) observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section>
      <div className="bg-red-600 text-white relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container px-4 relative z-10 text-center">
          <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-2">
            Programs
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Charity Work
          </h1>
            <p className="text-lg md:text-xl text-amber-50 max-w-2xl mx-auto">
            Giving back to the community through youth support, health
            initiatives, and partnerships.
          </p>
          </div>
        </div>
      </section>
      

      {/* About */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            About Our Charity Work
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">{ABOUT_TEXT}</p>
        </div>
      </section>

      {/* Gallery — 6 images */}
      {GALLERY_IMAGES.length > 0 && (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            In the Community
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-14">
            Moments from our charity and outreach work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {GALLERY_IMAGES.map((image, i) => (
              <div
                key={i}
                data-charity-image-index={i}
                className="rounded-xl overflow-hidden bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={loadedImageIndexes[i] ? image.src : undefined}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Back link */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container px-4 max-w-6xl mx-auto text-center">
          <Link
            href="/programs"
            className="text-red-600 font-semibold hover:text-red-700 hover:underline"
          >
            ← Back to Programs
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
