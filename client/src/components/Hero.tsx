import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getHomepageSlidesFromSettings } from "@/lib/homepageSlides";

export default function Hero() {
  const { t } = useApp();
  const { data: settings } = useQuery<unknown[]>({
    queryKey: ["/api/public/settings"],
  });
  const slides = useMemo(
    () => getHomepageSlidesFromSettings(settings),
    [settings],
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = slides[currentSlide] ?? slides[0];

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, [slides]);

  useEffect(() => {
    if (slides.length < 2 || !activeSlide) return;
    const timer = window.setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, activeSlide.durationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [activeSlide, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black pb-10">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          initial={false}
          animate={{ opacity: index === currentSlide ? 0.6 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
          aria-hidden="true"
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="relative h-full container flex flex-col justify-center items-start px-4 pt-20">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl"
        >
          <span className="inline-block py-1.5 px-4 mb-5 rounded-full bg-red-600 text-white text-sm font-bold tracking-widest uppercase shadow-lg">
            FASIL S.C sport Club
          </span>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-6xl font-black text-white leading-[0.95] mb-6 uppercase tracking-tighter drop-shadow-2xl">
            {activeSlide?.title}
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-gray-100 mb-10 max-w-3xl font-light border-l-4 border-red-600 pl-8 leading-relaxed">
            {activeSlide?.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/membership">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-display uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-none border-2 border-transparent hover:border-red-600 hover:bg-transparent hover:text-red-600 transition-all duration-300"
              >
                {t("hero.cta")}
              </Button>
            </Link>
            <Link href="/blog">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-display uppercase tracking-wider text-white border-white/30 hover:bg-white/10 hover:text-white hover:border-white rounded-none bg-transparent backdrop-blur-sm"
              >
                {t("hero.secondary")}
              </Button>
            </Link>
          </div>
        </motion.div>
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
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-red-600 w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
