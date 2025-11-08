import React, { useEffect, useRef } from 'react';

export default function MatrixRain({ reducedMotion = false }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ0123456789';
    const drops = [];
    const fontSizeBase = 16;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const columns = Math.floor(width / fontSizeBase);
      drops.length = 0;
      for (let i = 0; i < columns; i++) drops[i] = Math.random() * height;
    };

    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      if (reducedMotion) return;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `${fontSizeBase}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSizeBase + fontSizeBase / 2;
        const y = drops[i] * fontSizeBase;
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        const glow = (Math.sin((t + i) * 0.1) + 1) * 0.35 + 0.2;
        ctx.shadowColor = `rgba(74, 222, 128, ${glow})`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(74, 222, 128, 0.9)';
        ctx.fillText(char, x, (drops[i] - 1) * fontSizeBase);

        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.9 + Math.random() * 0.5;
      }
      t += 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    if (!reducedMotion) draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
