import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PublicLayout from "@/components/PublicLayout";
import {
  getManagedPageConfig,
  parseManagedPageContent,
} from "@/lib/managedPages";
import type { Page } from "@shared/schema";

const DEFAULT_PAGE = getManagedPageConfig("stadium")!;

export default function Stadium() {
  const { data: page } = useQuery<Page>({
    queryKey: ["/api/pages/stadium"],
  });
  const content = parseManagedPageContent(page?.contentEn, {
    intro: DEFAULT_PAGE.intro,
    sections: DEFAULT_PAGE.sections,
  });
  const sections = content.sections.filter(
    (section) =>
      section.heading.trim() ||
      section.text.trim() ||
      section.imageUrl.trim(),
  );
  const heroImage = sections.find((section) => section.imageUrl)?.imageUrl;
  const storySections = sections.filter((section) => section.text.trim());
  const gallerySections = sections.filter(
    (section) => section.imageUrl.trim() && !section.text.trim(),
  );

  return (
    <PublicLayout>
      <section className="relative flex min-h-[45vh] items-end overflow-hidden bg-slate-950 text-white">
        {heroImage && (
          <img
            src={heroImage}
            alt={sections.find((section) => section.imageUrl)?.imageAlt || ""}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/20" />
        <div className="container relative z-10 mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-red-300">
            About · Gondar · Ethiopia
          </p>
          <h1 className="mb-4 font-heading text-4xl font-bold md:text-5xl lg:text-6xl">
            {page?.titleEn || DEFAULT_PAGE.title}
          </h1>
          {content.intro && (
            <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-200">
              {content.intro}
            </p>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-red-50/50 py-14 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-9 border-l-4 border-red-600 pl-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
              Fasil Kenema Sport Club
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-slate-900 md:text-3xl">
              The story of our home ground
            </h2>
          </div>

          <div className="space-y-6">
            {storySections.map((section, index) => {
              const language =
                /[\u1200-\u137f]/.test(section.heading + section.text)
                  ? "am"
                  : undefined;
              return (
                <article
                  key={`${section.heading}-${index}`}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div
                    className={
                      section.imageUrl && section.text.trim()
                        ? "grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
                        : ""
                    }
                  >
                    {section.imageUrl && (
                      <img
                        src={section.imageUrl}
                        alt={section.imageAlt || section.heading}
                        loading="lazy"
                        className={
                          section.text.trim()
                            ? "h-full min-h-64 w-full object-cover md:min-h-80"
                            : "aspect-[16/8] w-full object-cover"
                        }
                      />
                    )}
                    {(section.heading || section.text) && (
                      <div className="p-6 sm:p-8 md:p-10">
                        {section.heading && (
                          <h3
                            className="mb-4 border-l-2 border-red-500 pl-4 font-heading text-xl font-bold text-slate-900 md:text-2xl"
                            lang={language}
                            dir={language ? "auto" : undefined}
                          >
                            {section.heading}
                          </h3>
                        )}
                        {section.text && (
                          <p
                            className="whitespace-pre-wrap text-base leading-8 text-slate-700"
                            lang={language}
                            dir={language ? "auto" : undefined}
                          >
                            {section.text}
                          </p>
                        )}
                      </div>
                    )}
                    {section.imageUrl && !section.text.trim() && section.heading && (
                      <div className="bg-slate-950 px-5 py-4">
                        <h3 className="font-semibold text-white">
                          {section.heading}
                        </h3>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {gallerySections.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
                  The home of Fasil Kenema
                </p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-slate-900 md:text-3xl">
                  Stadium Gallery
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {gallerySections.map((section, index) => (
                  <article
                    key={`${section.heading}-${index}`}
                    className="group overflow-hidden rounded-2xl bg-slate-950 shadow-lg ring-1 ring-slate-900/10"
                  >
                    <img
                      src={section.imageUrl}
                      alt={section.imageAlt || section.heading}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {section.heading && (
                      <h3 className="px-5 py-4 text-sm font-semibold text-white">
                        {section.heading}
                      </h3>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <Link
            href="/about"
            className="font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            ← Back to About
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
