import logoImg from '@assets/generated_images/ethiopian_bunna_fc_logo.png';
import heroImg from '@assets/generated_images/maroon_brown_stadium_atmosphere.png';
import teamCelebrationImg from '@assets/generated_images/bunna_fc_goal_celebration.png';
import coachSidelinesImg from '@assets/generated_images/bunna_fc_coach_sidelines.png';
import stadiumFansImg from '@assets/generated_images/bunna_fc_stadium_fans.png';
import trophyCelebrationImg from '@assets/generated_images/bunna_fc_trophy_celebration.png';
import playerAutographsImg from '@assets/generated_images/bunna_fc_player_autographs.png';
import trainingSessionImg from '@assets/generated_images/bunna_fc_training_session.png';

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
    slug: 'sheger-derby-victory',
    title: 'ቡናማዎቹ በሸገር ደርቢ 3-1 አሸናፊ! | The Browns Dominate Sheger Derby',
    excerpt: 'Ethiopian Coffee secured a historic victory at Addis Ababa Stadium against fierce rivals Saint George. ኢትዮጵያ ቡና በአዲስ አበባ ስታዲየም ታሪካዊ ድል አስመዘገበ።',
    date: '2025-12-05',
    image: teamCelebrationImg,
    category: 'ግጥሚያ | Match Report',
  },
  {
    id: 2,
    slug: 'ethiopian-premier-league-top',
    title: 'Ethiopian Coffee Leads Premier League Table',
    excerpt: 'With 8 consecutive wins, The Browns sit proudly at the top of the Betking Ethiopian Premier League, bringing glory to their passionate coffee-loving fans.',
    date: '2025-12-03',
    image: stadiumFansImg,
    category: 'ሊግ | League News',
  },
  {
    id: 3,
    slug: 'community-youth-program',
    title: 'ቡናማዎቹ ለወጣቶች | Browns Youth Academy Expands',
    excerpt: 'Ethiopian Coffee launches new youth development centers across Addis Ababa, nurturing the next generation of Ethiopian football talent. ለወጣቶች የእግር ኳስ ስልጠና ማዕከል ተከፈተ።',
    date: '2025-11-28',
    image: playerAutographsImg,
    category: 'ማህበረሰብ | Community',
  },
  {
    id: 4,
    slug: 'pre-season-training-camp',
    title: 'The Browns Complete Intensive Pre-Season Camp',
    excerpt: 'The squad returns fit and ready after a successful training camp, focusing on fitness, tactics, and team bonding ahead of the new season.',
    date: '2025-11-20',
    image: trainingSessionImg,
    category: 'ስልጠና | Training',
  },
  {
    id: 5,
    slug: 'ethiopian-cup-champions',
    title: 'ኢትዮጵያ ቡና የኢትዮጵያ ዋንጫ ሻምፒዮን! | Ethiopian Cup Champions 2025',
    excerpt: 'Historic moment at Addis Ababa Stadium as Ethiopian Coffee lifts the Ethiopian Cup trophy! Captain hoists the cup as thousands of fans celebrate.',
    date: '2025-11-15',
    image: trophyCelebrationImg,
    category: 'ዋንጫ | Trophy',
  },
  {
    id: 6,
    slug: 'stadium-renovation-announcement',
    title: 'Addis Ababa Stadium Renovation Project Announced',
    excerpt: 'Major upgrades coming to our beloved home ground! The historic Addis Ababa Stadium will receive modern facilities while preserving its connection to Ethiopian football heritage.',
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
  membershipId: 'EC-2025-8832',
  tier: 'PREMIUM',
  status: 'ACTIVE',
  expiryDate: '2026-05-21',
};
