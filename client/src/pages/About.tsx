import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useQuery } from "@tanstack/react-query";

const WORD_LIMIT = 120;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getFirstWords(text: string, n: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= n) return text;
  return words.slice(0, n).join(" ") + " ";
}
import historyImage1 from "@/assets/History/full team new.jpg";
import historyImage2 from "@/assets/History/ምስረታ copy.jpg";
import historyImage3 from "@/assets/History/ፋሲል ብሄራዊ ሊግ.jpg";
import historyImage4 from "@/assets/History/ትግል ፍሬ copy 2.jpg";
import historyImage5 from "@/assets/History/ፋሲል በ1966 ዓ.ም.jpg";
import historyImage6 from "@/assets/History/ፋሲል ከነማ በከፍተኛ ሊግ .png";
import historyImage7 from "@/assets/History/ፋሲል ከነማ በፕሪሚየር ሊጉ ( 2009___ ).jpg";
import historyImage8 from "@/assets/History/ቤትኪንግ የኢትዮጵያ ፕሪሚየር ሊግ በ2013 ዓ.ም አሸናፊ። (2013 ዓ.ም) copy 2.jpg";

const SECTIONS = [
  {
    title: "የክለቡ ታሪክ",
    title_english: "Our History",
    description:
      "በኢትዮጵያ በርካታ ትውልድ ሊዘክራቸውና ሊማርባቸው የሚገቡ አስደናቂ የአመሰራረት ሂደት ያላቸው የስፖርት ቡድኖች ይገኛሉ ። በቀደመው ጊዜ የነበሩ እንደ የክቡር ዘበኛው ምድር ጦር የወለዳቸው መቻልና መኩሪያ ፣ ዳኘው ፣ የፖሊስ ሰራዊትን የሚወክሉ ኦሜድላ ፣ የድሬዎቹ ባቡርና ጥጥ ፣ ቴሌ፣ አየር ሃይልን የሚወክለው ንብ እና ቀይባህር ተጠቃሽ ናቸው ። ከዚያ በኋላ የመጡት ደግሞ የከተማ ነዋሪዎች ማህበራት (ከነማ) ክለቦች ሲሆኑ በአጭር ጊዜ ከፍተኛ ዝናን በማትረፍ ደጋፊዎችን እያበዛ የመጣው ፋሲል ከነማ እግር ኳስ ቡድን ተጠቃሽ ነው ።",
    english_description:
      "Ethiopia is home to several sports teams with remarkable founding histories that deserve to be remembered and studied by many generations. Notable historical teams include Mechal and Mekuria (born of the Imperial Guard), Dagnaw, Omedla (representing the Police Force), Dire Dawa Railway and Cotton, Tele, Nib (representing the Air Force), and Red Sea. These were followed by Urban Dwellers' Association (Kenema) clubs, among which Fasil Kenema Football Club stands out for gaining immense fame and a rapidly growing fanbase in a short period.",
    image: historyImage5,
  },
  {
    title: "ፋሲል ከነማ ምስረታ ( 1960 ዓ.ም)",
    title_english: "The Founding of Fasil Kenema (1960 E.C.)",
    description:
      "በ1938 ዓ.ም የኢትዮጵያ ሻምፒዮና መጀመሩን ተከትሎ እግር ኳስ በመላው ሃገሪቱ መስፋፋትና መወደድ ሲጀምር ስፖርቱ በታሪካዊው ፋሲል ግቢ የተነሳ የአፍሪካ ካሜሎት በመባል በምትታወቀው ጎንደር ከተማ በአጭር ጊዜ ከፍተኛ ተቀባይነት ሊያገኝ ቻለ። በተለይ 1950ዎቹ በከተማዋና በአጎራባች አውራጃዎች የተለያዩ ቡድኖች ማቆጥቆጥ የጀመሩት ወቅት ነበር። ያ ጊዜ ዞብል ፣ ዋሊያ ፣ አፍሪካ ፣ አውራ ጎዳና እንዲሁም ነጋዴ የሚባሉ ቡድኖች በተለያዩ የግልና የመንግስት ተቋማት ተመስርተው ውድድራቸውን ያካሂዱ የነበረበት ወቅት ነበር።\nእነዚህ ቡድኖች የሚያደርጉትን ግጥሚያ ይመለከቱ የነበሩ በጎንደር ከተማ በተለምዶ ቸቸላ ተብሎ በሚጠራው አካባቢ ይኖሩ የነበሩ ተማሪዎች የሚወክላቸውን ቡድን ለማቋቋም በማህበር በመደራጀት እንቅስቃሴ ማድረግ ጀመሩ። ነገር ግን አብዛኛዎቹ የማህበሩ አባላት ተማሪዎች እንደመሆናቸው ለቡድኑ ግብዓት የሚሆኑ የተለያዩ ቁሳቁሶችና ገንዘብ ማግኘት ትልቅ ፈተና ሆኖባቸው ነበር። \nተጫዋቾቹ እና የማህበሩ አባላት በተለያዩ መስሪያ ቤቶችና ግለሰቦች ቤት እየዞሩ ገንዘብ ማሰባሰብ ጀመሩ። በተሰበሰበውም ትንሽ ገንዘብ ለቡድኑ የሚያስፈልጉ የመጫወቻ ጫማዎች ፣ ማሊያዎች ፣ኳሶችንና የተለያዩ ቁሳቁሶችን በመግዛት የፋሲል ቡድን በ1960 ዓ.ም ተመሰረተ።",
    english_description:
      "Following the start of the Ethiopian Championship in 1938 E.C., football began to spread and gain popularity across the country. The sport quickly gained acceptance in Gondar, known as the 'Camelot of Africa.' The 1950s E.C. saw various teams emerge, established by various private and government institutions. Students living in the Chechela area of Gondar began organizing an association to form a team to represent them. As most were students, raising funds was a challenge, but they eventually collected enough to buy boots, jerseys, and balls, officially founding the Fasil team in 1960 E.C.",
    image: historyImage2,
  },
  {
    title: "ፋሲል ( 1960_1968 ዓ.ም )",
    title_english: "Fasil (1960–1968 E.C.)",
    description:
      "የፋሲል ቡድን ሲቋቋም 13 አባላት ነበሩት። የመጀመሪያ ስያሜው ፋሲል ቢሆንም ለቡድኑ ስም እንዲሆኑ ሌሎች በርካታ አማራጮች ቀርበው እንደነበር በተለያዩ ጊዜ የታተሙ የፋሲል ከነማ መጽሄቶች ይገልጻሉ። አጼ ቴዎድሮስ የተወለዱበት ቋራ ፣ የነገሱበት ደረስጌ ማሪያም ፣ የሞቱበት መቅደላ ፣ የኢትዮጵያዊያን የስዕልና የህንጻ ጥበብ የተንጸባረቁበት የደብረብርሃን ስላሴ ፣ በሃገራችን ትልቁ ተራራ የሆነው ራስ ደጀን ፣ ቁስቋምና ጉና ተራራ ለቡድኑ ስያሜ እንዲሆኑ የቀረቡ አማራጮች ነበሩ። \nሆኖም ግን በ1624 ዓ.ም ጎንደር ከተማን የቆረቆሯት የአጼ ፋሲለደስ ስምና በከተማዋ ያስገነቡት ቤተ መንግስትን መሰረት አድርገው በመስራቾቹ አብላጫውን ድጋፍ ሊያገኝ በመቻሉ የቡድኑ ስያሜ ፋሲል ሊሆን በቃ። \nፋሲል በውድድሩ ጀማሪ እንደመሆኑና ልምድ በሌላቸው ተጫዋቾች እንደመዋቀሩ የመጀመሪያዎቹን አመታት ጠንካራ ተፎካካሪ መሆን አልቻለም። በተጫወተባቸውም ሁለትና ሶስት አመታት ከተሳታፊነት የዘለለ ውጤት ሳያስመዘግብ ቀረ። ሆኖም ግን በጊዜ ሂደት ነባር ተጫዋቾች ልምድ እያገኙ፣ ከተለያዩ ቦታዎች ሌሎች ልምድ ያላቸው ተጫዋቾችም ወደ ቡድኑ እየተቀላቀሉ ቡድኑ ራሱን አጎለበተ። \nበዚህም ጠንካራ ተፎካካሪ ሆኖ በመቅረብና በ1965 ዓ.ም በከተማዋ የተዘጋጀውን የክለቦች ሻምፒዮና ውድድር በማሸነፍ በሃገር አቀፍ ውድድር ላይ ተሳታፊ የሚያደርገውን ውጤት ማስመዝገብ ቻለ። \nከዚህ በኋላ ነበር ቡድኑ ጎንደርን በመወከል የሰሜንና የበጌምድር ቡድኖች ውድድር ላይ ተሳታፊ በመሆን ከየአውራጃው ከተውጣጡ ተወካዮች ጋር ስምንት ያህል ግጥሚያዎችን አድርጎ ስድስቱን በማሸነፍ እና ሁለቱን አቻ በመውጣት ያለምንም ሽንፈት ውድድሩን በበላይነት ማጠናቀቅ የቻለው። ይህ ውጤት በ1965 ዓ.ም. ፋሲል በወቅቱ የበጌምድር ጠቅላይ ግዛት የተባለችውን ጎንደርን በመወከል አዲስ አበባ ላይ በሚካሄደው የኢትዮጵያ የጠቅላይ ግዛት አሸናፊዎች ውድድር ተሳታፊ ለመሆን አበቃው። \nበወቅቱ ከገንዘብ አቅም ማነስ ጋር በተያያዘ ውድድሩን ለማካሄድ ተስኖት የነበረው ፋሲል ከነማ ከጎንደር ማዘጋጃ ቤት በተገኘው 300 ብር እና ደጋፊዎች ባዋጡት 400 ብር በድምሩ በ700 ብር በጀት ውድድሩን እንዲሳተፍ ተደረገ። \nፋሲል በዚህ ሁኔታ ላይ እያለ ኢትዮጵያ አዲስ የታሪክ ምዕራፍ አስተናገደች። ወቅቱ በኢትዮጵያ ታሪክ ህዝባዊ አብዮት ተብሎ የሚታወቀው ምዕራፍ የጀመረበት ነበር። የ1966ቱ የኢትዮጵያ አብዮት የሃገሪቱን ፖለቲካዊና ኢኮኖሚያዊ ገጽታ ብቻ ሳይሆን ማህበራዊ መዋቅሩንም ቀየረው። የለውጡ አንድ አካል የነበረችው ጎንደር ከተማም በስር ነቀል ሂደቱ ውስጥ ስታልፍና ወጣቶቿም ወደፖለቲካው ሲሳቡ በከተማዋ የሚገኙ ስፖርቶች መቀዛቀዝ ጀመሩ። \nበወቅቱ ውድድር ለማድረግ አስቸጋሪ ስለነበር በርካታ ቡድኖች መፍረስ እጣ ፈንታቸው ሆኖ ከስመዋል። አብዮቱ ከፈነዳ በኋላ በነበሩት ጥቂት አመታት በየቡድኑ የነበሩ ተጫዋቾች የተወሰኑት በፖለቲካው መስመር ሲሰለፉ፣ በርካቶች ደግሞ በወቅቱ “ቀይ ሽብር” ተብሎ ይታወቅ የነበረውን የደቦ ፍጅት ሸሽተው ሃገር ለቅቀው ተሰደዱ። \n\nለፋሲል ቡድን ድጋፍ ሲያደርጉ የነበሩት ባለሃብቶችና ስፖርት ወዳጆችም በሞት ፣ በስደትና በተለያዩ ምክንያቶች ስለተበተኑ ለቡድኑ የሚደረገው ድጋፍ እየተመናመነ መጣ። በዚህ ምክንያት የፋሲል ቡድን ያጋጠመውን የመፍረስ አደጋ መቋቋም ተስኖት ቡድኑ ከተመሰረተ ከስምንት አመታት በኋላ በ1968 ዓ.ም ፈረሰ።",
    english_description:
      "Fasil originally had 13 members. Various names like Quara, Meqdela, and Ras Dashen were considered, but 'Fasil'—honoring Emperor Fasilides—was chosen. Initially, the team struggled as a newcomer, but improved over time and won the city championship in 1965 E.C. They represented Gondar and finished regional matches undefeated, qualifying for national tournaments on a meager 700 Birr budget. However, the 1966 E.C. revolution brought political upheaval. Due to the social instability and the 'Red Terror,' players and supporters were scattered, leading to the team's dissolution in 1968 E.C., eight years after its founding.",
    image: historyImage5,
  },
  {
    title: "ትግል ፍሬ/“አጠቃላይ ከነማ”  ( 1971_1982 ዓ.ም)",
    title_english: 'Tigil Fre / "General Kenema" (1971–1982 E.C.)',
    description:
      "ወታደራዊው የደርግ ስርዓት የነበሩበትን ተግዳሮቶች በማስወገድ ሃገሪቱን ሙሉ ለሙሉ ሲቆጣጠርና ሲጠናከር በተፈጠረው አንጻራዊ ሰላም ተቀዛቅዞ የነበረው የስፖርት እንቅስቃሴ በመጠኑ መነቃቃትን ማሳየት ጀመረ።...",
    english_description:
      "Under the Derg military regime, sports activities began to revive. Former members and leader Mr. Seyoum Demlie petitioned to re-establish the club. In 1971 E.C., the team was re-founded as 'Tigil Fre.' It changed its name to 'General Kenema' in 1973 E.C. During this era, support was minimal, and players played primarily for the love of the game and public satisfaction. Matches were frequently interrupted by political instability until the transition of power to the EPRDF marked a new chapter.",
    image: historyImage4,
  },
  {
    title: "ፋሲል ከነማ ስፖርት ክለብ (1985_",
    title_english: "Fasil Kenema Sports Club (1985 E.C. – Present)",
    description:
      "የተካሄደውን የመንግስት ለውጥ ተከትሎ በ1983 እና 84 ዓ.ም. ውድድሮች ሙሉ ለሙሉ ቆመው የነበሩ ሲሆን ከፋሲል በስተቀር ሁሉም በድርጅቶችና በተለያዩ የግል ተቋማት ተይዘው የነበሩ ቡድኖች ፈርሰው ሌሎች ቡድኖች ተመሰረቱ።...",
    english_description:
      "Following the government change, competitions stopped in 1983 and 1984 E.C. In 1985 E.C., the club officially adopted its current name, 'Fasil Kenema.' The city administration began providing a formal annual budget, which grew over the years. After several years of dominating their regional group but failing in the final play-offs, Fasil finally qualified for the National League for the 1994 E.C. season after an impressive run in Debre Berhan in 1993 E.C.",
    image: historyImage3,
  },
  {
    title: "ፋሲል ከነማ በብሔራዊ ሊግ ( 1993___ )",
    title_english: "Fasil Kenema in the National League (1993 E.C. –)",
    description:
      "ፋሲል ከነማ በብሄራዊ ሊጉ ተሳታፊ ከሆነበት 1994 ዓ.ም ጀምሮ በዚህ ውድድር በመሳተፍ ወደ ከፍተኛ ሊግ ለማደግ ለበርካታ አመታት ጥረት አድርጓል።...",
    english_description:
      "Starting from 1994 E.C., Fasil spent years in the National League trying to advance. A significant highlight was the 2000 E.C. MIDROC Millennium Trophy. Due to a league split in 1999 E.C., Fasil—having finished second in the National League—was promoted to the Premier League for the 2000 E.C. season. However, they were relegated in 2001 E.C. after only one season at the top level.",
    image: historyImage1,
  },
  {
    title: "ፋሲል ከነማ በከፍተኛ ሊግ (2008 ዓ.ም)",
    title_english: "Fasil Kenema in the Higher League (2008 E.C.)",
    description:
      "በ2008 ዓ.ም የኢትዮጵያ እግር ኳስ ፌድሬሽን በፕሪምየር ሊጉ የሚሳተፉ ቡድኖች ቁጥር ከ14 ወደ 16 ከፍ እንዲሉ በወሰነው መሰረት...",
    english_description:
      "In 2008 E.C., the Federation expanded the Premier League to 16 teams. Fasil Kenema competed in the Higher League, losing only once in the second round. With four games remaining, after defeating Ethiopian Insurance 1-0 on matchday 26, they secured their promotion back to the Ethiopian Premier League.",
    image: historyImage7,
  },
  {
    title: "ፋሲል ከነማ በፕሪሚየር ሊጉ ( 2009___ )",
    title_english: "Fasil Kenema in the Premier League (2009 E.C. – Present)",
    description: "የፋሲል ጥንካሬ ከከፍተኛ ሊጉ አልፎ በፕሪምየር ሊጉ ላይም በጉልህ ታይቷል።...",
    english_description:
      "Fasil's strength was evident as they returned to the Premier League in 2009 E.C., becoming title contenders and revitalizing sports in Gondar. Their success attracted major partnerships, including a record 75 million Birr deal with Dashen Beer. In 2013 E.C., Fasil won their first-ever Ethiopian Premier League title in the inaugural 'BetKing' season broadcast on DSTV. They secured the championship in Hawassa with four games to spare, finishing with 54 points. Today, Fasil Kenema remains a premier title contender in Ethiopian football.",
    image: historyImage8,
  },
];

