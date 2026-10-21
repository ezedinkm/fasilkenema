import PublicLayout from "@/components/PublicLayout";
import { useQuery } from "@tanstack/react-query";
import type { Page } from "@shared/schema";

interface StaticTextPageProps {
  slug: string;
  fallbackTitle: string;
}

function StaticTextPage({ slug, fallbackTitle }: StaticTextPageProps) {
  const { data: page, isLoading, isError } = useQuery<Page>({
    queryKey: [`/api/pages/${slug}`],
  });

  const hasEnglish = Boolean(page?.contentEn?.trim());
  const hasAmharic = Boolean(page?.contentAm?.trim());

  return (
    <PublicLayout>
      <main className="min-h-[55vh] bg-slate-50 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
            Fasil Kenema S.C.
          </p>
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {page?.titleEn || fallbackTitle}
          </h1>

          {isLoading ? (
            <p className="text-slate-500" role="status">Loading page…</p>
          ) : isError || !page ? (
            <p className="text-slate-600">
              This page has not been published yet. Please check back later.
            </p>
          ) : !hasEnglish && !hasAmharic ? (
            <p className="text-slate-600">
              This page is being prepared by the club.
            </p>
          ) : (
            <div className="space-y-8 text-base leading-8 text-slate-700">
              {hasEnglish && (
                <div className="whitespace-pre-wrap break-words">
                  {page.contentEn}
                </div>
              )}
              {hasAmharic && (
                <section
                  aria-label="Amharic"
                  className={hasEnglish ? "border-t border-slate-200 pt-8" : ""}
                  lang="am"
                  dir="auto"
                >
                  <div className="whitespace-pre-wrap break-words">
                    {page.contentAm}
                  </div>
                </section>
              )}
            </div>
          )}
        </article>
      </main>
    </PublicLayout>
  );
}

export function PrivacyPolicyPage() {
  return <StaticTextPage slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}

export function TermsOfServicePage() {
  return <StaticTextPage slug="terms-of-service" fallbackTitle="Terms of Service" />;
}
