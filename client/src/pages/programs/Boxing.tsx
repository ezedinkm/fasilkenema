import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";
import { getLocalAssetUrl } from "@/lib/localAssets";
import { listTeamPlayers, type TeamPlayer } from "@/lib/teamAdminApi";

const heroImage = getLocalAssetUrl("box/1.jpg");

const ABOUT_TEXT = `The boxing program at Fasil Kenema Sport Club builds discipline, fitness, and competitive spirit. We offer training for beginners and support athletes who compete at regional and national level. Our coaches focus on technique, conditioning, and mental strength. The program is open to youth and adults, with separate sessions for competitive boxers and fitness-oriented participants.`;

export default function Boxing() {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listTeamPlayers("admin.team.box");
        if (cancelled) return;
        setPlayers(data);
      } catch {
        if (cancelled) return;
        setPlayers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white min-h-[50vh] flex items-end">
        {heroImage && (
          <img
            src={heroImage}
            alt="Boxing at Fasil Kenema"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
        <div className="container px-4 py-16 md:py-24 max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-red-300 text-sm font-semibold uppercase tracking-wider mb-2">
            Programs
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Boxing
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Discipline, fitness, and competitive spirit — our boxing program
            builds champions.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            About the Program
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">{ABOUT_TEXT}</p>
        </div>
      </section>

      {/* Squad — 8 players */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Squad
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-14">
            Meet our boxers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
            {players.map((player) => (
              <article
                key={player.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative bg-gray-200 overflow-hidden">
                  <img
                    src={player.image || undefined}
                    alt={player.name}
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="font-semibold text-gray-900">{player.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Single general photo */}
      {heroImage && (
      <section className="py-12 md:py-16 bg-white">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[16/10] bg-gray-100">
            <img
              src={heroImage}
              alt="Fasil Kenema Boxing"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      )}

      {/* Back link */}
      <section className="py-8 bg-gray-50 border-t border-gray-100">
        <div className="container px-4 max-w-6xl mx-auto text-center">
          <Link
            href="/programs"
            className="text-red-600 font-semibold hover:text-red-700 hover:underline"
          >
            ← Back to Programs
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
