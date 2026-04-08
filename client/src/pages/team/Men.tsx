import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";

import { listTeamPlayers, type TeamPlayer } from "@/lib/teamAdminApi";

export default function Men() {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listTeamPlayers("admin.team.football.men");
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
      {/* <section className="bg-white  py-8 md:py-12 relative overflow-hidden">
        <div className="container-full bg-red-600 text-white mx-auto text-center relative z-10 w-full">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

          <p className="text-white text-sm font-semibold uppercase tracking-wider mb-1">Team</p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white">Men</h1>
          <p className="text-base md:text-lg text-red-600/90 max-w-2xl mx-auto">
            Fasil Kenema first team
            <br />
            32 players
          </p>
        </div>
      </section> */}

      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="w-full flex flex-col items-center justify-center py-10 md:py-14">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center tracking-wide">
              Fasil S.C. Men's Squad
            </h2>

            <p className="text-gray-600 text-center mb-3 text-sm md:text-base max-w-xl">
              Player profiles including name, position, and nationality.
            </p>

            <p className="text-gray-500 text-center mb-10 md:mb-14 text-sm md:text-base max-w-2xl leading-relaxed">
              Meet the warriors representing Fasil Kenema S.C. a balanced squad
              of experienced leaders and rising talents, united by passion,
              discipline, and the ambition to achieve greatness on and off the
              pitch.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
            {players.map((player) => (
              <article
                key={player.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                  <img
                    src={player.image || undefined}
                    alt={player.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <p
                    className="font-semibold text-gray-900 text-sm truncate"
                    title={player.name}
                  >
                    {player.name}
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-0.5">
                    {player.position}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {player.nationality}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container px-4 max-w-6xl mx-auto text-center">
          <Link
            href="/"
            className="text-red-600 font-semibold hover:text-red-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
