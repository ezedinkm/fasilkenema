import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { getLocalAssetUrl } from "@/lib/localAssets";
import { useEffect, useState } from "react";

const STADIUM_TITLE = "Fasil Kenema Stadium";

const STADIUM_DESCRIPTION = `
የአጤ ፋሲለደስ ስታዲየምና የመቀመጫ ቦታዎች
በጎንደር ከተማ እምብርት ላይ የሚገኘዉና ከ25-35 ሺህ ሰዎችን ማስተናገድ እንደሚችል የሚገመተው የአፄ ፋሲለደስ ስታዲየም መቸ እንደተገነባ በዉል ባይታዎቅም የተመልካች መቀጫዎች በ1970 ዎቹ እንደታነፁ አንዳንድ መረጃዎች ያመለክታሉ። ስታዲየሙ በአብዛኛው ጊዜ ለእግር ኳስ ግጥሚያዎች የሚያገለግል ሲሆን አልፎ አልፎ የአትሌቲክስ ውድድሮችና ማህበራዊ ጉዳዮችንም ያስተናግዳል። 
የፋሲለደስ ስታዲየም ጎንደርን እንደቋረቋሯት በሚታመኑት በንጉሱ አፄ ፋሲለደስ ስም የተሰየመ ሲሆን ንጉሱ ኢትዮጵያን ለ36 አመታት መርተዋል፡፡ ዙሪያዉን ፋሲል ከነማ የመለያ ቀለም በሆነው ቀይና ነጭ ቀለማት ያሸበረቀዉ የደጋፊዎች የመቀመጫ ቦታዎች በነገስታት፣ በጎንደር አጎራባች ቦታዎችና፣ ከከተማዋ ጋር በተቋራኙ ታሪካዊ ስሞች ተሰይመዋል፡፡ የስታዲየም የመቀመጫ ቦታዎች ስያሜና ትርጉማቸዉ በመጠኑም ቢሆን ከታች እንደሚከተለዉ ተዠገልፀዋል፡፡
ቋረኞች…
ቋራ በተለምዶ ትሪቡን ተብሎ ከሚጠራው የመቀመጫ ቦታ ፊት ለፊት የሚገኝ ሲሆን መቀመጫዎቹ ለሜዳዉ ቅርብ በመሆናቸዉና ደጋፊዎች በሚፈጥሩት አንፀባራቂ ድባብ ምክንያት ቦታዉ በበርካታ ታዳሚዎች ዘንድ ይመረጣል፡፡ በቋራ በኩል የሚቀመጡ ደጋፊዎች ቋረኞች በመባል ይታዎቃሉ፡፡ ቋረኞች የአፄ ፋሲለደስ ስታዲየም ልዩ ዉበቶች ናቸዉ፡፡ደጋፊዎች ክለባቸዉን ለመደገፍ የሚያሳዩት ጥንካሬ፣ ፅናት እና ወኔ ያስቀናል።
ቋረኞች ስያሚያቸዉን ያገኙት ከጎንደር ወደ ቋራ ወረዳ የሚወስዱ መንገዶችና ወረዳዎ የምትገኝበት አቅጣጫ ደጋፊዎች ከሚቀመጡበት ቦታ ጋር ተመሳሳይ በመሆኑ ምክንያት ነዉ፡፡ ከላዩ በሚገኘዉ የወንፊት ተራራ የታቀፉት ቋረኞች የወኔ እና አሸናፊነት መገለጫች ናቸዉ።
ምንትዋብ...
ከቋረኞች በስተቀኝ በኩል ወይም ከጎሉ ጀርባ የሚገኘዉ የደጋፊዎች መቀመጫ እቴጌ ምንትዋብ በመባል ይታዎቃል፡፡ ይህንን ስያሜ ሊያገኝበት የቻለዉ እቴጌ ምንትዋብ ያስገነባችዉ ጥንታዊዋና ታሪካዊዋ የቁስቋም ማርያም ቤተክርስትያን በተመሳሳይ አቅጣጫ በቅርብ ርቀት በመገኘቷ ነዉ፡፡
ምንትዋብ በ18ኛው ክፍልዘመን ኢትዮጵያ ላይ ብዙ አሻራ ትታ ያለፈች ንቁ፣ ሃይለኛና ተራማጅ መሪ ነበረች። ከባሏ ዓፄ በካፋ ዘመን ጀምሮ እስከ ልጇ ዳግማዊ ዓፄ ኢያሱ እና ልጅ ልጇ ዓፄ እዮዋስ ዘመን ድረስ ለ40 አመታት የአገሪቱ እኩል መሪ የነበረችና ከፍተኛ ተሰሚነት የነበራት ናት። በዚህች መሪ ዘመን በኢትዮጵያ ውስጥ ትልቅ የህንጻዎች ግንባታና የቤተክርስቲያን ድረሰት፣ እንዲሁም ስነ ጥበብ እድገት ታይቷል። በፋሲል ግቢ የመጨረሻውን ግንብ ያስገነባችውም ምንትዋብ ነበረች። 

ዞብል...
ዞብል በአጤ ፋሲለደስ ስታዲየም መግቢያ በቀኝ በኩል የሚገኝ የደጋፊዎች መቀመጫ ቦታ ሲሆን ስያሜዉንም ያገኘዉ የአጤ ፋሲል ፈረስ የቀብር ቦታ በአቅራቢያው ስለሚገኝ ነዉ፡፡ ዞብል የአጤ ፋሲለደስ ታማኝና ጠንካራ ፈረስ ነዉ፡፡ ንጉሱ ለፈረሱ በገዛ እጃቸዉ ምግብ ከማቅረብ ጀምሮ ጥልቅ የሆነ ፍቅር እንደነበራቸዉ ጥንታዊ መዛግብቶች ያስረዳሉ።  ንጉሱ ፈረሱ በሞተ ወቅት እጅግ ማዘናቸዉና በክብ ቅርጽ በቅምብብ የተሰራ መታሰቢያ የተለየ የመቃብር ቦታ አዘጋጅተው ያስቀበሩት ሲሆን አሁንም ይህ የዞብል የቀብር ቦታ ከፋሲል መዋኛ አጠገብ በስተምስራቅ በኩል ይገኛል፡፡
ቴዎድሮስ...
ይህ ቦታ ባብዛኛው የሀገራችን የተለያዩ ስታዲየሞች በተለምዶ የክቡር ትሪቡን በመባል የሚታዎቀዉ ሲሆን በጎንደሩ የአጤ ፋሲለደስ ስታዲየም ግን የነገስታቱ ወይም የአፄ ቴዎድሮስ መቀመጫ በመባል ይታዎቃል፡፡ በ1995 የጥላፎቅ ግንባታዉ የተሰራለት የቴዎድሮስ መቀመጫ ስያሜዉን ያገኘዉ በመሳፍንት ተከፋፍላ የነበረችውን ሀገራቸዉ ወደ አንድ ለማምጣት ብዙ በደከሙት ሀገር ወዳድ መሪ አጤ ቴዎድሮስ ምክንያት ነዉ፡፡  በዚህ የደጋፊዎች መቀመጫ ቦታ የክብር እንግዶች፣ የዳኞች ኮሚሽነር እና የተለያዩ አካለት ይታደሙበታል፡፡`.trim();

