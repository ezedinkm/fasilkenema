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
    pageSubtitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.pageSubtitle')?.value : null) || "Ethiopian football excellence and national pride.",
    sectionTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.sectionTitle')?.value : null) || 'Mechal Sport Club',
    sectionContent: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.sectionContent')?.value : null) || "Mechal Sport Club (Amharic: መቻል ስፖርት ክለብ) is a professional football club based in Ethiopia. The club represents excellence in Ethiopian football and is committed to developing young talent and achieving success on the pitch.",
    historyTitle: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyTitle')?.value : null) || 'The Legacy of Mechal FC',
    historyContent1: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyContent1')?.value : null) || "Mechal FC is a proud Ethiopian football club with a passionate fan base. The club plays its home matches with dedicated supporters cheering them on to victory.",
    historyContent2: (Array.isArray(settings) ? settings.find((s: any) => s.key === 'about.historyContent2')?.value : null) || "Mechal FC continues to build on its legacy of Ethiopian football excellence. The club is dedicated to developing young talent and achieving success both domestically and in continental competitions.",
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
              <img src={ASSETS.logo} alt="Mechal FC Crest" className="w-48 h-48 object-contain mx-auto" />
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

          <div className="my-12 not-prose">
            <img 
              src="/images/about-stadium.jpg" 
              alt="Mechal Sport Club Stadium" 
              className="w-full rounded-lg shadow-lg"
            />
            <p className="text-center text-muted-foreground mt-4 text-sm">Mechal Sport Club - Ethiopian Football Excellence</p>
          </div>

          <h3>{aboutContent.missionTitle}</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To represent Ethiopia with pride and excellence on all football stages.</li>
            <li>To develop young talent through our youth academy programs.</li>
            <li>To compete at the highest level in domestic and continental competitions.</li>
            <li>To build a legacy of sporting excellence and community pride.</li>
          </ul>
        </div>
      </div>
    </PublicLayout>
  );
}
