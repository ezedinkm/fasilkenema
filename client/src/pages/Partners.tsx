import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import PublicLayout from "@/components/PublicLayout";

interface Partner {
  id: number;
  name: string;
  image: string;
  alt: string;
  category: string;
}

import partner1 from '@/assets/partners/1.jpg';
import partner2 from '@/assets/partners/2.jpg';
import partner3 from '@/assets/partners/3.jpg';
import partner4 from '@/assets/partners/4.jpg';
import partner5 from '@/assets/partners/vcardet_logo.jpg';

const partners: Partner[] = [
  { id: 1, name: 'TechCorp', image: partner1, alt: 'Technology Partner', category: 'Technology' },
  { id: 2, name: 'InnovateLabs', image: partner2, alt: 'Innovation Partner', category: 'Innovation' },
  { id: 3, name: 'FutureSoft', image: partner3, alt: 'Software Partner', category: 'Software' },
  { id: 4, name: 'GlobalTech', image: partner4, alt: 'Global Partner', category: 'Global' },
  { id: 5, name: 'EliteGroup', image: partner5, alt: 'Premium Partner', category: 'Premium' },
];

const Partners: React.FC = () => {
  const [items, setItems] = useState<Partner[]>(partners);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [columns, setColumns] = useState<number>(2);
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Detect columns based on screen width
  const updateColumns = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 640) {
      setColumns(3);
    } else {
      setColumns(2);
    }
  }, []);

  // Advanced shuffle with multiple patterns
  const complexShuffle = useCallback(() => {
    setItems(prev => {
      const newItems = [...prev];
      const patterns = [
        () => { const last = newItems.pop(); if (last) newItems.unshift(last); },
        () => { const first = newItems.shift(); if (first) newItems.push(first); },
        () => { [newItems[0], newItems[newItems.length - 1]] = [newItems[newItems.length - 1], newItems[0]]; },
        () => { const middle = Math.floor(newItems.length / 2); [newItems[middle - 1], newItems[middle]] = [newItems[middle], newItems[middle - 1]]; },
        () => { const second = newItems.splice(1, 1)[0]; if (second) newItems.push(second); },
      ];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      randomPattern();
      return newItems;
    });
  }, []);

  // Set up column detection and constant position changes
  useEffect(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);

    shuffleIntervalRef.current = setInterval(() => {
      complexShuffle();
    }, 3000);

    return () => {
      window.removeEventListener('resize', updateColumns);
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    };
  }, [updateColumns, complexShuffle]);

  // Grid classes based on column count
  const gridClass = columns === 2 
    ? 'grid-cols-2' 
    : 'grid-cols-2 sm:grid-cols-3';

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white flex flex-col py-4">
        {/* Professional Header - Compact */}
        <div className="px-5 pt-6 md:px-8 md:pt-8 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="w-10 h-0.5 bg-red-600 rounded-full mb-2" />
              <h1 className="text-red-700 text-2xl md:text-3xl font-semibold tracking-wide">
                Partners
              </h1>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              className="text-red-500 text-xs font-mono"
            />
          </motion.div>
        </div>

        {/* Responsive Grid - Vertically Centered */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-4">
          <div className="w-full max-w-4xl mx-auto">
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={setItems}
              className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-5 auto-rows-fr`}
            >
              <AnimatePresence mode="popLayout">
                {items.map((partner, index) => (
                  <Reorder.Item
                    key={partner.id}
                    value={partner}
                    onDragEnd={() => setActiveId(null)}
                    className="relative"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 }
                      }}
                      whileHover={{ y: -4 }}
                    //   onHoverStart={() => setActiveId(partner.id)}
                      onHoverEnd={() => setActiveId(null)}
                      onTouchStart={() => setActiveId(partner.id)}
                      onTouchEnd={() => setTimeout(() => setActiveId(null), 300)}
                      className="relative group cursor-pointer"
                    >
                      {/* Card Container */}
                      <div className="relative">
                        {/* Glow effect on active */}
                        <motion.div
                          animate={{
                            opacity: activeId === partner.id ? 0.15 : 0,
                            scale: activeId === partner.id ? 1.02 : 0.98,
                          }}
                          transition={{ duration: 0.2 }}
                          className="absolute -inset-2 bg-red-100 rounded-2xl blur-xl"
                        />

                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-red-100 transition-shadow duration-300 hover:shadow-lg">
                          {/* Red gradient top border */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600" />
                          
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-gray-50 p-3">
                            <motion.img
                              src={partner.image}
                              alt={partner.alt}
                              className={`w-full h-full ${
                                partner.id === 2 ? 'object-contain' : 'object-cover'
                              }`}
                              loading="lazy"
                              draggable={false}
                              animate={{
                                scale: activeId === partner.id ? 1.05 : 1,
                              }}
                              transition={{ duration: 0.3 }}
                            />

                            <motion.div
                              animate={{
                                opacity: activeId === partner.id ? 0.05 : 0,
                              }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 bg-red-500"
                            />
                          </div>
                          {/* Corner Accent */}
                          <div className="absolute top-2 right-2 w-2 h-2">
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-400 rounded-full opacity-60" />
                          </div>
                        </div>

                        {/* Position Badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{
                            scale: activeId === partner.id ? 1 : 0,
                            opacity: activeId === partner.id ? 1 : 0,
                          }}
                          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-md"
                        >
                          <span className="text-white text-[10px] font-bold">
                            {index + 1}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Partners;