import logoImg from '@assets/generated_images/fasil_kenema_fc_logo_concept.png';
import heroImg from '@assets/generated_images/red_and_white_stadium_atmosphere.png';
import news1Img from '@assets/generated_images/football_players_celebrating.png';
import news2Img from '@assets/generated_images/coach_on_sidelines.png';

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
    slug: 'victory-at-home',
    title: 'Emperors Secure 3-0 Victory at Fasiledes Stadium',
    excerpt: 'Fasil Kenema dominated the game from start to finish, with a stunning brace from our star striker.',
    date: '2025-05-20',
    image: news1Img,
    category: 'Match Report',
  },
  {
    id: 2,
    slug: 'new-signing',
    title: 'Official: New Midfield Maestro Joins The Emperors',
    excerpt: 'We are delighted to announce the signing of one of the league\'s top talents to bolster our squad.',
    date: '2025-05-18',
    image: news2Img,
    category: 'Transfer News',
  },
  {
    id: 3,
    slug: 'season-tickets',
    title: '2025/26 Season Ticket Sales Open Now',
    excerpt: 'Secure your seat at the castle! Season tickets are now available for purchase online and at the stadium.',
    date: '2025-05-15',
    image: heroImg,
    category: 'Club News',
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
