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
    pageSubtitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.pageSubtitle')?.value : null) || "90 years of Ethiopian football excellence and national pride.",
    sectionTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.sectionTitle')?.value : null) || 'The Horsemen',
    sectionContent: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.sectionContent')?.value : null) || "Saint George Sport Club (Amharic: ቅዱስ ጊዮርጊስ ስፖርት ክለብ), also known as Kidus Giorgis, is Ethiopia's most prestigious professional football club based in Addis Ababa. Founded in December 1935 by George Ducas and Ayale Atnash during Italy's fascist occupation, the club became a symbol of Ethiopian nationalism and resistance.",
    historyTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyTitle')?.value : null) || 'The Legend of St George',
    historyContent1: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyContent1')?.value : null) || "Saint George is the oldest and most successful football club in Ethiopia. The club plays its home matches at the historic Addis Ababa Stadium with a capacity of 35,000 passionate fans. Known as 'The Horsemen', the team wears the iconic yellow and red colors.",
    historyContent2: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyContent2')?.value : null) || "With 16 Ethiopian Premier League titles and 8 Ethiopian Cup victories, Saint George stands as the most decorated club in Ethiopian football history. The Yidnekachew Tessema Youth Academy in Bishoftu continues to develop future stars, funded by supporters including Mohammed Hussein Al Amoudi.",
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
              <img src={ASSETS.logo} alt="Saint George FC Crest" className="w-48 h-48 object-contain mx-auto" />
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
            <li>To represent Ethiopia with pride and excellence on all football stages.</li>
            <li>To develop young talent through the Yidnekachew Tessema Youth Academy.</li>
            <li>To compete at the highest level in domestic and continental competitions.</li>
            <li>To preserve our legacy as a symbol of Ethiopian nationalism and sporting excellence.</li>
          </ul>
        </div>
      </div>
    </PublicLayout>
  );
}
