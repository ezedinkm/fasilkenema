import PublicLayout from "@/components/PublicLayout";
import { ASSETS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Target,
  Users,
  Sparkles,
  Shield,
  Globe2,
} from "lucide-react";

export default function JuniorFasil() {
  return (
    <PublicLayout>
      <div className="bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-slate-950 to-amber-700 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="container relative z-10 px-4 py-16 md:py-22 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.15fr,0.9fr] items-center">
              <div>
                <Badge className="mb-4 bg-white/10 border border-white/30 text-[11px] uppercase tracking-[0.25em] rounded-sm">
                  Junior Fasil Academy
                </Badge>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                  Developing Tomorrow&apos;s Fasil Stars
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/85 max-w-xl mb-8">
                  Junior Fasil is the official youth pathway of Fasil Kenema
                  Sport Club, nurturing young talents from Gondar and across
                  Ethiopia with modern coaching and strong values.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    U13 • U15 • U17 • U20
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]">
                    <Shield className="mr-2 h-4 w-4" />
                    Professional Standards
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-red-500 hover:bg-red-600 text-white font-display uppercase tracking-[0.2em] rounded-sm px-8 h-11 text-xs">
                    Academy Registration
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/70 text-white hover:bg-white/10 font-display uppercase tracking-[0.2em] rounded-sm px-8 h-11 text-xs"
                  >
                    Trial Information
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 shadow-2xl shadow-black/40">
                  <div className="aspect-[4/3] w-full">
                    <img
                      src="https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200&q=80"
                      alt="Junior Fasil players in training"
                      className="h-full w-full object-cover opacity-90"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-white/60 mb-1">
                        Pathway To First Team
                      </p>
                      <p className="text-sm font-semibold">
                        Structured academy program from grassroots to
                        professional level.
                      </p>
                    </div>
                    <img
                      src={ASSETS.logo}
                      alt="Fasil Kenema logo"
                      className="h-11 w-11 rounded-full border border-white/40 bg-white/95 p-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy & Age Groups */}
        <section className="py-16 bg-slate-50">
          <div className="container px-4 max-w-6xl space-y-12">
            <div className="grid gap-10 lg:grid-cols-[1.2fr,0.95fr] items-start">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                  Football Education, Character, and Community
                </h2>
                <p className="text-base md:text-lg text-slate-700 mb-4">
                  Junior Fasil is more than a training program – it is a
                  complete football education. Players learn technical skills,
                  tactical intelligence and physical preparation, but also
                  discipline, teamwork and respect for the game.
                </p>
                <p className="text-base md:text-lg text-slate-700 mb-4">
                  Our coaches follow a long-term methodology that keeps players
                  connected to the club identity and culture of Gondar. Every
                  age group has clear principles of play, ensuring a smooth
                  pathway towards the senior teams.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-1">
                      Core Focus
                    </p>
                    <p className="font-semibold text-slate-900 mb-1">
                      Technique &amp; Intelligence
                    </p>
                    <p className="text-sm text-slate-600">
                      Ball mastery, decision-making under pressure, and
                      understanding of space.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-1">
                      Off The Pitch
                    </p>
                    <p className="font-semibold text-slate-900 mb-1">
                      Education &amp; Support
                    </p>
                    <p className="text-sm text-slate-600">
                      Respect for school, family and community is at the heart
                      of the academy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-amber-50 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-red-500" />
                    <h3 className="font-heading text-lg font-semibold">
                      Structured Age Groups
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>
                      <span className="font-semibold text-red-700">
                        U13 Foundation
                      </span>{" "}
                      – first steps in structured training and understanding the
                      game.
                    </li>
                    <li>
                      <span className="font-semibold text-red-700">
                        U15 Development
                      </span>{" "}
                      – technical growth, basic tactics and competitive
                      experience.
                    </li>
                    <li>
                      <span className="font-semibold text-red-700">
                        U17 Performance
                      </span>{" "}
                      – higher-intensity competition and tactical identity.
                    </li>
                    <li>
                      <span className="font-semibold text-red-700">
                        U20 Elite
                      </span>{" "}
                      – the last step before Fasil Kenema&apos;s first teams.
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-red-500" />
                    <h3 className="font-heading text-lg font-semibold">
                      Clear Pathway To The Top
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    The academy is integrated with both the men&apos;s and
                    women&apos;s senior teams. Players who show quality,
                    commitment and character are regularly invited to train with
                    higher age groups and, ultimately, the first team.
                  </p>
                  <p className="text-xs text-slate-500">
                    Many of tomorrow&apos;s Fasil Kenema stars will begin their
                    story here, on the training pitches of Junior Fasil.
                  </p>
                </div>
              </div>
            </div>

            {/* Tryouts / Registration */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-red-200 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-red-300" />
                  Open Talent ID
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold">
                  Want to join Junior Fasil?
                </h3>
                <p className="text-sm md:text-base text-white/80 max-w-2xl">
                  Trials are organized several times per year in Gondar and
                  selected partner cities. Players are evaluated on technical
                  ability, game understanding, attitude and potential – not only
                  results.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 font-display uppercase tracking-[0.2em] rounded-sm px-8 h-10 text-[11px]">
                  Register Interest
                </Button>
                <Button
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-display uppercase tracking-[0.2em] rounded-sm px-8 h-10 text-[11px]"
                >
                  Download Info Pack
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Global Vision */}
        <section className="py-14 bg-white border-t border-slate-200">
          <div className="container px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 text-slate-900">
                  Local Roots, Global Vision
                </h2>
                <p className="text-sm md:text-base text-slate-700 mb-3">
                  Junior Fasil is deeply rooted in the communities of Gondar,
                  but the program looks outward: building players who can
                  represent Fasil Kenema, the Ethiopian national teams and clubs
                  around the world.
                </p>
                <p className="text-sm md:text-base text-slate-700">
                  Wherever their journey leads, graduates carry the discipline,
                  hard work and pride of Fasil Kenema Sport Club.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-8 py-6">
                  <Globe2 className="h-10 w-10 text-red-500 mr-4" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">
                      From Gondar To The World
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      Building the next generation of Ethiopian footballers.
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
