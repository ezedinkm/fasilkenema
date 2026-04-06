export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "ti", label: "ትግርኛ", flag: "🇪🇹" },
  { code: "om", label: "Afaan Oromoo", flag: "🇪🇹" },
  { code: "so", label: "Soomaali", flag: "🇸🇴" },
];
import news1 from "@/assets/stadium/1 (1).jpg";
import news2 from "@/assets/stadium/1 (2).jpg";
import news3 from "@/assets/stadium/1 (3).jpg";
import news4 from "@/assets/stadium/1 (4).jpg";
import news5 from "@/assets/stadium/1 (5).jpg";
import news6 from "@/assets/stadium/1 (6).jpg";

export const MEMBERSHIP_TIERS = [
  {
    id: "tewodros-level",
    name: "የቴዎድሮስ ደረጃ ደጋፊ (Tewodros Level)",
    price: { etb: 36000, usd: 300 },
    benefits: [
      "All VIP Benefits",
      "Executive Box Access",
      "Official Club Ambassador Status",
      "Full Season Pass",
    ],
    color:
      "from-amber-400 via-yellow-500 to-amber-600 bg-gradient-to-r text-black shadow-lg shadow-yellow-500/20 border border-yellow-400/30",
    recommended: true,
  },
  {
    id: "platinum-level",
    name: "የፕላቲኒየም ደረጃ ደጋፊ (Platinum Level)",
    price: { etb: 12000, usd: 100 },
    benefits: [
      "All Gold Benefits",
      "Signed Jersey",
      "Priority VIP Parking",
      "Annual Gala Invite",
    ],
    color:
      "from-gray-300 via-gray-200 to-gray-300 bg-gradient-to-r text-gray-900 shadow-lg shadow-gray-400/20 border border-gray-300/50",
    recommended: false,
  },
  {
    id: "diamond-level",
    name: "የቋራ ደረጃ ደጋፊ (Diamond Level)",
    price: { etb: 8000, usd: 67 },
    benefits: [
      "All Gold Benefits",
      "Quarterly Meet & Greet",
      "Exclusive Diamond Lounge Access",
    ],
    color:
      "from-cyan-300 via-blue-300 to-cyan-400 bg-gradient-to-r text-blue-950 shadow-lg shadow-blue-400/20 border border-blue-300/50",
    recommended: false,
  },
  {
    id: "emerald-level",
    name: "የምንትዋብ ደረጃ ደጋፊ (Mentwab Level)",
    price: { etb: 6000, usd: 50 },
    benefits: [
      "All Gold Benefits",
      "Dedicated Match Day Host",
      "Special Edition Scarf",
    ],
    color:
      "from-emerald-500 via-green-500 to-emerald-600 bg-gradient-to-r text-white shadow-lg shadow-green-500/20 border border-green-400/30",
    recommended: false,
  },
  {
    id: "zebel-level",
    name: "የዞበል ደረጃ ደጋፊ (Zebel Level)",
    price: { etb: 4000, usd: 33 },
    benefits: ["Stadium Tour", "Match Day Program", "15% Store Discount"],
    color:
      "from-purple-500 via-purple-600 to-purple-700 bg-gradient-to-r text-white shadow-lg shadow-purple-500/20 border border-purple-400/30",
    recommended: false,
  },
  {
    id: "ras-level",
    name: "የራስ ደረጃ ደጋፊ (Ras Level)",
    price: { etb: 2000, usd: 17 },
    benefits: ["Priority Ticket Access", "Membership Pin", "Digital Magazine"],
    color:
      "from-red-500 via-red-600 to-red-700 bg-gradient-to-r text-white shadow-lg shadow-red-500/20 border border-red-400/30",
    recommended: false,
  },
  {
    id: "gold-level",
    name: "የወርቅ ደረጃ ደጋፊ (Gold Level)",
    price: { etb: 1200, usd: 10 },
    benefits: ["10% Store Discount", "Voting Rights", "Annual Member Gift"],
    color:
      "from-amber-300 via-yellow-400 to-amber-400 bg-gradient-to-r text-amber-950 shadow-lg shadow-yellow-400/20 border border-yellow-300/50",
    recommended: false,
  },
  {
    id: "silver-level",
    name: "የብር ደረጃ ደጋፊ (Silver Level)",
    price: { etb: 600, usd: 5 },
    benefits: ["Membership Card", "Monthly Newsletter", "SMS Updates"],
    color:
      "from-gray-400 via-gray-300 to-gray-400 bg-gradient-to-r text-gray-900 shadow-lg shadow-gray-400/20 border border-gray-300/50",
    recommended: false,
  },
  {
    id: "bronze-level",
    name: "የነሐስ ደረጃ ደጋፊ (Bronze Level)",
    price: { etb: 300, usd: 2.5 },
    benefits: ["Digital Membership Card", "SMS Updates"],
    color:
      "from-amber-600 via-orange-500 to-amber-600 bg-gradient-to-r text-white shadow-lg shadow-orange-500/20 border border-orange-400/30",
    recommended: false,
  },
  {
    id: "youth-level",
    name: "የህፃናት (Youth/Children)",
    price: { etb: 120, usd: 1 },
    benefits: [
      "Youth Academy Access",
      "Kids Match Day Kit",
      "Birthday Shoutout",
    ],
    color:
      "from-sky-400 via-blue-400 to-sky-500 bg-gradient-to-r text-white shadow-lg shadow-blue-400/20 border border-blue-300/50",
    recommended: false,
  },
];

