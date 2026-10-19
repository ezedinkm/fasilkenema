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

const GALLERY_IMAGES = [
  getLocalAssetUrl("stadium/st1.jpg"),
  getLocalAssetUrl("stadium/st2.jpg"),
  getLocalAssetUrl("stadium/st3.jpg"),
  getLocalAssetUrl("stadium/st4.jpg"),
  getLocalAssetUrl("stadium/st5.jpg"),
  getLocalAssetUrl("stadium/st6.jpg"),
].filter((image): image is string => Boolean(image));

export default function Stadium() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [loadedGalleryIndexes, setLoadedGalleryIndexes] = useState<boolean[]>(
    () => Array(GALLERY_IMAGES.length).fill(false),
  );

  useEffect(() => {
    let cancelled = false;
    const loadedGallery = new Set<number>();

    if (!("IntersectionObserver" in window)) {
      setHeroLoaded(true);
      setLoadedGalleryIndexes(Array(GALLERY_IMAGES.length).fill(true));
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;

          const heroFlag = target.dataset.stadiumHero;
          if (heroFlag) {
            setHeroLoaded(true);
            observer.unobserve(target);
            continue;
          }

          const idxRaw = target.dataset.stadiumGalleryIndex;
          if (!idxRaw) continue;

          const idx = Number(idxRaw);
          if (
            cancelled ||
            Number.isNaN(idx) ||
            idx < 0 ||
            idx >= GALLERY_IMAGES.length
          )
            continue;

          if (loadedGallery.has(idx)) continue;
          loadedGallery.add(idx);
          setLoadedGalleryIndexes((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });

          observer.unobserve(target);
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 },
    );

    const heroEl = document.querySelector<HTMLElement>("[data-stadium-hero]");
    if (heroEl) observer.observe(heroEl);

    const galleryEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-stadium-gallery-index]"),
    );
    for (const el of galleryEls) observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="relative bg-gray-900 text-white min-h-[45vh] flex items-end"
        data-stadium-hero
      >
        {GALLERY_IMAGES[0] && (
          <img
            src={heroLoaded ? GALLERY_IMAGES[0] : undefined}
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

      {/* 500 words description */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container px-4 max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {STADIUM_DESCRIPTION}
            </p>
          </div>
        </div>
      </section>

      {/* 6 images gallery */}
      {GALLERY_IMAGES.length > 0 && (
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Stadium Gallery
          </h2>
          <p className="text-gray-600 text-center mb-10 md:mb-14">
            Views and moments from our home ground
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {GALLERY_IMAGES.map((src, i) => (
              <div
                key={i}
                data-stadium-gallery-index={i}
                className="rounded-xl overflow-hidden bg-white shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={loadedGalleryIndexes[i] ? src : undefined}
                    alt={`${STADIUM_TITLE} ${i + 1}`}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
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
