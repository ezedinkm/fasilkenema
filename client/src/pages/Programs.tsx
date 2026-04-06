import { Link } from 'wouter';
import PublicLayout from '@/components/PublicLayout';
import { useApp } from '@/lib/context';

const SECTIONS = [
  { path: '/programs/basketball', title: 'Basketball', description: 'Our basketball program brings together youth and community through training, leagues, and competitions. The club supports both male and female teams and fosters talent at all levels.' },
  { path: '/programs/boxing', title: 'Boxing', description: 'The boxing program at Fasil Kenema builds discipline, fitness, and competitive spirit. We offer training for beginners and support athletes who compete at regional and national level.' },
  { path: '/programs/handball', title: 'Handball', description: 'Handball is a key part of our multi-sport offering. Our handball section runs regular training and participates in domestic competitions, growing the sport within the club and the community.' },
  { path: '/programs/charity', title: 'Charity Work', description: 'Beyond sport, we give back through charity work: community outreach, support for underprivileged youth, health and education initiatives, and partnerships with local organisations. Together we build a stronger community.' },
];

export default function Programs() {
  const { t } = useApp();

  return (
    <PublicLayout>
      <div className="bg-white py-12 md:py-20">
        <div className="container px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.programs')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beyond football — basketball, boxing, handball, and our charity work in the community.
          </p>
        </div>
      </div>

      <div className="container px-4 py-12 max-w-3xl mx-auto space-y-12 md:space-y-16">
        {SECTIONS.map((section) => (
          <section key={section.path} className="scroll-mt-24">
            <Link href={section.path}>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-red-600 mb-4 hover:text-red-700 hover:underline">
                {section.title}
              </h2>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-4">
              {section.description}
            </p>
            <Link
              href={section.path}
              className="inline-block text-red-600 font-semibold hover:text-red-700 hover:underline"
            >
              View {section.title} →
            </Link>
          </section>
        ))}
      </div>
    </PublicLayout>
  );
}
