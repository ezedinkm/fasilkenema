import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";

import { listTeamPlayers, type TeamPlayer } from "@/lib/teamAdminApi";

export default function Junior() {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listTeamPlayers("admin.team.football.junior");
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
      {/* <section className="bg-gradient-to-b from-red-600 to-red-700 text-white py-16 md:py-24">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <p className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2">Team</p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Junior</h1>
          <p className="text-lg md:text-xl text-red-50 max-w-2xl mx-auto">
            Junior Fasil FC — 29 players
          </p>
        </div>
      </section> */}

      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="w-full flex flex-col items-center justify-center py-10 md:py-14">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center tracking-wide">
              FASIL S.C. Junior Squad
            </h2>

            <p className="text-gray-600 text-center mb-3 text-sm md:text-base max-w-xl">
              Player profiles including name, position, and nationality.
            </p>

            <p className="text-gray-500 text-center mb-10 md:mb-14 text-sm md:text-base max-w-2xl leading-relaxed">
              Meet the future stars of FASIL S.C. young talents developing
              skills, discipline, and passion for the game
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
                    loading="eager"
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