export const NEWS_POSTS = [
  {
    id: 1,
    slug: "addis-derby-victory",
    title: "ፋሲል ከነማ በአዲስ ደርቢ 2-0 አሸናፊ! | Fasil Kenema FC Dominates Addis Derby",
    excerpt:
      "Fasil Kenema FC secured another historic derby victory at Addis Ababa Stadium. ፋሲል ከነማ በታላቁ የአዲስ ደርቢ ታሪካዊ ድል አስመዘገበ።",
    date: "2025-12-05",
    image: news1,
    category: "ግጥሚያ | Match Report",
  },
  {
    id: 2,
    slug: "premier-league-champions",
    title: "Fasil Kenema FC Crowned 2025 Premier League Champions",
    excerpt:
      "Fasil Kenema FC clinches the Ethiopian Premier League title, cementing their legacy as a top club in Ethiopian football history.",
    date: "2025-12-03",
    image: news2,
    category: "ሊግ | League News",
  },
  {
    id: 3,
    slug: "youth-academy-expansion",
    title: "ፋሲል ከነማ አካዳሚ | Fasil Kenema FC Youth Academy Grows",
    excerpt:
      "The Fasil Kenema FC Youth Academy continues to develop Ethiopia's next generation of football stars. ለወጣቶች የእግር ኳስ ስልጠና ማዕከል ተስፋፋ።",
    date: "2025-11-28",
    image: news3,
    category: "ማህበረሰብ | Community",
  },
  {
    id: 4,
    slug: "pre-season-training-camp",
    title: "Fasil Kenema FC Complete Intensive Pre-Season Camp",
    excerpt:
      "Fasil Kenema FC squad returns fit and ready after a successful training camp, focusing on fitness, tactics, and team bonding ahead of the new season.",
    date: "2025-11-20",
    image: news4,
    category: "ስልጠና | Training",
  },
  {
    id: 5,
    slug: "ethiopian-cup-champions-2025",
    title:
      "ፋሲል ከነማ የኢትዮጵያ ዋንጫ ሻምፒዮን! | Fasil Kenema FC Ethiopian Cup Champions 2025",
    excerpt:
      "Historic Ethiopian Cup victory! Captain lifts the trophy as thousands of passionate fans celebrate at the stadium.",
    date: "2025-11-15",
    image: news5,
    category: "ዋንጫ | Trophy",
  },
  {
    id: 6,
    slug: "new-stadium-construction",
    title: "New Fasil Kenema FC Stadium Construction Update",
    excerpt:
      "The stadium project funded by supporters is progressing on schedule. A new home for Fasil Kenema FC!",
    date: "2025-11-10",
    image: news6,
    category: "ክለብ | Club News",
  },
];

export const ASSETS = {
  logo: "/fasillogo.png",
  hero: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80",
};

export const MOCK_MEMBER = {
  firstName: "Dawit",
  lastName: "Tadesse",
  membershipId: "SG-2025-1935",
  tier: "PREMIUM",
  status: "ACTIVE",
  expiryDate: "2026-05-21",
};
