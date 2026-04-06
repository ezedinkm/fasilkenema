import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  Mic2,
  Users,
  Building2,
  Ticket,
  Coffee,
} from "lucide-react";
import { Link } from "wouter";
import news1 from "@/assets/banner/Banner1.jpg";

export default function MeetingsEvents() {
  return (
    <PublicLayout>
      <div className="bg-white">
        {/* Event Types */}
        <section className="py-14 md:py-20 bg-slate-50/80">
          <div className="container px-4 max-w-6xl mx-auto">
            <div className="max-w-2xl mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Key Meetings and Events Throughout the Season
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Fasil Kenema Sport Club operates with transparency and
                professionalism. Members and partners are invited to key
                gatherings that shape the future of the club, celebrate
                achievements and strengthen community ties.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-4">
                  <Users className="h-3.5 w-3.5" />
                  Members
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  General Assemblies
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Official annual and extraordinary meetings where members
                  receive reports, review the season and contribute to the
                  long-term direction of the club.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-4">
                  <Mic2 className="h-3.5 w-3.5" />
                  Media
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  Press Conferences
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pre- and post-match briefings, special announcements and
                  signing presentations conducted in a modern, media-friendly
                  environment.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-4">
                  <Building2 className="h-3.5 w-3.5" />
                  Partners
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  Sponsor &amp; Corporate Events
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tailored experiences for our partners, including networking
                  evenings, brand activations and exclusive matchday
                  hospitality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hospitality / Hosting */}
        <section className="py-14 md:py-20 bg-white">
          <div className="container px-4 max-w-6xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.1fr,380px] items-start">
              <div className="space-y-6">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">
                  Host Your Event with Fasil Kenema
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Selected club spaces are available for carefully curated
                  external events: from workshops and seminars to
                  community-focused initiatives and partner activations. Every
                  event is delivered with the same professional standards that
                  guide the club on and off the pitch.
                </p>
                <p className="text-slate-600 text-base leading-relaxed">
                  Our team can support you with basic audio-visual set-up,
                  coordinated branding, and dedicated liaison staff on the day.
                  Together we can create a unique experience in the home of
                  Fasil Kenema Sport Club.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 flex items-start gap-3">
                    <Ticket className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Matchday Hospitality
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Arrange boxes, lounges or group seating experiences
                        around key fixtures.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 flex items-start gap-3">
                    <Coffee className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Meetings &amp; Workshops
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Host strategy sessions, leadership programmes or
                        community meetings in a football-inspired setting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-800 text-white p-6 space-y-4 shadow-lg">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Event Enquiries
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To discuss hosting a meeting or event with Fasil Kenema,
                  please contact the club via the official channels listed on
                  our Contact page. Provide key details such as date, type of
                  event, expected guest numbers and specific requirements.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All requests are reviewed individually to ensure alignment
                  with the club&apos;s schedule, values and ongoing commitments.
                </p>
                <div className="pt-2">
                  <Link href="/contact">
                    <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 font-medium uppercase tracking-wide rounded-md h-10 text-xs">
                      Contact The Club
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
