import PublicLayout from "@/components/PublicLayout";

const standings = [
  {
    club: "Ethiopian Coffee SC",
    played: 34,
    won: 21,
    draw: 8,
    loss: 5,
    gd: 31,
    pts: 71,
  },
  {
    club: "Saint George SC",
    played: 34,
    won: 20,
    draw: 9,
    loss: 5,
    gd: 27,
    pts: 69,
  },
  {
    club: "Bahir Dar Kenema",
    played: 34,
    won: 19,
    draw: 9,
    loss: 6,
    gd: 23,
    pts: 66,
  },
  {
    club: "Fasil Kenema FC",
    played: 34,
    won: 18,
    draw: 10,
    loss: 6,
    gd: 20,
    pts: 64,
  },
  {
    club: "Wolwalo Adigrat University",
    played: 34,
    won: 16,
    draw: 9,
    loss: 9,
    gd: 11,
    pts: 57,
  },
  {
    club: "Hawassa Ketema",
    played: 34,
    won: 15,
    draw: 10,
    loss: 9,
    gd: 9,
    pts: 55,
  },
  {
    club: "Sidama Bunna",
    played: 34,
    won: 14,
    draw: 11,
    loss: 9,
    gd: 8,
    pts: 53,
  },
  {
    club: "Adama Ketema",
    played: 34,
    won: 14,
    draw: 8,
    loss: 12,
    gd: 3,
    pts: 50,
  },
  {
    club: "Wolaita Dicha",
    played: 34,
    won: 13,
    draw: 10,
    loss: 11,
    gd: 2,
    pts: 49,
  },
  {
    club: "Arbaminch Ketema",
    played: 34,
    won: 12,
    draw: 11,
    loss: 11,
    gd: 0,
    pts: 47,
  },
  {
    club: "Dire Dawa Ketema",
    played: 34,
    won: 12,
    draw: 8,
    loss: 14,
    gd: -4,
    pts: 44,
  },
  {
    club: "Mekele 70 Enderta",
    played: 34,
    won: 11,
    draw: 10,
    loss: 13,
    gd: -5,
    pts: 43,
  },
  {
    club: "Defence Force SC",
    played: 34,
    won: 11,
    draw: 8,
    loss: 15,
    gd: -8,
    pts: 41,
  },
  {
    club: "Jimma Aba Jifar",
    played: 34,
    won: 10,
    draw: 10,
    loss: 14,
    gd: -9,
    pts: 40,
  },
  {
    club: "Hadiya Hossana",
    played: 34,
    won: 10,
    draw: 9,
    loss: 15,
    gd: -10,
    pts: 39,
  },
  {
    club: "Welkite Ketema",
    played: 34,
    won: 9,
    draw: 11,
    loss: 14,
    gd: -12,
    pts: 38,
  },
  {
    club: "Buna Debub Police",
    played: 34,
    won: 8,
    draw: 11,
    loss: 15,
    gd: -15,
    pts: 35,
  },
  {
    club: "Ethio Electric",
    played: 34,
    won: 8,
    draw: 9,
    loss: 17,
    gd: -17,
    pts: 33,
  },
  {
    club: "Shire Endaselassie",
    played: 34,
    won: 7,
    draw: 10,
    loss: 17,
    gd: -19,
    pts: 31,
  },
  {
    club: "Diredawa Police",
    played: 34,
    won: 7,
    draw: 8,
    loss: 19,
    gd: -25,
    pts: 29,
  },
];

