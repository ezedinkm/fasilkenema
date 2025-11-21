import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ASSETS } from '@/lib/mockData';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-zinc-100 py-12 md:py-20">
          <div className="container px-4 text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary mb-4">Our History</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From the historic city of Gondar to the pinnacle of Ethiopian football.</p>
          </div>
        </div>

        <div className="container px-4 py-16 max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-12 not-prose">
              <div className="w-full md:w-1/2">
                <img src={ASSETS.logo} alt="Fasil Kenema Crest" className="w-48 h-48 object-contain mx-auto" />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="font-heading text-3xl font-bold mb-4">The Emperors</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Fasil Kenema S.C. (Amharic: ፋሲል ከነማ ስፖርት ክለብ) is a professional Ethiopian football club based in Gondar, Amhara Region. The club was founded in 1968 (1960 E.C.) and plays in the Ethiopian Premier League, the top division of Ethiopian football.
                </p>
              </div>
            </div>

            <h3>The Golden Era</h3>
            <p>
              The club has a rich history deeply intertwined with the cultural heritage of Gondar. Named after Emperor Fasilides, who established Gondar as the capital of Ethiopia in the 17th century, the team embodies the royal spirit and resilience of the region.
            </p>
            <p>
              In the 2020-21 season, Fasil Kenema achieved its greatest sporting success to date, crowning themselves Champions of the Ethiopian Premier League for the first time in their history. This victory sparked celebrations across the city and cemented the club's status as a powerhouse in East African football.
            </p>

            <h3>Our Mission</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>To represent the city of Gondar and its people with pride and excellence.</li>
              <li>To develop young talent through our academy and youth programs.</li>
              <li>To compete at the highest level in domestic and continental competitions.</li>
              <li>To build a sustainable and professional sporting institution.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
