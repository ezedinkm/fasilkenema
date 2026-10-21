import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

interface CareerJob {
  id: number;
  title: string;
  department: string | null;
  location: string;
  employmentType: string;
  summary: string | null;
  description: string;
  requirements: string | null;
  applicationEmail: string | null;
  applicationUrl: string | null;
  closingDate: string | null;
}

function formatClosingDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export default function Careers() {
  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useQuery<CareerJob[]>({
    queryKey: ["/api/careers"],
    queryFn: async () => {
      const response = await fetch("/api/careers");
      if (!response.ok) throw new Error("Failed to load career openings.");
      return response.json();
    },
  });

  return (
    <PublicLayout>
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-slate-950 text-white">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-200">
              Fasil Kenema S.C.
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold uppercase sm:text-5xl lg:text-6xl">
              Careers
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Help us build a stronger club and create more opportunities for
              our community.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
              Work with us
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold uppercase text-slate-950 sm:text-3xl">
              Current openings
            </h2>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Loading career openings…
            </div>
          ) : isError ? (
            <div
              className="rounded-2xl border border-red-200 bg-white p-8 text-center text-slate-600"
              role="alert"
            >
              Career openings could not be loaded. Please try again later.
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <Briefcase className="mx-auto h-10 w-10 text-red-700" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No open positions right now
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                Please check back later for new opportunities with Fasil Kenema
                S.C.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {jobs.map((job) => {
                const safeApplicationUrl =
                  job.applicationUrl &&
                  /^https?:\/\//i.test(job.applicationUrl)
                    ? job.applicationUrl
                    : null;
                const applyHref =
                  safeApplicationUrl ||
                  (job.applicationEmail
                    ? `mailto:${job.applicationEmail}`
                    : null);

                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="font-heading text-xl font-bold text-slate-950 sm:text-2xl">
                          {job.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                          {job.department && (
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="h-4 w-4 text-red-700" />
                              {job.department}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-red-700" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4 text-red-700" />
                            {job.employmentType}
                          </span>
                          {job.closingDate && (
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-4 w-4 text-red-700" />
                              Apply by {formatClosingDate(job.closingDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      {applyHref && (
                        <a
                          href={applyHref}
                          target={safeApplicationUrl ? "_blank" : undefined}
                          rel={
                            safeApplicationUrl
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                        >
                          {safeApplicationUrl ? "Apply now" : "Apply by email"}
                          {safeApplicationUrl ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </a>
                      )}
                    </div>

                    {job.summary && (
                      <p className="mt-5 border-l-2 border-red-200 pl-4 text-base font-medium leading-7 text-slate-700">
                        {job.summary}
                      </p>
                    )}
                    <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {job.description}
                    </div>
                    {job.requirements && (
                      <section className="mt-6 border-t border-slate-100 pt-5">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                          Requirements
                        </h4>
                        <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                          {job.requirements}
                        </div>
                      </section>
                    )}
                    {!applyHref && (
                      <p className="mt-5 text-sm text-slate-500">
                        Application instructions will be shared by the club.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