const fixtures = [
  {
    home: "Fasil Kenema FC",
    away: "Saint George SC",
    date: "Sun, 17 Nov 2025",
    time: "18:00",
    stadium: "Bahir Dar Stadium",
    keyMatch: true,
  },
  {
    home: "Ethiopian Coffee SC",
    away: "Adama Ketema",
    date: "Mon, 18 Nov 2025",
    time: "16:00",
    stadium: "Addis Ababa Stadium",
    keyMatch: false,
  },
  {
    home: "Hawassa Ketema",
    away: "Wolaita Dicha",
    date: "Tue, 19 Nov 2025",
    time: "15:00",
    stadium: "Hawassa University Ground",
    keyMatch: false,
  },
  {
    home: "Bahir Dar Kenema",
    away: "Sidama Bunna",
    date: "Tue, 19 Nov 2025",
    time: "18:30",
    stadium: "Bahir Dar Stadium",
    keyMatch: false,
  },
  {
    home: "Defence Force SC",
    away: "Jimma Aba Jifar",
    date: "Wed, 20 Nov 2025",
    time: "17:00",
    stadium: "Defence Arena",
    keyMatch: false,
  },
];

const results = [
  {
    home: "Fasil Kenema FC",
    away: "Hawassa Ketema",
    score: "2 - 1",
    result: "Win",
  },
  {
    home: "Saint George SC",
    away: "Bahir Dar Kenema",
    score: "1 - 1",
    result: "Draw",
  },
  {
    home: "Adama Ketema",
    away: "Fasil Kenema FC",
    score: "1 - 0",
    result: "Loss",
  },
  {
    home: "Sidama Bunna",
    away: "Ethiopian Coffee SC",
    score: "0 - 3",
    result: "Loss",
  },
  {
    home: "Wolaita Dicha",
    away: "Fasil Kenema FC",
    score: "0 - 2",
    result: "Win",
  },
];