const GALLERY_ITEMS = [
  {
    src: getLocalAssetUrl("stadium/st1.webp"),
    alt: "Players and supporters gathered across the Fasil Kenema home ground",
    caption: "Match day at the home ground",
  },
  {
    src: getLocalAssetUrl("stadium/st2.webp"),
    alt: "Football match taking place on the stadium pitch",
    caption: "Football beneath the Gondar sky",
  },
  {
    src: getLocalAssetUrl("stadium/st3.webp"),
    alt: "Aerial architectural rendering of a stadium",
    caption: "Aerial stadium concept",
  },
  {
    src: getLocalAssetUrl("stadium/st4.webp"),
    alt: "Stadium and surrounding landscape in Gondar",
    caption: "The ground in its city setting",
  },
  {
    src: getLocalAssetUrl("stadium/st5.webp"),
    alt: "Architectural rendering of a proposed stadium exterior",
    caption: "Proposed stadium design",
  },
  {
    src: getLocalAssetUrl("stadium/st6.webp"),
    alt: "Supporters watching a match from around the stadium",
    caption: "Supporters fill the ground",
  },
].filter(
  (image): image is { src: string; alt: string; caption: string } =>
    Boolean(image.src),
);

const STADIUM_DESCRIPTION_BLOCKS = STADIUM_DESCRIPTION.split("\n")
  .map((text) => text.trim())
  .filter(Boolean)
  .map((text) => {
    const isHeading = text.startsWith("");
    return {
      text: isHeading ? text.slice(1).replace(/[.…]+$/, "") : text,
      isHeading,
    };
  });

