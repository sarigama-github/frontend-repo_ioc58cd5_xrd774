import React from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';

export default function HeroSection() {
  return (
    <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black pointer-events-none" />

      <div className="relative z-10 h-full flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="px-6"
        >
          <h1 className="text-3xl md:text-5xl font-mono font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
            MATRIX // Image Gallery
          </h1>
          <p className="mt-3 md:mt-4 text-green-300/80 font-mono tracking-wide">
            Enter the Construct. Upload. Navigate. Decrypt memories.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
