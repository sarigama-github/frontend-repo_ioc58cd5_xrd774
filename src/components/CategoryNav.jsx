import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CategoryNav({ categories, active, onChange }) {
  const [time, setTime] = useState(new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div ref={containerRef} className="flex gap-2 overflow-x-auto no-scrollbar py-2 pr-2">
        {categories.map((c) => (
          <motion.button
            key={c}
            onClick={() => onChange(c)}
            whileHover={{ y: -2, boxShadow: '0 0 16px rgba(74,222,128,0.45)' }}
            whileTap={{ scale: 0.97 }}
            className={`font-mono px-4 py-2 rounded-md border transition-colors whitespace-nowrap ${
              active === c
                ? 'border-green-400 text-green-300 bg-green-500/10'
                : 'border-green-800/60 text-green-400/80 hover:text-green-300 hover:border-green-500/60'
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>

      <div className="ml-auto text-right">
        <div className="font-mono text-green-400/80 text-sm">
          {time.toLocaleDateString()} {time.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
