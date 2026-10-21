import type { FC } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { getLocalAssetUrl } from "@/lib/localAssets";

interface Partner {
  name: string;
  category: string;
  image: string;
  alt: string;
}

const partners: Partner[] = [
  {
    name: "Dashen Beer",
    category: "Beverage",
    image: getLocalAssetUrl("partners/dashen-beer.webp") ?? "",
    alt: "Dashen Beer logo",
  },
  {
    name: "Gondar City Administration",
    category: "Community",
    image: getLocalAssetUrl("partners/gondar-city-administration.webp") ?? "",
    alt: "Gondar City Administration logo",
  },
  {
    name: "University of Gondar",
    category: "Education",
    image: getLocalAssetUrl("partners/university-of-gondar.webp") ?? "",
    alt: "University of Gondar logo",
  },
  {
    name: "WANAW Sports Wear",
    category: "Sportswear",
    image: getLocalAssetUrl("partners/wanaw-sportswear.webp") ?? "",
    alt: "WANAW Sports Wear logo",
  },
  {
    name: "Tina Mart",
    category: "Retail",
    image: getLocalAssetUrl("partners/tina-mart.webp") ?? "",
    alt: "Tina Mart logo",
  },
];

const Partners: FC = () => (
  <PublicLayout>
    <main className="min-h-screen bg-[#f8f7f5]">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-36 -z-10 h-96 w-96 rounded-full bg-red-600/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 left-1/4 -z-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-red-300">
            Fasil Kenema S.C.
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold uppercase leading-tight sm:text-5xl lg:text-6xl">
            Stronger together
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Meet the organizations standing with Fasil Kenema and supporting our
            club and community.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {partners.length} featured partners
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-700">
              The team behind the team
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold uppercase text-slate-950 sm:text-3xl">
              Our partners
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Their support helps strengthen football and create more opportunities
            across Gondar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner, index) => (
            <article
              key={partner.name}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
            >
              <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white p-7 sm:p-9">
                <span className="absolute left-5 top-5 text-xs font-bold tracking-[0.16em] text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <img
                  src={partner.image}
                  alt={partner.alt}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <div className="flex min-h-24 items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
                <h3 className="font-semibold leading-snug text-slate-950">
                  {partner.name}
                </h3>
                <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                  {partner.category}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase text-slate-950">
              Interested in partnering with us?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Get in touch with Fasil Kenema S.C.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            Contact the club
            <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </div>
      </section>
    </main>
  </PublicLayout>
);

export default Partners;