export default function About() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [isEnglishVersion, setIsEnglishVersion] = useState(false);

  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/public/settings"],
    staleTime: Infinity,
  });

  const pageTitle =
    (Array.isArray(settings)
      ? settings.find((s: any) => s.key === "about.pageTitle")?.value
      : null) || "Our History";
  const pageSubtitle =
    (Array.isArray(settings)
      ? settings.find((s: any) => s.key === "about.pageSubtitle")?.value
      : null) || "Ethiopian football excellence and national pride.";

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-red-600 to-red-700 text-white py-16 md:py-24">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg md:text-xl text-red-50 max-w-2xl mx-auto">
            {pageSubtitle}
          </p>
        </div>
      </section>

      {/* 8 sections: title + ~150 words + 1 image each */}
      <div className="bg-white">
        {SECTIONS.map((section, index) => (
          <section
            key={section.title}
            className={`py-14 md:py-20 ${index % 2 === 1 ? "bg-gray-50" : ""}`}
          >
            <div className="container px-4 max-w-6xl mx-auto">
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
                      <span className="text-red-600">
                        {isEnglishVersion
                          ? section.title_english
                          : section.title}
                      </span>
                    </h2>
                    {index === 0 && (
                      <button
                        type="button"
                        onClick={() => setIsEnglishVersion((prev) => !prev)}
                        className="px-3 py-1.5 text-sm font-semibold rounded-md border border-red-600 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                      >
                        {isEnglishVersion
                          ? "Amharic Version"
                          : "English Version"}
                      </button>
                    )}
                  </div>
                  <div className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {(() => {
                      const sectionDescription = isEnglishVersion
                        ? section.english_description
                        : section.description;
                      const words = wordCount(sectionDescription);
                      const isLong = words > WORD_LIMIT;
                      const isExpanded = expandedSections.has(index);
                      const displayText =
                        isLong && !isExpanded
                          ? getFirstWords(sectionDescription, WORD_LIMIT)
                          : sectionDescription;
                      return (
                        <>
                          <p className="whitespace-pre-wrap text-justify">
                            {displayText}
                          </p>
                          {isLong && (
                            <button
                              type="button"
                              onClick={() => toggleSection(index)}
                              className="mt-3 text-red-600 font-semibold hover:text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                            >
                              {isExpanded ? "Read less" : "Read more"}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div
                  className={`rounded-2xl overflow-hidden shadow-lg bg-gray-100 ${index % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={section.image}
                      alt={
                        isEnglishVersion ? section.title_english : section.title
                      }
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Stadium CTA */}
      <section className="py-14 md:py-20 bg-red-600 text-white">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
            Our Stadium
          </h2>
          <p className="text-red-50 mb-6 max-w-2xl mx-auto">
            Discover the home of FASIL S.C — capacity, history, and how to visit
            or host events.
          </p>
          <Link
            href="/stadium"
            className="inline-block px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Stadium
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