function getResultBadgeClass(result) {
  if (result === "Win") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (result === "Loss") {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function clubInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const CLUB_ABBREVIATIONS = {
  "Ethiopian Coffee SC": "ECS",
  "Saint George SC": "SGS",
  "Bahir Dar Kenema": "BDK",
  "Fasil Kenema FC": "FKF",
  "Wolwalo Adigrat University": "WAU",
  "Hawassa Ketema": "HWK",
  "Sidama Bunna": "SDB",
  "Adama Ketema": "ADK",
  "Wolaita Dicha": "WLD",
  "Arbaminch Ketema": "ABK",
  "Dire Dawa Ketema": "DDK",
  "Mekele 70 Enderta": "M70",
  "Defence Force SC": "DFS",
  "Jimma Aba Jifar": "JAJ",
  "Hadiya Hossana": "HDH",
  "Welkite Ketema": "WLK",
  "Buna Debub Police": "BDP",
  "Ethio Electric": "ETE",
  "Shire Endaselassie": "SHE",
  "Diredawa Police": "DDP",
};

function clubAbbreviation(name) {
  return CLUB_ABBREVIATIONS[name] || clubInitials(name).slice(0, 3);
}

export default function EthiopianLeague() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-6">
          <section className="rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-rose-800 px-4 py-5 shadow-lg md:px-6">
            <div>
              <span className="inline-flex items-center rounded-full border border-yellow-300/50 bg-yellow-300/15 px-3 py-1 text-xs font-semibold tracking-wide text-yellow-100">
                ⭐ Featured Club: Fasil Kenema FC
              </span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Ethiopian Premier League
              </h1>
              <p className="mt-1 text-sm text-red-100/90">
                2025/26 Season Standings
              </p>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
              <div className="border-b border-slate-200 px-4 py-3 md:px-5">
                <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                  League Table
                </h2>
              </div>

              <div className="overflow-hidden">
                <table className="w-full table-fixed text-[11px] text-slate-700 sm:text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-600">
                      <th className="w-[8%] px-1 py-2.5 text-left font-bold">
                        #
                      </th>
                      <th className="w-[40%] px-1 py-2.5 text-left font-bold">
                        Club
                      </th>
                      <th className="w-[7%] px-0.5 py-2.5 text-right font-bold">
                        P
                      </th>
                      <th className="w-[7%] px-0.5 py-2.5 text-right font-bold">
                        W
                      </th>
                      <th className="w-[7%] px-0.5 py-2.5 text-right font-bold">
                        D
                      </th>
                      <th className="w-[7%] px-0.5 py-2.5 text-right font-bold">
                        L
                      </th>
                      <th className="w-[10%] px-0.5 py-2.5 text-right font-bold">
                        GD
                      </th>
                      <th className="w-[14%] px-1 py-2.5 text-right font-bold">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => {
                      const position = index + 1;
                      const isTopFour = position <= 4;
                      const isBottomThree = position >= 18;
                      const isFeatured = team.club === "Fasil Kenema FC";

                      return (
                        <tr
                          key={team.club}
                          className={[
                            "transition-colors duration-200 hover:bg-red-50",
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/60",
                            isTopFour ? "bg-emerald-50" : "",
                            isBottomThree ? "bg-rose-50" : "",
                            isFeatured
                              ? "border-y border-yellow-400/80 bg-yellow-50 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.45)]"
                              : "",
                          ].join(" ")}
                        >
                          <td
                            className={`px-1 py-2.5 font-semibold text-slate-900 ${isFeatured ? "text-[15px]" : ""}`}
                          >
                            {position}
                          </td>
                          <td
                            className={`px-1 py-2.5 ${isFeatured ? "text-[15px]" : ""}`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-gradient-to-br from-red-600 to-rose-600 text-[9px] font-bold text-white shadow-sm sm:h-7 sm:w-7 sm:text-[10px]">
                                {clubInitials(team.club)}
                              </div>
                              <span
                                className="font-semibold text-slate-900"
                                title={team.club}
                              >
                                <span className="sm:hidden">
                                  {clubAbbreviation(team.club)}
                                </span>
                                <span className="hidden sm:inline">
                                  {team.club}
                                </span>
                              </span>
                              {isFeatured ? (
                                <span className="hidden rounded-full border border-yellow-400/60 bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-800 sm:inline-flex">
                                  Featured
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-0.5 py-2.5 text-right tabular-nums">
                            {team.played}
                          </td>
                          <td className="px-0.5 py-2.5 text-right tabular-nums">
                            {team.won}
                          </td>
                          <td className="px-0.5 py-2.5 text-right tabular-nums">
                            {team.draw}
                          </td>
                          <td className="px-0.5 py-2.5 text-right tabular-nums">
                            {team.loss}
                          </td>
                          <td
                            className={`px-0.5 py-2.5 text-right font-semibold tabular-nums ${
                              team.gd >= 0
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                          </td>
                          <td className="px-1 py-2.5 text-right font-extrabold tabular-nums text-slate-900">
                            {team.pts}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Latest Results
                </h2>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5">
                  {results.map((match, idx) => {
                    const includesFasil =
                      match.home === "Fasil Kenema FC" ||
                      match.away === "Fasil Kenema FC";
                    return (
                      <article
                        key={`${match.home}-${match.away}-${idx}`}
                        className={[
                          "rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:scale-[1.01]",
                          includesFasil ? "border-yellow-400 bg-yellow-50" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {match.home}{" "}
                              <span className="text-slate-500">vs</span>{" "}
                              {match.away}
                            </p>
                            <p className="mt-0.5 text-lg font-extrabold text-slate-900">
                              {match.score}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${getResultBadgeClass(match.result)}`}
                          >
                            {match.result}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upcoming Fixtures
                </h2>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5">
                  {fixtures.map((match) => (
                    <article
                      key={`${match.home}-${match.away}-${match.date}`}
                      className={[
                        "rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                        match.keyMatch
                          ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.15)]"
                          : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[15px] font-bold text-slate-900">
                          {match.home}{" "}
                          <span className="text-slate-500">vs</span>{" "}
                          {match.away}
                        </p>
                        {match.keyMatch ? (
                          <span className="rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                            Key Match
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 space-y-0.5 text-sm text-slate-600">
                        <p>
                          {match.date} • {match.time}
                        </p>
                        <p>{match.stadium}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
