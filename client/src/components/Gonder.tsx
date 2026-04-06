import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const GONDER_TITLE = "Gondar & Fasil Kenema";
const GONDER_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRpvLcl859cyWCdJ82_JgATcDiEect6yPrfw&s";

export default function Gonder() {
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
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Home City Story
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              {GONDER_TITLE}
            </h2>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Gondar is the historical heart of Ethiopia’s north—and it is also
              where Fasil Kenema FC’s spirit is rooted. The club’s identity is
              shaped by local support, with the Gondar City Administration
              sponsoring Fasil Kenema and helping the team grow through
              community programs.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-red-600 font-heading text-2xl font-bold">
                  Funding
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Built and supported by Gondar’s community.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-red-600 font-heading text-2xl font-bold">
                  Sponsorship
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Gondar City Administration backs Fasil Kenema.
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

          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600/15 to-amber-500/15 rounded-[2rem] blur-[10px]" />

            <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {/* Placeholder while image loads */}
                {!shouldLoadImage && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                )}

                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaRLJLRpTA7AdF9bWwUyRDhH49r_yE-hF9eg&s"
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
                    Sponsor of Fasil Kenema
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
