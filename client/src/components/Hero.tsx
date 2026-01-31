import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80',
    title: 'We Are',
    highlight: 'Mechal FC',
    subtitle: 'Join the official Mechal FC fan community and be part of Ethiopian football excellence.',
  },
  {
    image: '/images/slider-stadium.jpg',
    title: 'Welcome To',
    highlight: 'Our Home',
    subtitle: 'Experience the passion and excitement of Ethiopian football at its finest.',
  },
];

export default function Hero() {
  const { t } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
        />
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      <div className="relative h-full container flex flex-col justify-center items-start px-4 pt-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-block py-1 px-3 mb-4 rounded bg-primary/90 text-white text-xs font-bold tracking-widest uppercase border border-primary-foreground/20">
              Mechal Sport Club
            </span>
            <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.85] mb-6 uppercase tracking-tighter">
              {HERO_SLIDES[currentSlide].title} <br />
              <span className="text-primary drop-shadow-lg">{HERO_SLIDES[currentSlide].highlight}</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl font-light border-l-4 border-primary pl-6">
              {HERO_SLIDES[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/membership">
                <Button size="lg" className="h-14 px-8 text-lg font-display uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded-none border-2 border-transparent hover:border-primary hover:bg-transparent hover:text-primary transition-all duration-300">
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-display uppercase tracking-wider text-white border-white/30 hover:bg-white/10 hover:text-white hover:border-white rounded-none bg-transparent backdrop-blur-sm">
                  {t('hero.secondary')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
