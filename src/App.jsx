import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeroSection from './components/HeroSection.jsx';
import MatrixRain from './components/MatrixRain.jsx';
import CategoryNav from './components/CategoryNav.jsx';
import Gallery from './components/Gallery.jsx';

const CATEGORIES = ['REALITY', 'CONSTRUCT', 'ZION', 'MISSIONS', 'ARCHIVES'];

export default function App() {
  const [active, setActive] = useState(CATEGORIES[0]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="min-h-screen relative bg-black text-green-400 selection:bg-green-600/30 selection:text-green-200">
      <MatrixRain reducedMotion={reducedMotion} />

      <div className="relative z-10">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <CategoryNav categories={CATEGORIES} active={active} onChange={setActive} />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Gallery category={active} categories={CATEGORIES} reducedMotion={reducedMotion} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
