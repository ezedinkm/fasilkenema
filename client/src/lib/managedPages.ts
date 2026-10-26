import { getLocalAssetUrl } from "@/lib/localAssets";
import {
  parseManagedPageContent,
  serializeManagedPageContent,
} from "@shared/managedPageContent";
import type {
  ManagedPageDraft,
  ManagedPageSection,
} from "@shared/managedPageContent";
export {
  parseManagedPageContent,
  serializeManagedPageContent,
} from "@shared/managedPageContent";
export type {
  ManagedPageDraft,
  ManagedPageSection,
} from "@shared/managedPageContent";

export type ManagedPageConfig = {
  slug: "stadium" | "gondar";
  title: string;
  intro: string;
  sections: ManagedPageSection[];
};

const imageUrl = (path: string) => getLocalAssetUrl(path) ?? "";

export const MANAGED_PAGES: ManagedPageConfig[] = [
  {
    slug: "stadium",
    title: "Fasil Kenema Stadium",
    intro:
      "The home of Fasil Kenema Sport Club — where history is made and fans come together.",
    sections: [
      {
        heading: "የአጤ ፋሲለደስ ስታዲየምና የመቀመጫ ቦታዎች",
        text:
          "በጎንደር ከተማ እምብርት ላይ የሚገኘዉና ከ25-35 ሺህ ሰዎችን ማስተናገድ እንደሚችል የሚገመተው የአፄ ፋሲለደስ ስታዲየም መቸ እንደተገነባ በዉል ባይታዎቅም የተመልካች መቀጫዎች በ1970 ዎቹ እንደታነፁ አንዳንድ መረጃዎች ያመለክታሉ። ስታዲየሙ በአብዛኛው ጊዜ ለእግር ኳስ ግጥሚያዎች የሚያገለግል ሲሆን አልፎ አልፎ የአትሌቲክስ ውድድሮችና ማህበራዊ ጉዳዮችንም ያስተናግዳል.\n\nየፋሲለደስ ስታዲየም ጎንደርን እንደቋረቋሯት በሚታመኑት በንጉሱ አፄ ፋሲለደስ ስም የተሰየመ ሲሆን ንጉሱ ኢትዮጵያን ለ36 አመታት መርተዋል። ዙሪያዉን ፋሲል ከነማ የመለያ ቀለም በሆነው ቀይና ነጭ ቀለማት ያሸበረቀዉ የደጋፊዎች የመቀመጫ ቦታዎች በነገስታት፣ በጎንደር አጎራባች ቦታዎችና፣ ከከተማዋ ጋር በተቋራኙ ታሪካዊ ስሞች ተሰይመዋል። የስታዲየም የመቀመጫ ቦታዎች ስያሜና ትርጉማቸዉ በመጠኑም ቢሆን ከታች እንደሚከተለዉ ተገልፀዋል።",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "ቋረኞች",
        text:
          "ቋራ በተለምዶ ትሪቡን ተብሎ ከሚጠራው የመቀመጫ ቦታ ፊት ለፊት የሚገኝ ሲሆን መቀመጫዎቹ ለሜዳዉ ቅርብ በመሆናቸዉና ደጋፊዎች በሚፈጥሩት አንፀባራቂ ድባብ ምክንያት ቦታዉ በበርካታ ታዳሚዎች ዘንድ ይመረጣል። በቋራ በኩል የሚቀመጡ ደጋፊዎች ቋረኞች በመባል ይታዎቃሉ። ቋረኞች የአፄ ፋሲለደስ ስታዲየም ልዩ ዉበቶች ናቸዉ። ደጋፊዎች ክለባቸዉን ለመደገፍ የሚያሳዩት ጥንካሬ፣ ፅናት እና ወኔ ያስቀናል።\n\nቋረኞች ስያሚያቸዉን ያገኙት ከጎንደር ወደ ቋራ ወረዳ የሚወስዱ መንገዶችና ወረዳዎ የምትገኝበት አቅጣጫ ደጋፊዎች ከሚቀመጡበት ቦታ ጋር ተመሳሳይ በመሆኑ ምክንያት ነዉ። ከላዩ በሚገኘዉ የወንፊት ተራራ የታቀፉት ቋረኞች የወኔ እና አሸናፊነት መገለጫች ናቸዉ።",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "ምንትዋብ",
        text:
          "ከቋረኞች በስተቀኝ በኩል ወይም ከጎሉ ጀርባ የሚገኘዉ የደጋፊዎች መቀመጫ እቴጌ ምንትዋብ በመባል ይታዎቃል። ይህንን ስያሜ ሊያገኝበት የቻለዉ እቴጌ ምንትዋብ ያስገነባችዉ ጥንታዊዋና ታሪካዊዋ የቁስቋም ማርያም ቤተክርስትያን በተመሳሳይ አቅጣጫ በቅርብ ርቀት በመገኘቷ ነዉ።\n\nምንትዋብ በ18ኛው ክፍልዘመን ኢትዮጵያ ላይ ብዙ አሻራ ትታ ያለፈች ንቁ፣ ሃይለኛና ተራማጅ መሪ ነበረች። ከባሏ ዓፄ በካፋ ዘመን ጀምሮ እስከ ልጇ ዳግማዊ አፄ ኢያሱ እና ልጅ ልጇ አፄ እዮዋስ ዘመን ድረስ ለ40 አመታት የአገሪቱ እኩል መሪ የነበረችና ከፍተኛ ተሰሚነት የነበራት ናት። በዚህች መሪ ዘመን በኢትዮጵያ ውስጥ ትልቅ የህንጻዎች ግንባታና የቤተክርስቲያን ድረሰት፣ እንዲሁም ስነ ጥበብ እድገት ታይቷል። በፋሲል ግቢ የመጨረሻውን ግንብ ያስገነባችውም ምንትዋብ ነበረች።",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "ዞብል",
        text:
          "ዞብል በአጤ ፋሲለደስ ስታዲየም መግቢያ በቀኝ በኩል የሚገኝ የደጋፊዎች መቀመጫ ቦታ ሲሆን ስያሜዉንም ያገኘዉ የአጤ ፋሲል ፈረስ የቀብር ቦታ በአቅራቢያው ስለሚገኝ ነዉ። ዞብል የአጤ ፋሲለደስ ታማኝና ጠንካራ ፈረስ ነዉ። ንጉሱ ለፈረሱ በገዛ እጃቸዉ ምግብ ከማቅረብ ጀምሮ ጥልቅ የሆነ ፍቅር እንደነበራቸዉ ጥንታዊ መዛግብቶች ያስረዳሉ። ንጉሱ ፈረሱ በሞተ ወቅት እጅግ ማዘናቸዉና በክብ ቅርጽ በቅምብብ የተሰራ መታሰቢያ የተለየ የመቃብር ቦታ አዘጋጅተው ያስቀበሩት ሲሆን አሁንም ይህ የዞብል የቀብር ቦታ ከፋሲል መዋኛ አጠገብ በስተምስራቅ በኩል ይገኛል።",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "ቴዎድሮስ",
        text:
          "ይህ ቦታ ባብዛኛው የሀገራችን የተለያዩ ስታዲየሞች በተለምዶ የክቡር ትሪቡን በመባል የሚታዎቀዉ ሲሆን በጎንደሩ የአጤ ፋሲለደስ ስታዲየም ግን የነገስታቱ ወይም የአፄ ቴዎድሮስ መቀመጫ በመባል ይታዎቃል። በ1995 የጥላፎቅ ግንባታዉ የተሰራለት የቴዎድሮስ መቀመጫ ስያሜዉን ያገኘዉ በመሳፍንት ተከፋፍላ የነበረችውን ሀገራቸዉ ወደ አንድ ለማምጣት ብዙ በደከሙት ሀገር ወዳድ መሪ አጤ ቴዎድሮስ ምክንያት ነዉ። በዚህ የደጋፊዎች መቀመጫ ቦታ የክብር እንግዶች፣ የዳኞች ኮሚሽነር እና የተለያዩ አካለት ይታደሙበታል።",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "Match day at the home ground",
        text: "",
        imageUrl: imageUrl("stadium/st1.webp"),
        imageAlt: "Players and supporters gathered across the Fasil Kenema home ground",
      },
      {
        heading: "Football beneath the Gondar sky",
        text: "",
        imageUrl: imageUrl("stadium/st2.webp"),
        imageAlt: "Football match taking place on the stadium pitch",
      },
      {
        heading: "Aerial stadium concept",
        text: "",
        imageUrl: imageUrl("stadium/st3.webp"),
        imageAlt: "Aerial architectural rendering of a stadium",
      },
      {
        heading: "The ground in its city setting",
        text: "",
        imageUrl: imageUrl("stadium/st4.webp"),
        imageAlt: "Stadium and surrounding landscape in Gondar",
      },
      {
        heading: "Proposed stadium design",
        text: "",
        imageUrl: imageUrl("stadium/st5.webp"),
        imageAlt: "Architectural rendering of a proposed stadium exterior",
      },
      {
        heading: "Supporters fill the ground",
        text: "",
        imageUrl: imageUrl("stadium/st6.webp"),
        imageAlt: "Supporters watching a match from around the stadium",
      },
    ],
  },
  {
    slug: "gondar",
    title: "Gondar & FASIL S.C",
    intro: "",
    sections: [
      {
        heading: "Home City Story",
        text:
          "Gondar stands as the historical heart of northern Ethiopia, a city rich in culture, heritage, and pride. It is within this setting that FASIL S.C was founded, drawing inspiration from the legacy and resilience of its people. The club’s identity is closely tied to the spirit of Gondar—strong, passionate, and united. From its earliest days, FASIL S.C has represented more than just football; it has embodied a sense of belonging for the community. The support from the people of Gondar has played a crucial role in shaping the club’s journey. Fans fill the stadium with energy and loyalty, motivating players to perform at their best. The Gondar City Administration has also been key in the club’s development, providing sponsorship and support. Through community programs and youth initiatives, FASIL S.C continues to grow on and off the field, strengthening its bond with the city it represents.",
        imageUrl: imageUrl("banner/gondar-parade.webp"),
        imageAlt: "Fasil Kenema supporters celebrating in Gondar",
      },
      {
        heading: "Funding",
        text: "Built and supported by Gondar's community.",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "Sponsorship",
        text: "Gondar City Administration backs FASIL S.C",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "Youth",
        text: "Training pathways for the next generation.",
        imageUrl: "",
        imageAlt: "",
      },
      {
        heading: "Pride",
        text: "A club that represents Gondar every season.",
        imageUrl: "",
        imageAlt: "",
      },
    ],
  },
];

export function getManagedPageConfig(slug: string) {
  return MANAGED_PAGES.find((page) => page.slug === slug);
}
