import { useApp } from '@/lib/context';
import { ASSETS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Hero() {
  const { t } = useApp();

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${ASSETS.hero})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      <div className="relative h-full container flex flex-col justify-center items-start px-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-block py-1 px-3 mb-4 rounded bg-primary/90 text-white text-xs font-bold tracking-widest uppercase border border-primary-foreground/20">
            Est. 1976
          </span>
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.85] mb-6 uppercase tracking-tighter">
            We Are <br />
            <span className="text-primary drop-shadow-lg">The Browns</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl font-light border-l-4 border-primary pl-6">
            Ethiopia's pride, coffee's legacy. Join the official Ethiopian Bunna FC fan community and be part of our historic journey.
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
      </div>

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
