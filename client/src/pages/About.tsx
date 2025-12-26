import PublicLayout from '@/components/PublicLayout';
import { ASSETS } from '@/lib/mockData';
import { useQuery } from '@tanstack/react-query';

export default function About() {
  const { data: settings } = useQuery<any[]>({
    queryKey: ['/api/settings'],
    staleTime: Infinity,
  });

  const aboutContent = {
    pageTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.pageTitle')?.value : null) || 'Our History',
    pageSubtitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.pageSubtitle')?.value : null) || "From Ethiopia's coffee heritage to the pinnacle of Ethiopian football.",
    sectionTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.sectionTitle')?.value : null) || 'The Browns',
    sectionContent: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.sectionContent')?.value : null) || "Ethiopian Coffee Sport Club (Amharic: የኢትዮጵያ ቡና ስፖርት ክለብ), also known as Ethiopian Bunna, is a professional Ethiopian football club based in Addis Ababa. The club was founded in 1976 by employees of Kefa Coffee Processing and plays in the Ethiopian Premier League, the top division of Ethiopian football.",
    historyTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyTitle')?.value : null) || 'The Coffee Legacy',
    historyContent1: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyContent1')?.value : null) || "The club has a rich history deeply intertwined with Ethiopia's coffee culture. 'Bunna' means coffee in Amharic, reflecting the nation's renowned coffee heritage and the club's deep connection to the national coffee industry.",
    historyContent2: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyContent2')?.value : null) || "In the 1996-97 season, Ethiopian Coffee achieved its first Ethiopian Premier League title. The club has also won six Ethiopian Cup titles and made history in the 1998 CAF Champions League when forward Aseged Tesfaye scored five goals in a single match - a record that still stands today.",
    missionTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.missionTitle')?.value : null) || 'Our Mission',
  };

  return (
    <PublicLayout>
      <div className="bg-zinc-100 py-12 md:py-20">
        <div className="container px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary mb-4">{aboutContent.pageTitle}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{aboutContent.pageSubtitle}</p>
        </div>
      </div>

      <div className="container px-4 py-16 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <div className="flex flex-col md:flex-row gap-8 items-center mb-12 not-prose">
            <div className="w-full md:w-1/2">
              <img src={ASSETS.logo} alt="Ethiopian Bunna Crest" className="w-48 h-48 object-contain mx-auto" />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="font-heading text-3xl font-bold mb-4">{aboutContent.sectionTitle}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {aboutContent.sectionContent}
              </p>
            </div>
          </div>

          <h3>{aboutContent.historyTitle}</h3>
          <p>
            {aboutContent.historyContent1}
          </p>
          <p>
            {aboutContent.historyContent2}
          </p>

          <h3>{aboutContent.missionTitle}</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To represent Ethiopian coffee culture and its people with pride and excellence.</li>
            <li>To develop young talent through our academy and youth programs.</li>
            <li>To compete at the highest level in domestic and continental competitions.</li>
            <li>To build a sustainable and professional sporting institution.</li>
          </ul>
        </div>
      </div>
    </PublicLayout>
  );
}
