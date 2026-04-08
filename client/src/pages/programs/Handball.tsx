import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";

import { listTeamPlayers, type TeamPlayer } from "@/lib/teamAdminApi";

export default function Handball() {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listTeamPlayers("admin.team.handball");
        if (cancelled) return;
        setPlayers(data);
      } catch {
        if (cancelled) return;
        setPlayers([]);
      }
    })();
  }, []);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-red-600 to-red-700 text-white py-16 md:py-24">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <p className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2">
            Programs
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Handball
          </h1>
          <p className="text-lg md:text-xl text-red-50 max-w-2xl mx-auto">
            Our handball section runs regular training and competes in domestic
            competitions.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Squad
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-14">
            18 players — meet our handball team
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6">
            {players.map((player) => (
              <article
                key={player.id}
                className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors"
              >
                <div className="aspect-square relative bg-gray-200 overflow-hidden">
                  <img
                    src={player.image || undefined}
                    alt={player.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 md:p-4 text-center">
                  <p
                    className="font-semibold text-gray-900 text-sm md:text-base truncate"
                    title={player.name}
                  >
                    {player.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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
