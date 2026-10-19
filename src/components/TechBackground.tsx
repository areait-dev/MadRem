import React, { useEffect, useRef } from 'react';

const GAP = 32;
const BASE_RADIUS = 1.2;
const REACH = 160;
const PUSH = 14;
const ACCENT = '#0563F0';

// Sfondo "dot grid" interattivo (ispirato a React Bits): i puntini vicino al cursore
// si illuminano con l'accento e si spostano leggermente. Un alone segue il puntatore.
const TechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !glow || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let width = 0;
    let height = 0;
    let dots: { x: number; y: number }[] = [];
    let baseColor = 'rgba(128,128,128,0.3)';
    let raf = 0;

    const readColor = () => {
      baseColor = getComputedStyle(canvas).color;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(width / GAP) + 1;
      const rows = Math.ceil(height / GAP) + 1;
      const offX = (width - (cols - 1) * GAP) / 2;
      const offY = (height - (rows - 1) * GAP) / 2;
      dots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) dots.push({ x: offX + c * GAP, y: offY + r * GAP });
      }
      readColor();
    };

    const draw = () => {
      // easing del puntatore per un movimento fluido
      pointer.x += (pointer.tx - pointer.x) * 0.18;
      pointer.y += (pointer.ty - pointer.y) * 0.18;
      glow.style.transform = `translate3d(${pointer.x - 250}px, ${pointer.y - 250}px, 0)`;

      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const t = dist < REACH ? 1 - dist / REACH : 0;
        const push = t * t * PUSH;
        const x = dist > 0 ? d.x + (dx / dist) * push : d.x;
        const y = dist > 0 ? d.y + (dy / dist) * push : d.y;
        ctx.beginPath();
        ctx.arc(x, y, BASE_RADIUS + t * 1.6, 0, Math.PI * 2);
        if (t > 0) {
          ctx.globalAlpha = 0.35 + t * 0.65;
          ctx.fillStyle = ACCENT;
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = baseColor;
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      if (pointer.x < -5000) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
    };
    const onLeave = () => {
      pointer.tx = -9999;
      pointer.ty = -9999;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    window.addEventListener('resize', resize);
    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (reduced.matches) {
      glow.style.display = 'none';
      draw();
      cancelAnimationFrame(raf);
    } else {
      window.addEventListener('pointermove', onMove);
      document.addEventListener('pointerleave', onLeave);
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-page" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full text-fg/20"
        style={{
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 85%)',
        }}
      />
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] rounded-full opacity-[0.12] dark:opacity-[0.18]"
        style={{
          background: 'radial-gradient(circle, #0563F0 0%, transparent 65%)',
          transform: 'translate3d(-9999px,-9999px,0)',
        }}
      />
    </div>
  );
};

export default TechBackground;
