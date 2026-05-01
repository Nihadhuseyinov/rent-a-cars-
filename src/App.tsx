/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Fuel,
  Gauge,
  Settings,
  CheckCircle2,
  ArrowRight,
  Heart,
  Search,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Car,
  Wallet,
  HeadphonesIcon,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Navigation,
  Globe,
  Plus,
  Trash2,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Send,
  MessageSquare,
  Bot,
  Zap,
  Eye
} from "lucide-react";

// --- COMPATIBILITY WRAPPERS (To replace Next.js features in Vite) ---

function Link({ href, children, className, onClick, target, rel }: any) {
  return (
    <a 
      href={href} 
      className={className} 
      onClick={onClick} 
      target={target} 
      rel={rel}
      id={`link-${href.replace(/[^a-zA-Z0-9]/g, '-')}`}
    >
      {children}
    </a>
  );
}

function Image({ src, alt, fill, className, priority }: any) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : {}}
      loading={priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
    />
  );
}

// Simple WhatsApp Icon fallback if missing from lucide
function WhatsApp({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// ─── DATA & TYPES ─────────────────────────────────────────────

interface CarType {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  oldPrice?: number;
  image: string;
  images: string[];
  seats: number;
  transmission: string;
  fuel: string;
  rating: number;
  reviews: number;
  isPremium?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  car: string;
  date: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
  description: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FAQItem {
  question: string;
  answer: string;
}

const TRANSLATIONS = {
  az: {
    home: "Ana Səhifə", fleet: "Flotumuz", about: "Haqqımızda", blog: "Bloq", contact: "Əlaqə", signIn: "Giriş",
    bookNow: "İndi Sifariş Et", heroTitle: "Mükəmməlliyi Bakıda Yaşayın", exploreFleet: "Flotu Kəşf Et",
    aboutTitle: "Elite Drive Haqqında", blogTitle: "Son Xəbərlər", contactTitle: "Bizimlə Əlaqə",
    phone: "Telefon", address: "Ünvan", email: "E-poçt", adminPanel: "Admin Panel", addCar: "Avtomobil Əlavə Et",
    howItWorks: "Necə İşləyir", testimonials: "Rəylər", newsletter: "Xəbər Bülleteni",
    fleetTitle: "Seçilmiş Flot", fleetDesc: "Mükəmməl təcrübə üçün seçilmiş lüks avtomobillər.",
    subscribe: "Abunə Ol", emailPlaceholder: "Email ünvanınızı daxil edin",
    subSuccess: "Təbriklər! Siz artıq Elite Club üzvüsünüz.",
    aiBotTitle: "Elite Assistant", aiBotPlaceholder: "Mənə Elite Drive haqqında sual verin...",
    desc: "Azərbaycanın ən nüfuzlu lüks avtomobil icarəsi xidməti.",
    allRights: "Bütün hüquqlar qorunur.",
    faq: "Tez-tez Verilən Suallar",
    verificationSent: "Təsdiq kodu email ünvanınıza göndərildi",
    verify: "Təsdiqlə",
    resend: "Yenidən göndər",
    category: "Kateqoriya",
    fuel: "Yanacaq",
    editCar: "Avtomobilə Düzəliş Et",
    save: "Yadda Saxla",
    all: "Hamısı",
    vip: "VIP"
  },
  en: {
    home: "Home", fleet: "Our Fleet", about: "About", blog: "Blog", contact: "Contact", signIn: "Sign In",
    bookNow: "Book Now", heroTitle: "Experience Excellence in Baku", exploreFleet: "Explore Fleet",
    aboutTitle: "About Elite Drive", blogTitle: "Latest News", contactTitle: "Contact Us",
    phone: "Phone", address: "Address", email: "Email", adminPanel: "Admin Panel", addCar: "Add Car",
    howItWorks: "How It Works", testimonials: "Testimonials", newsletter: "Newsletter",
    fleetTitle: "Featured Fleet", fleetDesc: "Handpicked luxury vehicles for an exceptional experience.",
    subscribe: "Subscribe", emailPlaceholder: "Enter your email",
    subSuccess: "Success! You are now an Elite Club member.",
    aiBotTitle: "Elite Assistant", aiBotPlaceholder: "Ask me anything about Elite Drive...",
    desc: "Azerbaijan's premier luxury car rental service.",
    allRights: "All rights reserved.",
    faq: "Frequently Asked Questions",
    verificationSent: "Verification code sent to your email",
    verify: "Verify",
    resend: "Resend",
    category: "Category",
    fuel: "Fuel",
    editCar: "Edit Vehicle",
    save: "Save",
    all: "All",
    vip: "VIP",
    seats: "Seats",
    perDay: "Per Day"
  },
  ru: {
    home: "Главная", fleet: "Наш Флот", about: "О нас", blog: "Блог", contact: "Контакт", signIn: "Войти",
    bookNow: "Забронировать", heroTitle: "Опыт Совершенства в Баку", exploreFleet: "Исследовать Флот",
    aboutTitle: "Об Elite Drive", blogTitle: "Последние Новости", contactTitle: "Связаться с нами",
    phone: "Телефон", address: "Адрес", email: "Почта", adminPanel: "Админ Панель", addCar: "Добавить авто",
    howItWorks: "Как это работает", testimonials: "Отзывы", newsletter: "Рассылка",
    fleetTitle: "Избранный Флот", fleetDesc: "Отобранные роскошные автомобили для исключительного опыта.",
    subscribe: "Подписаться", emailPlaceholder: "Введите ваш email",
    subSuccess: "Успех! Теперь вы член Elite Club.",
    aiBotTitle: "Elite Assistant", aiBotPlaceholder: "Спросите меня об Elite Drive...",
    desc: "Премьер-сервис по прокату роскошных автомобилей в Азербайджане.",
    allRights: "Все права защищены.",
    faq: "Часто задаваемые вопросы",
    verificationSent: "Код подтверждения отправлен на вашу почту",
    verify: "Подтвердить",
    resend: "Отправить снова",
    category: "Категория",
    fuel: "Топливо",
    editCar: "Редактировать",
    save: "Сохранить",
    all: "Все",
    vip: "VIP",
    seats: "Мест",
    perDay: "За день"
  },
  tr: {
    home: "Ana Sayfa", fleet: "Filomuz", about: "Hakkımızda", blog: "Blog", contact: "İletişim", signIn: "Giriş Yap",
    bookNow: "Şimdi Rezervasyon Yap", heroTitle: "Bakü'de Mükemmelliği Yaşayın", exploreFleet: "Filoyu Keşfet",
    aboutTitle: "Elite Drive Hakkında", blogTitle: "Son Haberler", contactTitle: "Bize Ulaşın",
    phone: "Telefon", address: "Adres", email: "E-posta", adminPanel: "Yönetici Paneli", addCar: "Araç Ekle",
    howItWorks: "Nasıl Çalışır", testimonials: "Yorumlar", newsletter: "Bülten",
    fleetTitle: "Öne Çıkan Filo", fleetDesc: "Olağanüstü bir deneyim için özenle seçilmiş lüks araçlar.",
    subscribe: "Abone Ol", emailPlaceholder: "E-posta adresinizi girin",
    subSuccess: "Tebrikler! Artık Elite Club üyesisiniz.",
    aiBotTitle: "Elite Asistan", aiBotPlaceholder: "Elite Drive hakkında bana her şeyi sorabilirsiniz...",
    desc: "Azerbaycan'nın önde gelen lüks araç kiralama hizmeti.",
    allRights: "Tüm hakları saklıdır.",
    faq: "Sıkça Sorulan Sorular",
    verificationSent: "Doğrulama kodu e-postanıza gönderildi",
    verify: "Doğrula",
    resend: "Tekrar gönder",
    category: "Kategori",
    fuel: "Yakıt",
    editCar: "Aracı Düzenle",
    save: "Kaydet",
    all: "Hepsi",
    vip: "VIP",
    seats: "Koltuk",
    perDay: "Günlük"
  },
  ar: {
    home: "الرئيسية", fleet: "أسطولنا", about: "من نحن", blog: "المدونة", contact: "اتصل بنا", signIn: "تسجيل الدخول",
    bookNow: "احجز الآن", heroTitle: "تجربة التميز في باكو", exploreFleet: "استكشف الأسطول",
    aboutTitle: "حول إيليت درايف", blogTitle: "آخر الأخبار", contactTitle: "اتصل بنا",
    phone: "هاتف", address: "عنوان", email: "بريد الكتروني", adminPanel: "لوحة التحكم", addCar: "إضافة سيارة",
    howItWorks: "كيف يعمل", testimonials: "المراجعات", newsletter: "النشرة الإخبارية",
    fleetTitle: "الأسطول المتميز", fleetDesc: "سيارات فاخرة مختارة بعناية لتجربة استثنائية.",
    subscribe: "اشترك", emailPlaceholder: "أدخل بريدك الإلكتروني",
    subSuccess: "نجاح! أنت الآن عضو في نادي إيليت.",
    aiBotTitle: "Elite Assistant", aiBotPlaceholder: "اسألني أي شيء عن إيليت درايف...",
    desc: "خدمة تأجير السيارات الفاخرة الأولى في أذربيجان.",
    allRights: "جميع الحقوق محفوظة.",
    faq: "الأسئلة الشائعة"
  }
};

const LANGUAGES = [
  { id: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { id: 'en', name: 'EN', flag: '🇺🇸' },
  { id: 'ru', name: 'RU', flag: '🇷🇺' },
  { id: 'tr', name: 'TR', flag: '🇹🇷' },
  { id: 'ar', name: 'AR', flag: '🇦🇪' }
] as const;

// ─── MOCK DATA ────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1920&q=80",
    title: "Drive the Extraordinary",
    subtitle: "Premium car rental experience in Baku",
    cta: "Explore Fleet"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80",
    title: "Luxury Redefined",
    subtitle: "2024 Mercedes-Benz S-Class & more",
    cta: "Book Now"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&q=80",
    title: "Elite Performance",
    subtitle: "Sports cars for the discerning driver",
    cta: "View Collection"
  }
];

const FEATURED_CARS: CarType[] = [
  {
    id: "1",
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    model: "S 580",
    year: 2024,
    category: "luxury",
    pricePerDay: 350,
    oldPrice: 420,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    images: [],
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.9,
    reviews: 128,
    isPremium: true,
    isFeatured: true
  },
  {
    id: "2",
    name: "BMW 7 Series",
    brand: "BMW",
    model: "740i",
    year: 2024,
    category: "luxury",
    pricePerDay: 320,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    images: [],
    seats: 5,
    transmission: "Automatic",
    fuel: "Hybrid",
    rating: 4.8,
    reviews: 96,
    isPremium: true
  },
  {
    id: "3",
    name: "Range Rover Sport",
    brand: "Land Rover",
    model: "SVR",
    year: 2023,
    category: "suv",
    pricePerDay: 280,
    oldPrice: 310,
    image: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&q=80",
    images: [],
    seats: 7,
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.7,
    reviews: 84,
    isFeatured: true
  },
  {
    id: "4",
    name: "Porsche 911 Carrera",
    brand: "Porsche",
    model: "911",
    year: 2024,
    category: "sports",
    pricePerDay: 450,
    image: "https://images.unsplash.com/photo-1503376763036-066120622c74?w=800&q=80",
    images: [],
    seats: 2,
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 5.0,
    reviews: 64,
    isPremium: true,
    isNew: true
  },
  {
    id: "5",
    name: "Audi A8 L",
    brand: "Audi",
    model: "A8",
    year: 2024,
    category: "luxury",
    pricePerDay: 300,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
    images: [],
    seats: 5,
    transmission: "Automatic",
    fuel: "Hybrid",
    rating: 4.8,
    reviews: 72,
    isPremium: true
  },
  {
    id: "6",
    name: "Toyota Land Cruiser",
    brand: "Toyota",
    model: "LC 300",
    year: 2024,
    category: "suv",
    pricePerDay: 200,
    oldPrice: 240,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    images: [],
    seats: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 4.6,
    reviews: 156,
    isFeatured: true
  }
];

const CATEGORIES: Category[] = [
  {
    id: "economy",
    name: "Economy",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
    count: 15,
    description: "Fuel-efficient daily drivers"
  },
  {
    id: "business",
    name: "Business Class",
    image: "https://images.unsplash.com/photo-1552519507-da3b1425f357?w=600&q=80",
    count: 22,
    description: "Professional comfort"
  },
  {
    id: "suv",
    name: "SUV & 4x4",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80",
    count: 18,
    description: "Adventure ready"
  },
  {
    id: "luxury",
    name: "Luxury",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
    count: 12,
    description: "Ultimate prestige"
  },
  {
    id: "sports",
    name: "Sports",
    image: "https://images.unsplash.com/photo-1503376763036-066120622c74?w=600&q=80",
    count: 8,
    description: "Pure adrenaline"
  },
  {
    id: "electric",
    name: "Electric",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80",
    count: 6,
    description: "Future of driving"
  }
];

const FEATURES: Feature[] = [
  {
    icon: <Car className="w-8 h-8" />,
    title: "2020+ Model Fleet",
    description: "All vehicles are brand new or nearly new, ensuring reliability and modern features for every journey."
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Instant Confirmation",
    description: "Book your car in under 2 minutes with our streamlined reservation system and immediate email confirmation."
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8" />,
    title: "24/7 Premium Support",
    description: "Our dedicated concierge team is available around the clock to assist with any needs or emergencies."
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Full Insurance Coverage",
    description: "Comprehensive insurance included with every rental. Drive with complete peace of mind across Azerbaijan."
  },
  {
    icon: <MapPin className="w-8 h-8" />,
    title: "Free Baku Delivery",
    description: "Complimentary delivery and pickup anywhere in Baku city center. Airport transfers available."
  },
  {
    icon: <Wallet className="w-8 h-8" />,
    title: "Flexible Cancellation",
    description: "Plans changed? No problem. Free cancellation up to 24 hours before pickup with full refund."
  }
];

const HOW_IT_WORKS: Step[] = [
  {
    number: "01",
    title: "Choose Your Car",
    description: "Browse our premium fleet and select the perfect vehicle for your needs from our extensive collection.",
    icon: <Search className="w-6 h-6" />
  },
  {
    number: "02",
    title: "Book Online",
    description: "Select your dates, add any extras, and complete your reservation in just a few simple steps.",
    icon: <Calendar className="w-6 h-6" />
  },
  {
    number: "03",
    title: "Drive & Enjoy",
    description: "Pick up your car or have it delivered. Experience luxury driving with our 24/7 support behind you.",
    icon: <Car className="w-6 h-6" />
  },
  {
    number: "04",
    title: "Easy Return",
    description: "Return the vehicle at your convenience. We handle the inspection quickly and process your deposit refund.",
    icon: <CheckCircle2 className="w-6 h-6" />
  }
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Orkhan Mammadov",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    rating: 5,
    comment: "Absolutely flawless experience! The Mercedes S-Class was immaculate and the delivery to my hotel was punctual. Will definitely rent again.",
    car: "Mercedes-Benz S-Class",
    date: "March 2026"
  },
  {
    id: "2",
    name: "Leyla Aliyeva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    rating: 5,
    comment: "Best car rental service in Baku by far. The booking process was seamless and the Range Rover was perfect for our family trip to Gabala.",
    car: "Range Rover Sport",
    date: "February 2026"
  },
  {
    id: "3",
    name: "Tural Hasanov",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    rating: 4,
    comment: "Great selection of luxury vehicles. The Porsche 911 made my weekend unforgettable. Professional staff and transparent pricing.",
    car: "Porsche 911 Carrera",
    date: "January 2026"
  }
];

const STATS = [
  { value: "500+", label: "Happy Clients", icon: <Users className="w-6 h-6" /> },
  { value: "80+", label: "Premium Cars", icon: <Car className="w-6 h-6" /> },
  { value: "4.9", label: "Average Rating", icon: <Star className="w-6 h-6" /> },
  { value: "24/7", label: "Support Available", icon: <Clock className="w-6 h-6" /> }
];

const FAQ_DATA: FAQItem[] = [
  {
    question: "What documents do I need to rent a car?",
    answer: "You will need a valid driver's license (held for at least 2 years), passport or national ID, and a credit card for the security deposit. International visitors must provide a valid passport and international driving permit if required."
  },
  {
    question: "Is insurance included in the rental price?",
    answer: "Yes, basic third-party insurance is included with every rental. We also offer comprehensive full coverage insurance and premium protection packages for complete peace of mind during your rental period."
  },
  {
    question: "Can I pick up the car at Baku Airport?",
    answer: "Absolutely! We offer complimentary delivery to Heydar Aliyev International Airport. Simply provide your flight number during booking, and our representative will meet you at arrivals with your vehicle ready."
  },
  {
    question: "What is your cancellation policy?",
    answer: "We offer free cancellation up to 24 hours before your scheduled pickup time with a full refund. Cancellations within 24 hours may incur a one-day rental charge. No-shows are charged the full rental amount."
  },
  {
    question: "Are there any mileage restrictions?",
    answer: "All our rentals include unlimited mileage within Azerbaijan. For trips outside the country, please contact us in advance to arrange appropriate documentation and insurance coverage."
  },
  {
    question: "Can I add an additional driver?",
    answer: "Yes, you can add up to 2 additional drivers for a small daily fee. Each additional driver must meet the same documentation requirements and be present at pickup to sign the rental agreement."
  }
];

const BRANDS = [
  { name: "Mercedes-Benz", logo: "" },
  { name: "BMW", logo: "" },
  { name: "Audi", logo: "" },
  { name: "Porsche", logo: "" },
  { name: "Range Rover", logo: "" },
  { name: "Toyota", logo: "" }
];

// ─── ANIMATION VARIANTS ─────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// ─── SUB-COMPONENTS ─────────────────────────────────────────

function Navbar({ 
  lang, 
  setLang, 
  t, 
  user, 
  isAdmin, 
  onSignIn, 
  onSignOut 
}: { 
  lang: string, 
  setLang: (l: any) => void, 
  t: (k: keyof typeof TRANSLATIONS['az']) => string,
  user: any,
  isAdmin: boolean,
  onSignIn: () => void,
  onSignOut: () => void
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#", label: t('home') },
    { href: "#cars", label: t('fleet') },
    { href: "#about", label: t('about') },
    { href: "#blog", label: t('blog') },
    { href: "#contact", label: t('contact') }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${
        isScrolled 
          ? "bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B87333] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <Car className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-white tracking-wider">ELITE<span className="gold-text">DRIVE</span></span>
              <span className="text-[10px] text-gray-500 tracking-[0.3em] uppercase font-semibold">Premium Rentals</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                className="text-sm text-gray-300 hover:text-[#D4AF37] transition-colors duration-300 relative group uppercase tracking-wider font-semibold"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 gold-text" />
                {lang.toUpperCase()}
              </button>
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-10 right-0 bento-card p-2 min-w-[120px] shadow-2xl z-50 bg-[#111]"
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => { setLang(l.id); setIsLangMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${lang === l.id ? 'gold-bg text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {l.flag} {l.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link href="#admin" className="text-xs gold-text font-bold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                    Admin
                  </Link>
                )}
                <button onClick={onSignOut} className="text-sm text-gray-300 hover:text-red-400 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 font-bold"
              >
                <LogIn className="w-4 h-4 gold-text" />
                {t('signIn')}
              </button>
            )}
            
            <Link 
              href="#cars"
              className="px-6 py-2.5 gold-bg text-black font-bold text-sm rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {t('bookNow')}
            </Link>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-[#D4AF37] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0A0A0A]/98 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-6 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-bold text-gray-300 hover:text-[#D4AF37] transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/10">
                {LANGUAGES.map(l => (
                  <button 
                    key={l.id} 
                    onClick={() => { setLang(l.id); setIsMobileMenuOpen(false); }}
                    className={`py-2 rounded-lg text-center ${lang === l.id ? 'gold-bg text-black font-bold' : 'bg-white/5 text-white'}`}
                  >
                    {l.flag}
                  </button>
                ))}
              </div>
              <div className="pt-4 space-y-3">
                {!user ? (
                  <button 
                    onClick={() => { onSignIn(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-center py-3 border border-white/20 rounded-full text-white font-bold"
                  >
                    {t('signIn')}
                  </button>
                ) : (
                  <button 
                    onClick={() => { onSignOut(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-center py-3 border border-red-500/20 text-red-500 rounded-full font-bold"
                  >
                    Sign Out
                  </button>
                )}
                <Link 
                  href="#cars"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-3 gold-bg text-black font-bold rounded-full"
                >
                  {t('bookNow')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function AboutSection({ t }: { t: any }) {
  return (
    <section id="about" className="py-24 px-6 lg:px-8 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative h-[500px] rounded-3xl overflow-hidden bento-card p-0"
          >
             <Image src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80" alt="About" fill className="object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
             <div className="absolute bottom-10 left-10">
                <p className="text-xs gold-text uppercase tracking-widest font-bold mb-2">Established 2020</p>
                <h3 className="text-3xl font-display font-bold text-white italic">Leading in <span className="gold-text">Luxury</span></h3>
             </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 italic">{t('aboutTitle').split(' ')[0]} <span className="gold-text">{t('aboutTitle').split(' ').slice(1).join(' ')}</span></h2>
            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
              Azərbaycanın aparıcı lüks avtomobil icarəsi xidməti olaraq büdcənizə və zövqünüzə uyğun geniş seçim təklif edirik. Bizim missiyamız hər bir müştərinin Bakıda keçirdiyi vaxtı unudulmaz və rahat etməkdir.
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Elite Drive hər bir səyahəti özəl edir. Professional komandamız və premium xidmətimizlə siz lüksün dadını çıxaracaqsınız.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bento-card p-6 border-gold/10">
                <Car className="w-8 h-8 gold-text mb-4" />
                <h4 className="text-xl font-bold text-white mb-1">Yeni Model</h4>
                <p className="text-xs text-gray-500">2020+ İstehsalı olan bütün avtomobillər</p>
              </div>
              <div className="bento-card p-6 border-gold/10">
                <ShieldCheck className="w-8 h-8 gold-text mb-4" />
                <h4 className="text-xl font-bold text-white mb-1">Tam Siğorta</h4>
                <p className="text-xs text-gray-500">Tam arxayınlıqla idarə edin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BlogSection({ t }: { t: any }) {
  const blogs = [
    { title: "Bakıda Lüks Maşın Kirayəsi", date: "May 2026", img: "https://images.unsplash.com/photo-1503376763036-066120622c74?w=600&q=80" },
    { title: "Hava Limanı Transferi VIP", date: "Aprel 2026", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80" },
    { title: "Elite Drive ilə Yeni Səyahət", date: "Mart 2026", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80" }
  ];

  return (
    <section id="blog" className="py-24 px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 italic">{t('blogTitle')}</h2>
          <p className="text-gray-500">Lüks həyat tərzi və avtomobillər haqqında ən son yeniliklər.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((b, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} className="bento-card p-0 overflow-hidden group">
              <div className="h-56 relative">
                <Image src={b.img} alt={b.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <span className="text-[10px] gold-text font-bold uppercase tracking-widest">{b.date}</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-4 group-hover:gold-text transition-colors">{b.title}</h3>
                <Link href="#" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors">
                  Davamını Oxu <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ t }: { t: any }) {
  return (
    <section id="contact" className="py-24 px-6 lg:px-8 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bento-card p-10 gold-border">
             <h2 className="text-4xl font-display font-bold text-white mb-8 italic">{t('contactTitle')}</h2>
             <div className="space-y-8">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bento-card flex items-center justify-center gold-text">
                      <Phone className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">{t('phone')}</p>
                      <a href="tel:0504619303" className="text-xl font-bold text-white hover:gold-text">050 461 93 03</a>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bento-card flex items-center justify-center gold-text">
                      <Mail className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">{t('email')}</p>
                      <a href="mailto:info@elitedrive.az" className="text-xl font-bold text-white hover:gold-text">info@elitedrive.az</a>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bento-card flex items-center justify-center gold-text">
                      <MapPin className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">{t('address')}</p>
                      <p className="text-lg font-bold text-white">Nizami küçəsi 123, Bakı</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="bento-card p-10 gold-border bg-white/5 backdrop-blur-none">
             <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <input className="bg-black/50 border border-white/10 rounded-2xl px-6 py-4 focus:gold-border focus:outline-none" placeholder="Adınız" />
                   <input className="bg-black/50 border border-white/10 rounded-2xl px-6 py-4 focus:gold-border focus:outline-none" placeholder="Email" />
                </div>
                <input className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 focus:gold-border focus:outline-none" placeholder="Mövzu" />
                <textarea rows={4} className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 focus:gold-border focus:outline-none resize-none" placeholder="Mesajınız"></textarea>
                <button className="w-full gold-bg text-black font-bold py-4 rounded-2xl hover:scale-105 transition-transform">Göndər</button>
             </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminCarModal({ isOpen, onClose, onSave, car, t }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (carData: any) => void, 
  car?: any,
  t: any 
}) {
  const [name, setName] = useState(car?.name || "");
  const [price, setPrice] = useState(car?.pricePerDay || "");
  const [category, setCategory] = useState(car?.category || "luxury");
  const [fuel, setFuel] = useState(car?.fuel || "Petrol");
  const [images, setImages] = useState<string[]>(car?.images || (car?.image ? [car.image] : []));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (car) {
      setName(car.name);
      setPrice(car.pricePerDay);
      setCategory(car.category || "luxury");
      setFuel(car.fuel || "Petrol");
      setImages(car.images || [car.image]);
    } else {
      setName("");
      setPrice("");
      setCategory("luxury");
      setFuel("Petrol");
      setImages([]);
    }
  }, [car, isOpen]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    // Simulate image upload by creating local URLs
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: car?.id || Date.now().toString(),
      name,
      pricePerDay: Number(price),
      category,
      fuel,
      image: images[0] || "",
      images,
      rating: car?.rating || 5.0,
      seats: 4,
      isPremium: category === "VIP" || category === "luxury"
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-[32px] overflow-hidden gold-border flex flex-col md:flex-row h-[90vh]"
          >
            <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-display font-bold text-white mb-6 italic">{car ? t('editCar') : t('addCar')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Car Name</label>
                       <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:gold-border outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Price / Day ($)</label>
                       <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:gold-border outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('category')}</label>
                       <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:gold-border outline-none transition-all">
                         <option value="luxury">luxury</option>
                         <option value="Sport">Sport</option>
                         <option value="SUV">SUV</option>
                         <option value="VIP">VIP</option>
                         <option value="Business">Business</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('fuel')}</label>
                       <select value={fuel} onChange={e => setFuel(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:gold-border outline-none transition-all">
                         <option value="Petrol">Petrol</option>
                         <option value="Diesel">Diesel</option>
                         <option value="Electric">Electric</option>
                         <option value="Hybrid">Hybrid</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Photo Gallery</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isDragging ? 'border-gold bg-gold/5 scale-95' : 'border-white/10 bg-white/5'}`}
                    >
                      <ImageIcon className={`w-8 h-8 mb-2 ${isDragging ? 'gold-text' : 'text-gray-500'}`} />
                      <p className="text-sm text-gray-400">Drag & drop images here</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 gold-bg text-black font-bold rounded-xl hover:scale-105 transition-all">
                      {car ? "Update Vehicle" : "Add to Fleet"}
                    </button>
                    <button type="button" onClick={onClose} className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10">
                      Cancel
                    </button>
                  </div>
                </form>
            </div>
            <div className="w-full md:w-80 bg-[#141414] border-l border-white/5 p-8 flex flex-col">
               <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Preview ({images.length})</h3>
               <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-white/10">
                       <Image src={img} alt={`Preview ${i}`} fill className="object-cover" />
                       <button 
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">No images yet</div>
                  )}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AdminPanel({ 
  cars, 
  onAddCar, 
  onDeleteCar, 
  lang,
  t 
}: { 
  cars: CarType[], 
  onAddCar: (car: any) => void, 
  onDeleteCar: (id: string) => void,
  lang: string,
  t: any
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || car.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCar(null);
  };

  return (
    <section id="admin" className="py-24 px-6 lg:px-8 bg-[#050505] min-h-screen">
       <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
             <div>
                <h2 className="text-4xl font-display font-bold text-white mb-2 italic">Fleet <span className="gold-text">Management</span></h2>
                <p className="text-gray-500 font-medium tracking-tight">Control the Elite Drive vehicle database.</p>
             </div>
             <button 
                onClick={() => { setEditingCar(null); setIsModalOpen(true); }}
                className="gold-bg text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center gap-2"
             >
                <Plus className="w-5 h-5" />
                {t('addCar')}
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             <div className="space-y-6">
                <div className="bento-card p-6 space-y-4">
                   <h3 className="text-white font-bold text-sm uppercase tracking-widest gold-text">Search & Filter</h3>
                   <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Search Name</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Model name..." className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:gold-border outline-none transition-all" />
                      </div>
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('category')}</label>
                       <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:gold-border outline-none transition-all">
                          <option value="All">{t('all')}</option>
                          <option value="luxury">luxury</option>
                          <option value="Sport">Sport</option>
                          <option value="SUV">SUV</option>
                          <option value="VIP">VIP</option>
                          <option value="Business">Business</option>
                       </select>
                   </div>
                </div>

                <div className="bento-card p-6 bg-gold/5 border-gold/20">
                   <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-widest">Total Fleet</h3>
                   <div className="text-4xl font-bold gold-text">{cars.length}</div>
                   <p className="text-gray-500 text-xs mt-1">Active vehicles online</p>
                </div>
             </div>

             <div className="lg:col-span-3 space-y-4">
                {filteredCars.map(car => (
                   <div key={car.id} className="bento-card p-4 flex items-center gap-6 group hover:gold-border transition-all">
                      <div className="w-24 h-16 rounded-xl overflow-hidden relative flex-shrink-0 border border-white/10">
                        <Image src={car.image} alt={car.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-white group-hover:gold-text transition-colors">{car.name}</h4>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-bold uppercase">{car.category || "Sedan"}</span>
                         </div>
                         <p className="text-sm text-gray-500">${car.pricePerDay} / day • <span className="text-gray-600">{car.fuel || "Petrol"}</span></p>
                      </div>
                      <div className="flex items-center gap-3">
                         <button 
                            onClick={() => handleEdit(car)}
                            className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-gold"
                            title="Edit Vehicle"
                         >
                            <Settings className="w-5 h-5" />
                         </button>
                         <button 
                            onClick={() => onDeleteCar(car.id)}
                            className="p-3 bg-red-500/10 rounded-xl hover:bg-red-500 transition-all group/del shadow-lg hover:shadow-red-500/20"
                            title="Remove"
                         >
                            <Trash2 className="w-5 h-5 text-red-500 group-hover/del:text-white" />
                         </button>
                      </div>
                   </div>
                ))}
                {filteredCars.length === 0 && (
                   <div className="text-center py-20 opacity-30">
                      <Car className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-xl">No vehicles found matching your criteria</p>
                   </div>
                )}
             </div>
          </div>
       </div>

       <AdminCarModal 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          onSave={onAddCar}
          car={editingCar}
          t={t}
       />
    </section>
  );
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0A0A0A] z-10" />
          <Image
            src={HERO_SLIDES[currentSlide].image}
            alt={HERO_SLIDES[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#B87333]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="relative z-30 h-full flex items-center"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-12 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium">
                Premium Car Rental Baku
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1] mb-6 italic"
            >
              {HERO_SLIDES[currentSlide].title.split(" ").map((word: string, i: number) => (
                <span key={i} className={i === 1 ? "gold-text" : ""}>
                  {word}{" "}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-xl leading-relaxed"
            >
              {HERO_SLIDES[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                href="#cars"
                className="group px-8 py-4 gold-bg text-black font-bold rounded-full hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                {HERO_SLIDES[currentSlide].cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#how-it-works"
                className="px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          <div className="absolute bottom-32 left-6 lg:left-8 flex gap-3">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide 
                    ? "w-12 bg-[#D4AF37]" 
                    : "w-6 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SearchWidget() {
  return (
    <section className="relative z-40 -mt-24 px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bento-card p-6 lg:p-8 shadow-2xl gold-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                <MapPin className="w-3 h-3 gold-text" />
                Pick-up Location
              </label>
              <input
                type="text"
                placeholder="Baku, Airport, Hotel..."
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:gold-border transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                <Calendar className="w-3 h-3 gold-text" />
                Pick-up Date
              </label>
              <input
                type="date"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:gold-border [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                <Calendar className="w-3 h-3 gold-text" />
                Drop-off Date
              </label>
              <input
                type="date"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:gold-border [color-scheme:dark]"
              />
            </div>
            <div className="flex items-end">
              <Link 
                href="#cars"
                className="w-full py-4 gold-bg text-black font-bold rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4" />
                Search Fleet
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {STATS.map((stat, i) => (
          <motion.div key={i} variants={fadeInUp} className="bento-card p-8 text-center gold-border">
            <div className="w-12 h-12 mx-auto mb-4 bg-white/5 flex items-center justify-center gold-text rounded-xl">
              {stat.icon}
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-gray-500 uppercase tracking-widest font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href="#" className="group relative block h-80 rounded-2xl overflow-hidden transition-all duration-500">
              <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">{cat.name}</h3>
                <span className="text-[#D4AF37] font-semibold">{cat.count} vehicles</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-[#0A0A0A]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="bento-card p-8 group hover:gold-border transition-all duration-300">
              <div className="w-12 h-12 mb-6 gold-text group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:gold-text transition-colors">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{f.description}</p>
            </div>
          ))}
        </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-lg">
                {s.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 px-6 lg:px-8 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto bg-[#1A1A1A]/50 border border-white/5 p-12 rounded-3xl text-center">
        <AnimatePresence mode="wait">
          <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <img src={TESTIMONIALS[activeIndex].avatar} className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-[#D4AF37]/30" referrerPolicy="no-referrer" />
            <p className="text-xl md:text-2xl text-gray-300 italic mb-6 leading-relaxed">"{TESTIMONIALS[activeIndex].comment}"</p>
            <h4 className="text-lg font-bold text-white">{TESTIMONIALS[activeIndex].name}</h4>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => setActiveIndex((activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="w-12 h-12 border border-white/10 rounded-full text-white hover:text-[#D4AF37] flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={() => setActiveIndex((activeIndex + 1) % TESTIMONIALS.length)} className="w-12 h-12 border border-white/10 rounded-full text-white hover:text-[#D4AF37] flex items-center justify-center"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black to-[#050505] z-0" />
      <div className="max-w-4xl mx-auto text-center bento-card p-16 gold-border relative z-10 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]">
        <div className="w-16 h-1 bg-gold px-4 mx-auto mb-8 rounded gold-bg opacity-50" />
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 italic italic">Ready to <span className="gold-text">Drive Elite?</span></h2>
        <p className="text-gray-400 mb-10 text-lg leading-relaxed max-w-xl mx-auto">Join over 500 satisfied clients who chose the ultimate luxury experience in Azerbaijan.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#cars" className="px-10 py-4 gold-bg text-black font-bold rounded-full hover:scale-105 transition-transform">Browse Fleet</Link>
          <Link href="#contact" className="px-10 py-4 border border-white/10 text-white font-semibold rounded-full hover:bg-white/5 transition-all">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 bg-[#0F0F0F]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 gold-bg"></div>
            <span className="text-xs gold-text uppercase tracking-widest font-semibold">FAQ Spotlight</span>
            <div className="h-px w-8 gold-bg"></div>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4 italic">Frequently <span className="gold-text">Asked</span></h2>
        </div>
        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => (
            <div key={index} className="bento-card overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className={`text-lg transition-colors font-semibold ${openIndex === index ? "gold-text" : "text-white"}`}>{faq.question}</span>
                <ChevronRight className={`transition-transform duration-300 ${openIndex === index ? "rotate-90 gold-text" : "text-gray-500"}`} />
              </button>
              {openIndex === index && (
                <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   className="px-6 pb-6 text-gray-400 border-t border-white/5 pt-4 text-[15px] leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIChatBot({ t, lang, fleet }: { t: any, lang: string, fleet: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: t('aiBotPlaceholder') }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const fleetInfo = fleet.map(c => `${c.name} ($${c.pricePerDay}/day)`).join(", ");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `You are the Elite Drive Assistant, a luxury car rental concierge in Baku, Azerbaijan. 
          Current Fleet: ${fleetInfo}. 
          Language: Respond in ${lang === 'az' ? 'Azerbaijani' : lang === 'ru' ? 'Russian' : 'English'}.
          Tone: Professional, luxurious, and extremely helpful.
          Goal: Help users find the perfect car and encourage booking.
          Be concise.`
        }
      });

      const botMsg = response.text || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'bot', text: botMsg }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-28 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-[#0F0F0F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col gold-border"
          >
            <div className="p-4 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gold-bg rounded-xl flex items-center justify-center text-black">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold leading-none">{t('aiBotTitle')}</h4>
                  <span className="text-[10px] text-green-500 uppercase flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[14px] leading-relaxed ${m.role === 'user' ? 'bg-gold text-black font-medium' : 'bg-[#1A1A1A] text-gray-300 border border-white/5'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="bg-[#1A1A1A] p-3 rounded-2xl border border-white/5 w-fit">...</div>}
            </div>
            <div className="p-4 bg-[#1A1A1A] border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder={t('aiBotPlaceholder')} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:gold-border outline-none transition-all"
                />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 gold-text disabled:opacity-30">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl bg-[#1A1A1A] text-white hover:gold-bg hover:text-black border border-white/10 transition-all ${isOpen ? 'rotate-90' : ''}`}>
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
}

function NewsletterSection({ t }: { t: any }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section className="py-24 px-6 lg:px-8 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto text-center bento-card p-14 gold-border">
        <TrendingUp className="w-12 h-12 gold-text mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-display font-bold text-white mb-4 italic">Join the <span className="gold-text">Elite Club</span></h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-[15px]">Exclusive offers & premium travel tips delivered twice a month to your inbox.</p>
        
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 font-bold"
          >
            {t('subSuccess')}
          </motion.div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:gold-border transition-all" 
              placeholder={t('emailPlaceholder')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 gold-bg text-black font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "..." : t('subscribe')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function BrandsSection() {
  return (
    <section className="py-16 bg-[#0F0F0F] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 md:grid-cols-6 gap-8 opacity-50">
        {BRANDS.map((b, i) => (
          <div key={i} className="text-center text-white font-bold text-lg">{b.name}</div>
        ))}
      </div>
    </section>
  );
}

function Footer({ t }: { t: any }) {
  return (
    <footer className="bg-[#050505] pt-20 pb-8 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 bento-card p-12 gold-border bg-[#0A0A0A]/40">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gold-bg rounded flex items-center justify-center text-black font-bold text-xs uppercase">E</div>
            <span className="text-xl font-display font-bold text-white tracking-wider">ELITE<span className="gold-text">DRIVE</span></span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('desc')}</p>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold mb-6 uppercase tracking-widest gold-text">{t('home')}</h4>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li><Link href="#cars" className="hover:text-white transition-colors">{t('fleet')}</Link></li>
            <li><Link href="#how-it-works" className="hover:text-white transition-colors">{t('howItWorks')}</Link></li>
            <li><Link href="#about" className="hover:text-white transition-colors">{t('about')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold mb-6 uppercase tracking-widest gold-text">{t('contact')}</h4>
          <div className="space-y-4 text-sm text-gray-500">
            <p className="flex items-center gap-2 font-medium tracking-tight"><MapPin className="w-4 h-4 gold-text" /> Nizami küçəsi 123, Bakı</p>
            <p className="flex items-center gap-2 font-medium tracking-tight"><Phone className="w-4 h-4 gold-text" /> 050 461 93 03</p>
          </div>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold mb-6 uppercase tracking-widest gold-text">Follow Us</h4>
          <div className="flex gap-4">
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:gold-bg hover:text-black transition-all">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:gold-bg hover:text-black transition-all">
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-6 bento-card rounded-2xl flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-600 uppercase tracking-widest font-bold border-none bg-[#111]/40">
        <p>© 2026 Elite Drive Baku. {t('allRights')}</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <a 
      href="https://wa.me/994504619303" 
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float"
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform"
    >
      <WhatsApp className="w-8 h-8" />
    </a>
  );
}

function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center z-[200]">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-white">ELITE<span className="text-[#D4AF37]">DRIVE</span></h1>
      </div>
    </div>
  );
  return <>{children}</>;
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-8 z-[100] w-12 h-12 bg-[#1A1A1A] border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#D4AF37] transition-all shadow-2xl"
        >
          <ChevronRight className="-rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function AuthModal({ isOpen, onClose, onLogin, users, t }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onLogin: (email: string, pass: string) => void, 
  users: any[],
  t: any 
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Code/Pass, 3: Set New Password
  const [isLoading, setIsLoading] = useState(false);

  const isOldUser = users.find(u => u.email === email);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (isOldUser) {
        setStep(2); // Ask for password
      } else {
        setStep(2); // Ask for verification code first
        alert("Verification code: 1234 (Simulation)");
      }
    }, 1200);
  };

  const handleSecondStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOldUser) {
      // Existing user entered password
      if (password.length >= 8) {
        if (password === isOldUser.password) {
          onLogin(email, password);
          onClose();
          reset();
        } else {
          alert("Yanlış şifrə.");
        }
      } else {
        alert("Şifrə minimum 8 simvol olmalıdır.");
      }
    } else {
      // New user entered verification code
      if (code === "1234") {
        setStep(3); // Go to set password step
      } else {
        alert("Yanlış kod. 1234 yoxlayın.");
      }
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 8) {
      onLogin(email, password);
      onClose();
      reset();
    } else {
      alert("Şifrə minimum 8 simvol olmalıdır.");
    }
  };

  const reset = () => {
    setStep(1);
    setEmail("");
    setCode("");
    setPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-[32px] p-8 shadow-2xl gold-border"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 gold-bg rounded-2xl flex items-center justify-center mx-auto mb-4 text-black">
                {step === 1 ? <Car className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
              </div>
              <h2 className="text-3xl font-display font-bold text-white italic">
                {step === 1 ? "Elite" : step === 3 ? "Secure" : "Verify"} <span className="gold-text">{step === 1 ? "Access" : "Account"}</span>
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                {step === 1 ? "Luxury experience awaits you" : step === 3 ? "Choose a strong 8-character password" : isOldUser ? "Enter your password to continue" : "Enter the verification code sent to your email"}
              </p>
            </div>
            
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:gold-border transition-all"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 gold-bg text-black font-bold rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4">
                  {isLoading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Continue"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSecondStepSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    {isOldUser ? "Password" : "Verification Code"}
                  </label>
                  <div className="relative">
                    {isOldUser ? (
                      <>
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-12 py-4 text-white focus:outline-none focus:gold-border transition-all"
                        />
                      </>
                    ) : (
                      <input 
                        type="text" 
                        maxLength={4}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        placeholder="0000"
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] text-white focus:outline-none focus:gold-border transition-all"
                      />
                    )}
                  </div>
                </div>
                <button type="submit" className="w-full py-4 gold-bg text-black font-bold rounded-xl hover:scale-[1.02] transition-all">
                  {isOldUser ? "Sign In" : "Confirm Code"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-white transition-colors">
                  Try another email
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">New Password (min 8 chars)</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-12 py-4 text-white focus:outline-none focus:gold-border transition-all"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 gold-bg text-black font-bold rounded-xl hover:scale-[1.02] transition-all">
                  Finish Registration
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CarGalleryModal({ isOpen, onClose, car, user, onAuthRequired, t }: { 
  isOpen: boolean, 
  onClose: () => void, 
  car: any, 
  user: any,
  onAuthRequired: () => void,
  t: any 
}) {
  const [activeImage, setActiveImage] = useState(0);
  
  useEffect(() => {
    setActiveImage(0);
  }, [car]);

  if (!car) return null;

  const allImages = car.images && car.images.length > 0 ? car.images : [car.image];

  const handleWhatsApp = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    const message = encodeURIComponent(`Salam, mən ${car.name} avtomobilini sifariş etmək istəyirəm. Qiymət: $${car.pricePerDay}/gün.`);
    window.open(`https://wa.me/994504619303?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl bg-[#0F0F0F] rounded-[40px] overflow-hidden gold-border flex flex-col md:flex-row h-[90vh] md:h-[70vh]"
          >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-white/10 transition-all border border-white/10">
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 relative bg-black flex items-center justify-center p-4 md:p-8 overflow-hidden group min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full relative"
                >
                  <Image src={allImages[activeImage]} alt={car.name} fill className="object-contain" />
                </motion.div>
              </AnimatePresence>

              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1)); }}
                    className="absolute left-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1)); }}
                    className="absolute right-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            <div className="w-full md:w-[400px] p-6 md:p-10 flex flex-col bg-[#0A0A0A] border-l border-white/5 overflow-y-auto">
               <div className="mb-8">
                 <div className="flex items-center gap-2 mb-3">
                   <span className="px-3 py-1 rounded-full bg-gold/10 gold-text text-[10px] font-bold uppercase tracking-widest border border-gold/20">{car.category || t('vip')}</span>
                   <div className="flex items-center gap-1 text-gold ml-auto">
                     <Star className="w-3 h-3 fill-current" />
                     <span className="text-xs font-bold">{car.rating || "5.0"}</span>
                   </div>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-display font-bold text-white italic leading-tight">{car.name}</h2>
                 <p className="text-gray-500 mt-2 font-medium">Baku Premium Rentals</p>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">{t('seats')}</span>
                   <div className="flex items-center gap-2 text-white font-bold">
                     <Users className="w-4 h-4 gold-text" /> {car.seats || 4}
                   </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">{t('fuel')}</span>
                   <div className="flex items-center gap-2 text-white font-bold">
                     <Zap className="w-4 h-4 gold-text" /> {car.fuel || "Petrol"}
                   </div>
                 </div>
               </div>

               <div className="mt-auto">
                 <div className="flex items-end justify-between mb-6">
                    <div>
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">{t('perDay')}</span>
                      <div className="text-3xl font-display font-bold text-white italic">${car.pricePerDay} <span className="text-sm font-sans text-gray-500">/ day</span></div>
                    </div>
                 </div>
                 <button 
                  onClick={handleWhatsApp}
                  className="w-full py-5 gold-bg text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-lg shadow-2xl shadow-gold/20 flex items-center justify-center gap-3"
                 >
                   <MessageSquare className="w-6 h-6" />
                   {t('bookNow')}
                 </button>
               </div>

               {allImages.length > 1 && (
                 <div className="mt-10">
                   <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-4">Gallery</p>
                   <div className="grid grid-cols-4 gap-2">
                     {allImages.map((img, i) => (
                       <button 
                         key={i} 
                         onClick={() => setActiveImage(i)}
                         className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-gold scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
                       >
                         <Image src={img} alt="" fill className="object-cover" />
                       </button>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [lang, setLang] = useState<keyof typeof TRANSLATIONS>('az');
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('elite_drive_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [carsState, setCarsState] = useState(FEATURED_CARS);

  useEffect(() => {
    localStorage.setItem('elite_drive_users', JSON.stringify(users));
  }, [users]);

  const t = (key: keyof typeof TRANSLATIONS['az']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const handleSignIn = () => {
    setIsAuthModalOpen(true);
  };

  const onLogin = (email: string, password: string) => {
    const existing = users.find(u => u.email === email);
    let currentUser;

    if (existing) {
       currentUser = existing;
    } else {
       const newId = 1001 + users.length;
       currentUser = { 
         email, 
         password, 
         id: newId, 
         name: email.split('@')[0],
         badge: `#${newId}` 
       };
       setUsers(prev => [...prev, currentUser]);
    }

    setUser(currentUser);
    const isSuper = email.trim().toLowerCase() === 'nihadhuseynovtt@gmail.com';
    if(isSuper) setIsAdmin(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAdmin(false);
  };

  const addCar = (newCar: any) => {
    setCarsState(prev => {
       const existing = prev.find(c => c.id === newCar.id);
       if (existing) {
          return prev.map(c => c.id === newCar.id ? newCar : c);
       }
       return [newCar, ...prev];
    });
    alert("Vehicle database updated successfully.");
  };
  const deleteCar = (id: string) => setCarsState(carsState.filter(c => c.id !== id));

  return (
    <LoadingScreen>
      <div className="bg-[#0A0A0A] text-white selection:bg-[#D4AF37] selection:text-black">
        {/* Progress Bar */}
        <motion.div
           className="fixed top-0 left-0 right-0 h-1 bg-gold z-[60] origin-left gold-bg"
           style={{ scaleX }}
        />

        <Navbar 
          lang={lang} 
          setLang={setLang} 
          t={t} 
          user={user} 
          isAdmin={isAdmin} 
          onSignIn={handleSignIn} 
          onSignOut={handleSignOut} 
        />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={onLogin} 
          users={users}
          t={t} 
        />
        
        <HeroSection />
        <SearchWidget />
        <StatsSection />
        
        {/* Optimized Car Grid using State */}
        <section id="cars" className="py-24 px-6 lg:px-8 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-12 gold-bg" />
                <span className="gold-text uppercase tracking-[0.3em] text-xs font-semibold">{t('fleet')}</span>
                <div className="h-px w-12 gold-bg" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 italic">{t('fleetTitle').split(' ')[0]} <span className="gold-text">{t('fleetTitle').split(' ').slice(1).join(' ')}</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">{t('fleetDesc')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {carsState.map((car) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedCar(car)}
                  className="bento-card overflow-hidden hover:gold-border transition-all duration-500 p-0 group cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden rounded-t-[24px]">
                    <Image src={car.image} alt={car.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {car.isPremium && <span className="px-3 py-1 gold-bg text-black text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-xl">PREMIUM</span>}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-gold/90 text-black flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                          <Eye className="w-6 h-6" />
                       </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:gold-text transition-colors">{car.name}</h3>
                      <div className="flex items-center gap-1 gold-text"><Star className="w-4 h-4 fill-current" />{car.rating}</div>
                    </div>
                    <div className="flex gap-4 mb-4 text-[13px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{car.seats}</span>
                      <span className="flex items-center gap-1"><Settings className="w-4 h-4" />Auto</span>
                      <span className="flex items-center gap-1"><Fuel className="w-4 h-4" />{car.fuel}</span>
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t border-white/5">
                      <span className="text-2xl font-bold text-white italic">${car.pricePerDay}<span className="text-sm text-gray-500 font-normal">/day</span></span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            setIsAuthModalOpen(true);
                            return;
                          }
                          const message = encodeURIComponent(`Salam, mən ${car.name} avtomobilini sifariş etmək istəyirəm.`);
                          window.open(`https://wa.me/994504619303?text=${message}`, '_blank');
                        }}
                        className="px-5 py-2.5 gold-bg text-black rounded-full text-xs font-bold hover:scale-110 transition-all flex items-center gap-2"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {t('bookNow')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <AboutSection t={t} />
        <FeaturesSection />
        <HowItWorksSection />
        <BlogSection t={t} />
        <TestimonialsSection />
        <ContactSection t={t} />

        {isAdmin && <AdminPanel cars={carsState} onAddCar={addCar} onDeleteCar={deleteCar} lang={lang} t={t} />}

        <CTASection />
        <FAQSection />
        <NewsletterSection t={t} />
        <BrandsSection />
        <Footer t={t} />
        <WhatsAppFloat />
        <AIChatBot t={t} lang={lang} fleet={carsState} />
        <CarGalleryModal 
          isOpen={!!selectedCar} 
          onClose={() => setSelectedCar(null)} 
          car={selectedCar} 
          user={user}
          onAuthRequired={() => {
            setSelectedCar(null);
            setIsAuthModalOpen(true);
          }}
          t={t} 
        />
        <ScrollToTop />
      </div>
    </LoadingScreen>
  );
}

