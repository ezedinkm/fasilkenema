import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";
import { listTeamPlayers, type TeamPlayer } from "@/lib/teamAdminApi";

const ABOUT_TEXT =
  "Fasil Kenema Sport Club basketball program brings together youth and community through structured training, league competition, and development at all levels. Our teams compete in domestic competitions while our academy nurtures the next generation. We focus on skill development, teamwork, and discipline on and off the court.";

// Lazy image imports (no eager bundling). Basketball assets include .jpg/.jpeg.
const imageModules = import.meta.glob<{ default: string }>(
  "@/assets/basketball/*.{jpg,jpeg,JPG,JPEG}",
);

const NUMBERS = [4, 7, 10, 11, 14, 5, 8, 9, 12, 15, 6, 13, 20, 22];

type BasketballPlayerUI = TeamPlayer & { number: number };

// Stable lists of asset paths for squad + gallery (then loaded lazily per card).
const sortedEntries = Object.entries(imageModules)
  .filter(([path]) => !path.toLowerCase().endsWith(".pdf"))
  .sort((a, b) => a[0].localeCompare(b[0]));

const GALLERY_IMAGE_PATHS = sortedEntries
  .filter(
    ([path]) =>
      /1\s*\(\d+\)\.jpg$/i.test(path) ||
      (path.includes("1 (") && path.toLowerCase().endsWith(".jpg")),
  )
  .sort((a, b) => a[0].localeCompare(b[0]))
  .slice(0, 5)
  .map(([path]) => path);

export default function Basketball() {
  const [players, setPlayers] = useState<BasketballPlayerUI[]>([]);
  const [galleryImages, setGalleryImages] = useState<(string | undefined)[]>(
    () => Array(GALLERY_IMAGE_PATHS.length).fill(undefined),
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listTeamPlayers("admin.team.basketball");
        if (cancelled) return;
        setPlayers(
          data.map((p, i) => ({
            ...p,
            number: NUMBERS[i] ?? i + 1,
          })),
        );
      } catch {
        if (cancelled) return;
        setPlayers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadedGallery = new Set<number>();
    const galleryRefs = Array.from(
      document.querySelectorAll<HTMLElement>("[data-basketball-gallery-index]"),
    );

    if (!("IntersectionObserver" in window)) {
      GALLERY_IMAGE_PATHS.forEach((path, idx) => {
        void imageModules[path]?.().then((m) => {
          if (cancelled) return;
          loadedGallery.add(idx);
          setGalleryImages((prev) => {
            const next = [...prev];
            if (idx < 0 || idx >= next.length) return prev;
            next[idx] = m?.default;
            return next;
          });
        });
      });
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;

          const galleryIdxRaw = target.dataset.basketballGalleryIndex;
          if (galleryIdxRaw) {
            const idx = Number(galleryIdxRaw);
            if (
              !Number.isNaN(idx) &&
              idx >= 0 &&
              idx < GALLERY_IMAGE_PATHS.length
            ) {
              if (!loadedGallery.has(idx)) {
                loadedGallery.add(idx);
                const path = GALLERY_IMAGE_PATHS[idx];
                void imageModules[path]?.().then((m) => {
                  if (cancelled) return;
                  setGalleryImages((prev) => {
                    const next = [...prev];
                    if (idx < 0 || idx >= next.length) return prev;
                    next[idx] = m?.default;
                    return next;
                  });
                });
              }
            }
          }
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 },
    );

    for (const el of galleryRefs) observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-red-600 to-red-700 text-white py-16 md:py-24">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <p className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2">
            Programs
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Basketball
          </h1>
          <p className="text-lg md:text-xl text-red-50 max-w-2xl mx-auto">
            Our basketball program builds talent, teamwork, and community
            through training and competition.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16 bg-white">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            About the Program
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">{ABOUT_TEXT}</p>
        </div>
      </section>
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Squad
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-14">
            Meet our basketball team
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {players.map((p, index) => (
              <article
                key={p.number}
                data-basketball-player-index={index}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] relative bg-gray-200 overflow-hidden">
                  <img
                    src={p.image || undefined}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shadow">
                    {p.number}
                  </div>
                </div>
                <div className="p-4">
                  <p
                    className="font-semibold text-gray-900 truncate"
                    title={p.name}
                  >
                    {p.name}
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    {p.position}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Gallery
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-14">
            Moments from our basketball program
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: GALLERY_IMAGE_PATHS.length }).map((_, i) => (
              <div
                key={GALLERY_IMAGE_PATHS[i] ?? i}
                data-basketball-gallery-index={i}
                className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}
              >
                <div className="aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {/* image src is set only after the card is near viewport */}
                  <img
                    src={galleryImages[i] ?? undefined}
                    alt={"Basketball " + (i + 1)}
                    loading="eager"
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
      <section className="py-8 bg-gray-50 border-t border-gray-100">
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
