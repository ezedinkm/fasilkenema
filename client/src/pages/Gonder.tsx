import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PublicLayout from "@/components/PublicLayout";
import {
  getManagedPageConfig,
  parseManagedPageContent,
} from "@/lib/managedPages";
import type { Page } from "@shared/schema";

const DEFAULT_PAGE = getManagedPageConfig("gondar")!;

export default function Gonder() {
  const { data: page } = useQuery<Page>({
    queryKey: ["/api/pages/gondar"],
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
  const [leadSection, ...featureSections] = sections;

  return (
    <PublicLayout>
      <main className="min-h-[65vh] bg-gradient-to-b from-slate-50 via-white to-red-50/40 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm font-bold uppercase tracking-wider text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Home City Story
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold text-slate-900 md:text-5xl">
              {page?.titleEn || DEFAULT_PAGE.title}
            </h1>
            {content.intro && (
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {content.intro}
              </p>
            )}
          </header>

          {leadSection && (
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div
                className={
                  leadSection.imageUrl
                    ? "grid md:grid-cols-2"
                    : "grid grid-cols-1"
                }
              >
                {leadSection.imageUrl && (
                  <img
                    src={leadSection.imageUrl}
                    alt={leadSection.imageAlt || leadSection.heading}
                    loading="eager"
                    className="h-full min-h-72 w-full object-cover md:min-h-[26rem]"
                  />
                )}
                <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                  {leadSection.heading && (
                    <h2 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">
                      {leadSection.heading}
                    </h2>
                  )}
                  {leadSection.text && (
                    <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">
                      {leadSection.text}
                    </p>
                  )}
                </div>
              </div>
            </article>
          )}

          {featureSections.length > 0 && (
            <section className="mt-8 grid gap-5 sm:grid-cols-2">
              {featureSections.map((section, index) => (
                <article
                  key={`${section.heading}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {section.imageUrl && (
                    <img
                      src={section.imageUrl}
                      alt={section.imageAlt || section.heading}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  )}
                  <div className="p-5 sm:p-6">
                    {section.heading && (
                      <h2 className="font-heading text-xl font-bold text-red-700">
                        {section.heading}
                      </h2>
                    )}
                    {section.text && (
                      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                        {section.text}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/stadium"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition-colors hover:bg-red-700"
            >
              Visit Stadium
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white px-5 py-3 font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
