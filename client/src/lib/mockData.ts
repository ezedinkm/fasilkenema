import logoImg from '@assets/generated_images/fasil_kenema_fc_logo_concept.png';
import heroImg from '@assets/generated_images/red_and_white_stadium_atmosphere.png';
import news1Img from '@assets/generated_images/football_players_celebrating.png';
import news2Img from '@assets/generated_images/coach_on_sidelines.png';
import stadiumFansImg from '@assets/generated_images/ethiopian_football_stadium_fans.png';
import teamCelebrationImg from '@assets/generated_images/ethiopian_football_team_celebration.png';
import playerAutographsImg from '@assets/generated_images/ethiopian_player_signing_autographs.png';
import trainingSessionImg from '@assets/generated_images/ethiopian_football_training_session.png';
import trophyCelebrationImg from '@assets/generated_images/ethiopian_football_trophy_celebration.png';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ti', label: 'ትግርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
];

export const MEMBERSHIP_TIERS = [
  {
    id: 'regular',
    name: 'Regular',
    price: { etb: 500, usd: 15 },
    benefits: ['Digital Membership Card', 'SMS Updates', 'Access to Fan Events'],
    color: 'bg-gray-100 text-gray-900',
    recommended: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { etb: 1500, usd: 45 },
    benefits: ['All Regular Benefits', 'Priority Ticket Booking', '10% Store Discount', 'Vote on Club Matters'],
    color: 'bg-primary text-white',
    recommended: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: { etb: 5000, usd: 150 },
    benefits: ['All Premium Benefits', 'VIP Stadium Seating', 'Meet & Greet Players', 'Exclusive Merchandise'],
    color: 'bg-yellow-500 text-black',
    recommended: false,
  },
];

export const NEWS_POSTS = [
  {
    id: 1,
    slug: 'gondar-derby-victory',
    title: 'አፄዎቹ በጎንደር ዳርቢ 3-0 አሸናፊ! | Emperors Dominate Gondar Derby',
    excerpt: 'ፋሲል ከነማ በፋሲለደስ ስታዲየም ታሪካዊ ድል አስመዘገበ። ኮከባችን ሁለት ግቦችን አስቆጠረ። The Emperors showcased their dominance at the historic Fasiledes Stadium.',
    date: '2025-12-05',
    image: teamCelebrationImg,
    category: 'ግጥሚያ | Match Report',
  },
  {
    id: 2,
    slug: 'ethiopian-premier-league-top',
    title: 'Fasil Kenema Leads Ethiopian Premier League Table',
    excerpt: 'With 8 consecutive wins, The Emperors sit proudly at the top of the Betking Ethiopian Premier League, bringing glory to Gondar and the Amhara region.',
    date: '2025-12-03',
    image: stadiumFansImg,
    category: 'ሊግ | League News',
  },
  {
    id: 3,
    slug: 'community-youth-program',
    title: 'አፄዎቹ ለወጣቶች | Emperors Youth Academy Expands',
    excerpt: 'Fasil Kenema launches new youth development centers across Gondar, nurturing the next generation of Ethiopian football talent. ለወጣቶች የእግር ኳስ ስልጠና ማዕከል ተከፈተ።',
    date: '2025-11-28',
    image: playerAutographsImg,
    category: 'ማህበረሰብ | Community',
  },
  {
    id: 4,
    slug: 'pre-season-training-camp',
    title: 'Emperors Complete Intensive Pre-Season Camp in Bahir Dar',
    excerpt: 'The squad returns fit and ready after a successful training camp at Lake Tana, focusing on fitness, tactics, and team bonding ahead of the new season.',
    date: '2025-11-20',
    image: trainingSessionImg,
    category: 'ስልጠና | Training',
  },
  {
    id: 5,
    slug: 'ethiopian-cup-champions',
    title: 'ፋሲል ከነማ የኢትዮጵያ ዋንጫ ሻምፒዮን! | Ethiopian Cup Champions 2025',
    excerpt: 'Historic moment at Addis Ababa Stadium as Fasil Kenema lifts the Ethiopian Cup trophy! Captain Amanuel hoists the cup as thousands of Gondar fans celebrate.',
    date: '2025-11-15',
    image: trophyCelebrationImg,
    category: 'ዋንጫ | Trophy',
  },
  {
    id: 6,
    slug: 'new-stadium-announcement',
    title: 'Fasiledes Stadium Renovation Project Announced',
    excerpt: 'Major upgrades coming to our beloved home ground! The historic Fasiledes Stadium will receive modern facilities while preserving its connection to Gondarine heritage.',
    date: '2025-11-10',
    image: heroImg,
    category: 'ክለብ | Club News',
  },
];

export const ASSETS = {
  logo: logoImg,
  hero: heroImg,
};

export const MOCK_MEMBER = {
  firstName: 'Abebe',
  lastName: 'Kebede',
  membershipId: 'FK-2025-8832',
  tier: 'PREMIUM',
  status: 'ACTIVE',
  expiryDate: '2026-05-21',
};
