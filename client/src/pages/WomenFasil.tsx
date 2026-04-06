import PublicLayout from "@/components/PublicLayout";
import { ASSETS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Star, Calendar, Flag, Heart } from "lucide-react";

export default function WomenFasil() {
  return (
    <PublicLayout>
      <div className="bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-red-600 text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="container relative z-10 px-4 py-16 md:py-24 lg:py-28">
            <div className="grid gap-10 md:grid-cols-[1.2fr,0.9fr] items-center">
              <div>
                <Badge className="mb-4 bg-white/10 border border-white/30 text-xs uppercase tracking-[0.25em] rounded-sm">
                  Fasil Kenema Women
                </Badge>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                  Women&apos;s First Team
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-xl mb-8">
                  The pride of Gondar. A fearless generation of women writing a
                  new chapter for Fasil Kenema Sport Club and Ethiopian
                  football.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                    <Trophy className="mr-2 h-4 w-4 text-yellow-300" />
                    League Contenders
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                    <Users className="mr-2 h-4 w-4" />
                    Home: Gondar Stadium
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                    <Star className="mr-2 h-4 w-4 text-yellow-300" />
                    Rising Talents
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-white text-red-600 hover:bg-gray-100 font-display uppercase tracking-[0.2em] rounded-sm px-8 h-11 text-xs">
                    View Match Days
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/70 text-white hover:bg-white/10 font-display uppercase tracking-[0.2em] rounded-sm px-8 h-11 text-xs"
                  >
                    Support The Team
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/30 bg-gradient-to-tr from-red-900/60 via-red-700/40 to-amber-500/60">
                  <div className="aspect-[4/3] w-full">
                    <img
                      src="https://images.unsplash.com/photo-1515516969-d465f0f4d1c5?w=1200&q=80"
                      alt="Fasil Kenema Women's Team in action"
                      className="h-full w-full object-cover mix-blend-luminosity opacity-90"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-white/60 mb-1">
                        2025/26 Season
                      </p>
                      <p className="text-sm font-semibold">
                        Fasil Kenema Women&apos;s Premier League Squad
                      </p>
                    </div>
                    <img
                      src={ASSETS.logo}
                      alt="Fasil Kenema logo"
                      className="h-11 w-11 rounded-full border border-white/40 bg-white/90 p-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Facts */}
        <section className="bg-slate-950 text-white py-12 md:py-16">
          <div className="container px-4">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-2">
                  Founded
                </p>
                <p className="text-3xl font-heading font-bold mb-1">2019</p>
                <p className="text-sm text-white/70">
                  The modern women&apos;s team era of Fasil Kenema, built on
                  ambition, discipline and local pride.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-2">
                  Home Colours
                </p>
                <p className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    <span className="h-3 w-3 rounded-full bg-yellow-400 border border-white/70" />
                    Red &amp; Yellow
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    <span className="h-3 w-3 rounded-full bg-white border border-white/40" />
                    Black Trim
                  </span>
                </p>
                <p className="text-sm text-white/70">
                  Inspired by the royal colours of Gondar and the historic Fasil
                  Ghebbi.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-2">
                  Identity
                </p>
                <p className="text-3xl font-heading font-bold mb-1">Bravery</p>
                <p className="text-sm text-white/70">
                  High-intensity pressing, fearless attacking football and total
                  commitment to the badge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Squad + Philosophy */}
        <section className="py-16 bg-slate-50">
          <div className="container px-4 max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[1.2fr,0.9fr] items-start">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-slate-900">
                  A New Era of Women&apos;s Football in Gondar
                </h2>
                <p className="text-base md:text-lg text-slate-700 mb-6">
                  Fasil Kenema Women embody the spirit of the city – resilient,
                  courageous and endlessly ambitious. The squad combines
                  experienced leaders with exciting young talents drawn from
                  academies across Amhara and beyond.
                </p>
                <p className="text-base md:text-lg text-slate-700 mb-6">
                  Every home match at Gondar Stadium is a celebration of
                  women&apos;s football. Families, students and lifelong Fasil
                  fans fill the stands, creating one of the most passionate
                  atmospheres in Ethiopian football.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-1">
                      Playing Style
                    </p>
                    <p className="font-semibold text-slate-900 mb-1">
                      Fast, fearless, attacking
                    </p>
                    <p className="text-sm text-slate-600">
                      Quick transitions, aggressive pressing and brave 1v1 duels
                      across the pitch.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-1">
                      Values
                    </p>
                    <p className="font-semibold text-slate-900 mb-1">
                      Respect, discipline, unity
                    </p>
                    <p className="text-sm text-slate-600">
                      Built on strong leadership, community, and equal
                      opportunity for all players.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-amber-50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-xl font-semibold text-red-700">
                      2025/26 Key Objectives
                    </h3>
                    <Flag className="h-5 w-5 text-red-500" />
                  </div>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li>
                      • Compete at the top end of the Women&apos;s Premier
                      League.
                    </li>
                    <li>
                      • Qualify more academy players for the senior squad.
                    </li>
                    <li>
                      • Strengthen our presence in CAF women&apos;s
                      competitions.
                    </li>
                    <li>
                      • Inspire more young girls across Gondar and Ethiopia.
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-red-500" />
                    <h3 className="font-heading text-lg font-semibold">
                      Match Days in Gondar
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Women&apos;s fixtures usually take place on weekend
                    afternoons, creating a family-friendly atmosphere at the
                    stadium. Keep an eye on our official channels for full
                    schedules and ticket details.
                  </p>
                  <p className="text-xs text-slate-500">
                    Fixture details are published on the official Fasil Kenema
                    platforms and partner media outlets.
                  </p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 flex items-center gap-4">
                  <Heart className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">
                      Stand with Fasil Kenema Women
                    </p>
                    <p className="text-xs text-red-700/80">
                      Your membership, tickets and voice help grow women&apos;s
                      football in Gondar and across Ethiopia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
