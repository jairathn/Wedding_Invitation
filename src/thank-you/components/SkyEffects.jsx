import { useEffect, useRef } from 'react';

const EMBER_COLORS = ['255,214,140', '255,190,110', '255,236,200', '242,166,90'];
const BURST_PALETTES = {
  gold: ['255,226,160', '255,200,120', '255,244,214'],
  orchid: ['235,88,209', '216,115,184', '255,214,240'],
  mixed: ['255,226,160', '235,88,209', '255,244,214', '242,166,90'],
};
const PETAL_COLORS = [
  ['236,120,196', '201,72,158'],
  ['244,170,214', '214,104,176'],
  ['226,96,182', '170,52,132'],
];

function glowSprite(rgb, size = 32) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(255,255,245,1)`);
  grad.addColorStop(0.18, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.45, `rgba(${rgb},0.28)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function petalSprite([light, dark], size = 40) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.translate(size / 2, size / 2);
  const grad = g.createLinearGradient(-size / 3, -size / 3, size / 3, size / 3);
  grad.addColorStop(0, `rgba(${light},0.95)`);
  grad.addColorStop(1, `rgba(${dark},0.85)`);
  g.fillStyle = grad;
  g.beginPath(); // papery bougainvillea bract
  g.moveTo(0, -size * 0.42);
  g.bezierCurveTo(size * 0.36, -size * 0.3, size * 0.32, size * 0.22, 0, size * 0.42);
  g.bezierCurveTo(-size * 0.32, size * 0.22, -size * 0.36, -size * 0.3, 0, -size * 0.42);
  g.fill();
  g.strokeStyle = `rgba(${dark},0.5)`;
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, -size * 0.34);
  g.lineTo(0, size * 0.34);
  g.stroke();
  return c;
}

// Bursts are triggered with skyBurst() from ../sky.js

/**
 * Canvas layer over the night photo: rising embers, drifting petals and
 * firework bursts. Sits behind the envelope/card (pointer-events: none).
 */
export function SkyEffects({ ambientBursts = false, petals = true }) {
  const canvasRef = useRef(null);
  const ambientRef = useRef(ambientBursts);
  const petalsRef = useRef(petals);
  useEffect(() => {
    ambientRef.current = ambientBursts;
    petalsRef.current = petals;
  }, [ambientBursts, petals]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return undefined;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const emberSprites = EMBER_COLORS.map((c) => glowSprite(c));
    const burstSprites = Object.fromEntries(
      Object.entries(BURST_PALETTES).map(([k, cols]) => [k, cols.map((c) => glowSprite(c))]),
    );
    const petalSprites = PETAL_COLORS.map((c) => petalSprite(c));
    const rand = (a, b) => a + Math.random() * (b - a);

    const makeEmber = (fromBottom) => ({
      x: rand(0, w),
      y: fromBottom ? rand(h * 0.55, h + 20) : rand(0, h),
      vy: rand(-0.55, -0.15),
      drift: rand(0.2, 0.9),
      phase: rand(0, Math.PI * 2),
      size: rand(2.5, 8),
      alpha: rand(0.35, 0.85),
      sprite: emberSprites[Math.floor(Math.random() * emberSprites.length)],
    });
    const makePetal = (anywhere) => ({
      x: rand(-20, w + 20),
      y: anywhere ? rand(-h * 0.2, h) : rand(-80, -20),
      vy: rand(0.25, 0.7),
      vx: rand(-0.25, 0.25),
      sway: rand(0.4, 1.2),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.012, 0.012),
      flip: rand(0.6, 1.6),
      size: rand(11, 21),
      alpha: rand(0.5, 0.85),
      sprite: petalSprites[Math.floor(Math.random() * petalSprites.length)],
    });

    const area = () => (w * h) / 1e6;
    let embers = Array.from({ length: Math.round(Math.min(70, Math.max(22, area() * 34))) }, () => makeEmber(false));
    let petalList = Array.from({ length: Math.round(Math.min(16, Math.max(7, area() * 8))) }, () => makePetal(true));
    let sparks = [];

    const burst = ({ x, y, palette = 'mixed', count = 70, power = 1 }) => {
      const sprites = burstSprites[palette] || burstSprites.mixed;
      const n = Math.min(160, count);
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + rand(-0.08, 0.08);
        const speed = rand(1.2, 3.6) * power;
        sparks.push({
          x, y, px: x, py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          life: 1,
          decay: rand(0.008, 0.016),
          size: rand(5, 11),
          sprite: sprites[i % sprites.length],
          twinkle: Math.random() < 0.3,
        });
      }
    };
    const onBurst = (e) => burst(e.detail || {});
    window.addEventListener('sky:burst', onBurst);

    let raf = 0;
    let last = performance.now();
    let nextAmbient = last + 2500;
    const frame = (now) => {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, w, h);

      if (ambientRef.current && now > nextAmbient) {
        burst({ x: rand(w * 0.12, w * 0.88), y: rand(h * 0.07, h * 0.3), palette: Math.random() < 0.35 ? 'orchid' : 'gold', count: 46, power: 0.75 });
        nextAmbient = now + rand(5200, 9800);
      }

      ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        e.y += e.vy * dt;
        e.x += Math.sin(now / 1400 + e.phase) * 0.18 * e.drift * dt;
        if (e.y < -20) Object.assign(e, makeEmber(true), { y: h + rand(0, 40) });
        const a = e.alpha * (0.55 + 0.45 * Math.sin(now / 520 + e.phase * 3));
        ctx.globalAlpha = Math.max(0, a);
        ctx.drawImage(e.sprite, e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
      }

      sparks = sparks.filter((s) => s.life > 0);
      for (const s of sparks) {
        s.px = s.x; s.py = s.y;
        s.vx *= 0.985 ** dt; s.vy = s.vy * 0.985 ** dt + 0.035 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        s.life -= s.decay * dt;
        const flicker = s.twinkle ? 0.5 + 0.5 * Math.sin(now / 40 + s.x) : 1;
        ctx.globalAlpha = Math.max(0, s.life) * flicker;
        const size = s.size * (0.6 + 0.4 * s.life);
        ctx.drawImage(s.sprite, s.x - size / 2, s.y - size / 2, size, size);
        ctx.globalAlpha = Math.max(0, s.life) * 0.35;
        ctx.drawImage(s.sprite, s.px - size / 3, s.py - size / 3, size / 1.5, size / 1.5);
      }

      ctx.globalCompositeOperation = 'source-over';
      if (petalsRef.current) {
        for (const p of petalList) {
          p.y += p.vy * dt;
          p.x += (p.vx + Math.sin(now / 1800 + p.phase) * 0.35 * p.sway) * dt;
          p.rot += p.spin * dt;
          if (p.y > h + 30) Object.assign(p, makePetal(false));
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.cos(now / 900 * p.flip + p.phase), 1);
          ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener('visibilitychange', onVisibility);
    const onResizePopulation = () => {
      embers = embers.slice(0, Math.round(Math.min(70, Math.max(22, area() * 34))));
      petalList = petalList.slice(0, Math.round(Math.min(16, Math.max(7, area() * 8))));
    };
    window.addEventListener('resize', onResizePopulation);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', onResizePopulation);
      window.removeEventListener('sky:burst', onBurst);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true" />;
}
