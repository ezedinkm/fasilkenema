import { useEffect, useRef, useState } from "react";
import { getLocalAssetUrl } from "@/lib/localAssets";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";

const GONDER_IMAGE_URL = getLocalAssetUrl("gonder/Gonder.webp");

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
    <PublicLayout>
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

              <p className="text-gray-600 mt-4 leading-relaxed text-base text-justify">
                Gondar stands as the historical heart of northern Ethiopia, a
                city rich in culture, heritage, and pride. It is within this
                setting that FASIL S.C was founded, drawing inspiration from the
                legacy and resilience of its people. The club’s identity is
                closely tied to the spirit of Gondar—strong, passionate, and
                united. From its earliest days, FASIL S.C has represented more
                than just football; it has embodied a sense of belonging for the
                community. The support from the people of Gondar has played a
                crucial role in shaping the club’s journey. Fans fill the
                stadium with energy and loyalty, motivating players to perform
                at their best. The Gondar City Administration has also been key
                in the club’s development, providing sponsorship and support.
                Through community programs and youth initiatives, FASIL S.C
                continues to grow on and off the field, strengthening its bond
                with the city it represents.
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
    </PublicLayout>
  );
}
