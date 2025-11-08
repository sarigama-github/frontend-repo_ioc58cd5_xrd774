import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Trash2, ZoomIn, X } from 'lucide-react';

const STORAGE_KEY = 'matrix_gallery_items_v1';

function useLocalGallery() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItems = useCallback((newOnes) => setItems((prev) => [...newOnes, ...prev]), []);
  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  return { items, addItems, removeItem };
}

function bytesToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function useBodyScrollLock(lock) {
  useEffect(() => {
    if (lock) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [lock]);
}

const particleColors = ['#22c55e', '#16a34a', '#4ade80', '#bbf7d0'];

function spawnParticles(x, y) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  container.style.pointerEvents = 'none';
  container.style.zIndex = 9999;
  const pieces = 18;
  for (let i = 0; i < pieces; i++) {
    const p = document.createElement('span');
    const size = 3 + Math.random() * 4;
    p.style.position = 'absolute';
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.borderRadius = '50%';
    p.style.background = particleColors[i % particleColors.length];
    p.style.boxShadow = '0 0 12px rgba(34,197,94,0.8)';
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
    const dist = 30 + Math.random() * 40;
    p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
    p.style.opacity = '0';
    p.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 600ms';
    container.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle) * (dist + 12)}px, ${Math.sin(angle) * (dist + 12)}px)`;
      p.style.opacity = '1';
    });
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 700);
}

export default function Gallery({ category, categories, reducedMotion }) {
  const fileInputRef = useRef(null);
  const { items, addItems, removeItem } = useLocalGallery();
  const [lightbox, setLightbox] = useState(null); // { index, list }
  const [uploading, setUploading] = useState([]); // [{name, progress}]
  useBodyScrollLock(!!lightbox);

  const filtered = useMemo(() => items.filter((i) => i.category === category), [items, category]);

  const simulateProgress = (file) => {
    const id = `${file.name}-${Date.now()}`;
    setUploading((u) => [...u, { id, name: file.name, progress: 0 }]);
    let p = 0;
    const step = () => {
      p += 10 + Math.random() * 15;
      if (p >= 100) {
        setUploading((u) => u.filter((x) => x.id !== id));
        return;
      }
      setUploading((u) => u.map((x) => (x.id === id ? { ...x, progress: Math.min(99, Math.round(p)) } : x)));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const onFiles = async (files) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const enriched = [];

    for (let i = 0; i < fileArr.length; i++) {
      const f = fileArr[i];
      simulateProgress(f);
      const base = await bytesToBase64(f);
      enriched.push({
        id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
        src: base,
        name: f.name,
        size: f.size,
        category,
        createdAt: Date.now(),
      });
    }
    addItems(enriched);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const openLightbox = (index) => setLightbox({ index, list: filtered });
  const closeLightbox = () => setLightbox(null);
  const next = () => setLightbox((l) => ({ ...l, index: (l.index + 1) % l.list.length }));
  const prev = () => setLightbox((l) => ({ ...l, index: (l.index - 1 + l.list.length) % l.list.length }));

  useEffect(() => {
    const onKey = (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const onDelete = (id) => {
    removeItem(id);
  };

  // Touch gestures for lightbox
  const touchRef = useRef({ x: 0, y: 0 });

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} className="group">
      <div className="flex items-center justify-between gap-3 mb-6">
        <motion.button
          onClick={handleUploadClick}
          whileHover={{ y: -2, boxShadow: '0 0 16px rgba(74,222,128,0.45)' }}
          whileTap={{ scale: 0.97 }}
          className="font-mono px-4 py-2 rounded-md border border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20"
        >
          + Upload to {category}
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.length) {
              const rect = e.target.getBoundingClientRect();
              spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
              onFiles(e.target.files);
            }
          }}
        />
      </div>

      {uploading.length > 0 && (
        <div className="fixed right-4 bottom-4 z-[9999] space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="px-3 py-2 rounded-md bg-black/80 border border-green-500/40 text-green-300 shadow-[0_0_16px_rgba(34,197,94,0.3)]">
              <div className="text-xs font-mono">{u.name}</div>
              <div className="mt-1 h-1.5 w-48 rounded bg-green-900/40 overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: `${u.progress}%`, transition: 'width 120ms linear' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="border border-dashed border-green-700/60 rounded-xl p-10 text-center text-green-400/70 font-mono">
          Drag & drop images here or use Upload.
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {filtered.map((img, idx) => (
            <motion.div
              key={img.id}
              layout
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="relative group overflow-hidden rounded-xl border border-green-600/40 bg-black/40 hover:bg-black/60 shadow-[0_0_24px_rgba(34,197,94,0.15)]"
            >
              <button
                onClick={() => openLightbox(idx)}
                className="block w-full focus:outline-none"
              >
                <img
                  src={img.src}
                  alt={img.name}
                  loading="lazy"
                  className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </button>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <div className="truncate text-xs font-mono text-green-300/80">{img.name}</div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = img.src;
                      a.download = img.name || 'image';
                      a.click();
                    }}
                    className="p-2 rounded-md bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-300"
                    aria-label="Download"
                  >
                    <Download size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(img.id)}
                    className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openLightbox(idx)}
                    className="p-2 rounded-md bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-300"
                    aria-label="Zoom"
                  >
                    <ZoomIn size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/70" onClick={closeLightbox} />

            <motion.div
              initial={{ scale: 0.95, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-[92vw] max-h-[86vh] rounded-xl overflow-hidden border border-green-500/50 bg-neutral-950 shadow-[0_0_45px_rgba(34,197,94,0.35)]"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 z-10 p-2 rounded-md bg-black/60 border border-green-500/40 text-green-300 hover:bg-black/80"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={lightbox.list[lightbox.index].src}
                  alt={lightbox.list[lightbox.index].name}
                  className="max-w-full max-h-[86vh] object-contain select-none"
                />

                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                  <motion.button
                    onClick={prev}
                    whileHover={{ x: -2 }}
                    className="p-2 rounded-md bg-black/50 border border-green-500/30 text-green-300"
                  >
                    ‹
                  </motion.button>
                  <motion.button
                    onClick={next}
                    whileHover={{ x: 2 }}
                    className="p-2 rounded-md bg-black/50 border border-green-500/30 text-green-300"
                  >
                    ›
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
