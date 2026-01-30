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
    color: 'bg-primary text-black',
    recommended: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: { etb: 5000, usd: 150 },
    benefits: ['All Premium Benefits', 'VIP Stadium Seating', 'Meet & Greet Players', 'Exclusive Merchandise'],
    color: 'bg-secondary text-white',
    recommended: false,
  },
];

export const NEWS_POSTS = [
  {
    id: 1,
    slug: 'addis-derby-victory',
    title: 'መቻል በአዲስ ደርቢ 2-0 አሸናፊ! | Mechal FC Dominates Addis Derby',
    excerpt: 'Mechal FC secured another historic derby victory at Addis Ababa Stadium. መቻል በታላቁ የአዲስ ደርቢ ታሪካዊ ድል አስመዘገበ።',
    date: '2025-12-05',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    category: 'ግጥሚያ | Match Report',
  },
  {
    id: 2,
    slug: 'premier-league-champions',
    title: 'Mechal FC Crowned 2025 Premier League Champions',
    excerpt: 'Mechal FC clinches the Ethiopian Premier League title, cementing their legacy as a top club in Ethiopian football history.',
    date: '2025-12-03',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    category: 'ሊግ | League News',
  },
  {
    id: 3,
    slug: 'youth-academy-expansion',
    title: 'መቻል አካዳሚ | Mechal FC Youth Academy Grows',
    excerpt: 'The Mechal FC Youth Academy continues to develop Ethiopia\'s next generation of football stars. ለወጣቶች የእግር ኳስ ስልጠና ማዕከል ተስፋፋ።',
    date: '2025-11-28',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    category: 'ማህበረሰብ | Community',
  },
  {
    id: 4,
    slug: 'pre-season-training-camp',
    title: 'Mechal FC Complete Intensive Pre-Season Camp',
    excerpt: 'Mechal FC squad returns fit and ready after a successful training camp, focusing on fitness, tactics, and team bonding ahead of the new season.',
    date: '2025-11-20',
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80',
    category: 'ስልጠና | Training',
  },
  {
    id: 5,
    slug: 'ethiopian-cup-champions-2025',
    title: 'መቻል የኢትዮጵያ ዋንጫ ሻምፒዮን! | Mechal FC Ethiopian Cup Champions 2025',
    excerpt: 'Historic Ethiopian Cup victory! Captain lifts the trophy as thousands of passionate fans celebrate at the stadium.',
    date: '2025-11-15',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    category: 'ዋንጫ | Trophy',
  },
  {
    id: 6,
    slug: 'new-stadium-construction',
    title: 'New Mechal FC Stadium Construction Update',
    excerpt: 'The stadium project funded by supporters is progressing on schedule. A new home for Mechal FC!',
    date: '2025-11-10',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
    category: 'ክለብ | Club News',
  },
];

export const ASSETS = {
  logo: '/mechal-logo.jpg',
  hero: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80',
};

export const MOCK_MEMBER = {
  firstName: 'Dawit',
  lastName: 'Tadesse',
  membershipId: 'SG-2025-1935',
  tier: 'PREMIUM',
  status: 'ACTIVE',
  expiryDate: '2026-05-21',
};