export default function Stadium() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setHeroLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHeroLoaded(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 },
    );

    const heroEl = document.querySelector<HTMLElement>("[data-stadium-hero]");
    if (heroEl) observer.observe(heroEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="relative bg-gray-900 text-white min-h-[45vh] flex items-end"
        data-stadium-hero
      >
        {GALLERY_ITEMS[0]?.src && (
          <img
            src={heroLoaded ? GALLERY_ITEMS[0].src : undefined}
            alt={STADIUM_TITLE}
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="container px-4 py-16 md:py-24 max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-red-300 text-sm font-semibold uppercase tracking-wider mb-2">
            About
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {STADIUM_TITLE}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            The home of Fasil Kenema Sport Club — where history is made and fans
            come together.
          </p>
        </div>
      </section>

      {/* Stadium story */}
      <section className="bg-gradient-to-b from-white via-white to-red-50/50 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-8 flex flex-col gap-4 border-l-4 border-red-600 pl-5 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
              Gondar · Ethiopia
            </p>
            <h2 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">
              The story of our home ground
            </h2>
          </div>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
            <div className="mb-7 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-red-700">
                  የአጤ ፋሲለደስ ስታዲየም
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  History, stands, and the people who bring them to life
                </p>
              </div>
              <span className="hidden rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700 sm:inline-flex">
                FASIL KENEMA
              </span>
            </div>
            <div className="space-y-5">
              {STADIUM_DESCRIPTION_BLOCKS.map((block, index) =>
                block.isHeading ? (
                  <h3
                    key={`heading-${index}`}
                    className="border-l-2 border-red-500 pl-4 pt-2 font-heading text-lg font-bold text-slate-900"
                    lang="am"
                  >
                    {block.text}
                  </h3>
                ) : (
                  <p
                    key={`paragraph-${index}`}
                    className="text-base leading-8 text-slate-700"
                    lang="am"
                  >
                    {block.text}
                  </p>
                ),
              )}
            </div>
          </article>
        </div>
      </section>

      {/* Stadium gallery */}
      {GALLERY_ITEMS.length > 0 && (
        <section
          id="stadium-gallery"
          className="bg-slate-950 py-14 md:py-20"
        >
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-9 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-300">
                  The home of Fasil Kenema
                </p>
                <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
                  Stadium Gallery
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Match-day memories, supporters, and views of the ground in Gondar.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {GALLERY_ITEMS.map((image, i) => (
              <div
                key={i}
                  className="group relative isolate overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-white/10"
              >
                  <div className="aspect-[16/10] overflow-hidden">
                  <img
                      src={image.src}
                      alt={image.alt}
                    decoding="sync"
                    referrerPolicy="no-referrer"
                      loading="eager"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-5 pb-5 pt-14">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-200">
                      Fasil Kenema Stadium
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-white">
                      {image.caption}
                    </h3>
                  </div>
              </div>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container px-4 max-w-6xl mx-auto text-center">
          <Link
            href="/about"
            className="text-red-600 font-semibold hover:text-red-700 hover:underline"
          >
            ← Back to About
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
