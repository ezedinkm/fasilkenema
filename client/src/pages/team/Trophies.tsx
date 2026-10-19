import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { getLocalAssetUrl } from "@/lib/localAssets";

const trophy1 = getLocalAssetUrl("Trophies and honors/trophy (1).jpg");
const trophy3 = getLocalAssetUrl("Trophies and honors/trophy (3).jpg");
const trophy4 = getLocalAssetUrl("Trophies and honors/trophy (4).jpg");
const trophy5 = getLocalAssetUrl("Trophies and honors/trophy (5).jpg");
const trophy6 = getLocalAssetUrl("Trophies and honors/trophy (6).jpg");
const trophy7 = getLocalAssetUrl("Trophies and honors/trophy (7).jpg");
const trophy10 = getLocalAssetUrl("Trophies and honors/trophy (10).jpg");
const celebrating2013 = getLocalAssetUrl("Trophies and honors/ቤትኪንግ የኢትዮጵያ ፕሪሚየር ሊግ በ2013 ዓ.ም አሸናፊ። (2013 ዓ.ም) copy 2.jpg");
const addisAbabaCup = getLocalAssetUrl("Trophies and honors/18ኛዉ የአዲስአበባ ከተማ ዋንጫ አሸናፊ .jpg");
const premierLeagueChampions = getLocalAssetUrl("Trophies and honors/የኢትዮጵያ ፕሪሚየር ሊግ ክለቦች የአሸናፊዎች አሸናፊ ዋንጫ .jpg");
const mensKnockoutCup = getLocalAssetUrl("Trophies and honors/የኢትዮጵያ ፕሪሚየር ሊግ ክለቦች የወንዶች ጥሎ ማለፍ ዋንጫ አሸናፊ.jpg");
const federationHighLeagueChampions = getLocalAssetUrl("Trophies and honors/በኢትዮጵያ እግርኳስ ፌደረሽን የከፍተኛ ሊግ የአሸናፊዎች አሸናፊ.jpg");
const federationHighLeagueGroupA = getLocalAssetUrl("Trophies and honors/በኢትዮጵያ እግርኳስ ፌደረሽን የከፍተኛ ሊግ ምድብ ሀ  አሸናፊ.png");
const nationalLeagueNorthGroupL = getLocalAssetUrl("Trophies and honors/የብሔራዊ ሊግ በሰሜን ዞን ምድብ ለ አሸናፊ.png");

type Trophy = {
  no: number;
  name: string;
  english: string;
  year: string;
  place: string;
  image?: string;
};

const TROPHIES: Trophy[] = [
  {
    no: 1,
    name: "የኢትዮጵያ ፕሪሚየር ሊግ ክለቦች የአሸናፊዎች አሸናፊ ዋንጫ",
    english: "Ethiopian Premier League Super Cup Winner",
    year: "2011",
    place: "አዲስ አበባ",
    image: trophy1,
  },
  {
    no: 2,
    name: "የኢትዮጵያ ፕሪሚየር ሊግ ክለቦች የወንዶች ጥሎ ማለፍ ዋንጫ አሸናፊ",
    english: "Ethiopian Premier League Men's Knockout Cup Winner",
    year: "2011",
    place: "ደብረ ዘይት",
    image: trophy10,
  },
  {
    no: 3,
    name: "18ኛዉ የአዲስአበባ ከተማ ዋንጫ አሸናፊ",
    year: "2016",
    english: "18th Addis Ababa City Cup Winner",
    place: "አዲስ አበባ",
    image: trophy3,
  },
  {
    no: 4,
    name: "የቤትኪንግ ኢትዮጵያ ፕሪሚየር ሊግ ዋንጫ አሸናፊ",
    year: "2013",
    english: "BetKing Ethiopian Premier League Champions",
    place: "ሐዋሳ",
    image: trophy4,
  },
  {
    no: 5,
    name: "በኢትዮጵያ እግርኳስ ፌደረሽን የከፍተኛ ሊግ የአሸናፊዎች አሸናፊ",
    english: "High League Champions of Champions",
    year: "2009",
    place: "አዲስ አበባ",
    image: trophy5,
  },
  {
    no: 6,
    name: "በኢትዮጵያ እግርኳስ ፌደረሽን የከፍተኛ ሊግ ምድብ ሀ አሸናፊ",
    english: "High League Group A Winners",
    year: "2008",
    place: "ጎንደር",
    image: trophy6,
  },
  {
    no: 7,
    name: "የብሔራዊ ሊግ በሰሜን ዞን ምድብ ለ አሸናፊ",
    english: "National League North Zone Group “L” Winners",
    year: "2007",
    place: "ድሬዳዋ",
    image: trophy7,
  },
];

const CELEBRATIONS = [
  { title: "Premier League Champions (2013)", image: celebrating2013 },
  { title: "Addis Ababa City Cup Winners", image: addisAbabaCup },
  {
    title: "Premier League Clubs Champions Trophy",
    image: premierLeagueChampions,
  },
  { title: "Men’s Knockout Cup Winners", image: mensKnockoutCup },
  {
    title: "High League Champions of Champions",
    image: federationHighLeagueChampions,
  },
  { title: "High League Group A Winners", image: federationHighLeagueGroupA },
  {
    title: "National League North Zone Group “L” Winners",
    image: nationalLeagueNorthGroupL,
  },
].filter((item): item is { title: string; image: string } => Boolean(item.image));

export default function Trophies() {
  return (
    <PublicLayout>
      <section className="bg-red-600 text-white py-8 md:py-12">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-2">
            Team
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Trophies & Honours
          </h1>
          <p className="text-lg md:text-xl text-amber-50 max-w-2xl mx-auto">
            Celebrating our achievements and history.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
              Trophies
            </h2>
            <p className="text-gray-600 mt-2">
              Our major honours, with the moments behind them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {TROPHIES.map((trophy) => (
              <article
                key={trophy.no}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="grid grid-cols-1 sm:grid-cols-5">
                  {trophy.image && (
                    <div className="sm:col-span-2 bg-gray-100">
                      <div className="aspect-[1/1] overflow-hidden">
                        <img
                          src={trophy.image}
                          alt={trophy.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`${trophy.image ? "sm:col-span-3" : "sm:col-span-5"} p-5 md:p-6`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white font-bold rounded-full">
                          {trophy.no}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg md:text-xl font-bold text-gray-900">
                          {trophy.name}
                        </h3>
                        <h3 className="font-heading text-lg md:text-xl font-bold text-gray-900">
                          {trophy.english}
                        </h3>

                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="font-medium">
                            ዓ.ም: {trophy.year}
                          </span>
                          <span className="font-medium">
                            ቦታ: {trophy.place}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {CELEBRATIONS.length > 0 && (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
              Celebrations
            </h2>
            <p className="text-gray-600 mt-2">
              Photos from trophy-winning moments and awards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {CELEBRATIONS.map((item, idx) => (
              <article
                key={`${item.title}-${idx}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 md:p-5">
                  <p className="font-semibold text-gray-900 text-sm md:text-base">
                    {item.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="py-8 bg-gray-50 border-t border-gray-100">
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
