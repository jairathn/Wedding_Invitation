import { useEffect, useRef } from 'react';

// Bursts are triggered with skyBurst() from ../sky.js

const EMBER_COLORS = ['255,214,140', '255,196,120', '255,236,200'];
const WILLOW = ['255,226,160', '255,206,128', '255,240,205'];
const PETAL_COLORS = [
  ['236,120,196', '201,72,158'],
  ['244,170,214', '214,104,176'],
];

function glowSprite(rgb, size = 32) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,245,1)');
  grad.addColorStop(0.2, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.5, `rgba(${rgb},0.22)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// A soft, out-of-focus bougainvillea bract (pre-blurred, drawn large and faint)
function petalSprite([light, dark], size = 72) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.filter = 'blur(3px)';
  g.translate(size / 2, size / 2);
  const s = size * 0.36;
  const grad = g.createLinearGradient(-s, -s, s, s);
  grad.addColorStop(0, `rgba(${light},0.95)`);
  grad.addColorStop(1, `rgba(${dark},0.85)`);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, -s);
  g.bezierCurveTo(s * 0.86, -s * 0.7, s * 0.76, s * 0.52, 0, s);
  g.bezierCurveTo(-s * 0.76, s * 0.52, -s * 0.86, -s * 0.7, 0, -s);
  g.fill();
  return c;
}

/**
 * Canvas layer over the night photo: a few rising embers, soft petals before
 * the envelope opens, and gold-willow bursts on cue. Sits behind the
 * envelope/card (pointer-events: none). Off entirely for reduced motion.
 */
export function SkyEffects({ petals = true }) {
  const canvasRef = useRef(null);
  const petalsRef = useRef(petals);
  useEffect(() => {
    petalsRef.current = petals;
  }, [petals]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

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
    const willowSprites = WILLOW.map((c) => glowSprite(c));
    const petalSprites = PETAL_COLORS.map((c) => petalSprite(c));
    const rand = (a, b) => a + Math.random() * (b - a);
    const area = () => (w * h) / 1e6;

    const makeEmber = (fromBottom) => ({
      x: rand(0, w),
      y: fromBottom ? rand(h * 0.6, h + 20) : rand(0, h),
      vy: rand(-0.42, -0.12),
      drift: rand(0.2, 0.8),
      phase: rand(0, Math.PI * 2),
      size: rand(2, 4.5),
      alpha: rand(0.15, 0.45),
      sprite: emberSprites[Math.floor(Math.random() * emberSprites.length)],
    });
    const makePetal = (anywhere) => ({
      x: rand(-40, w + 40),
      y: anywhere ? rand(-h * 0.2, h) : rand(-120, -60),
      vy: rand(0.22, 0.5),
      vx: rand(-0.2, 0.2),
      sway: rand(0.4, 1.1),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.006, 0.006),
      flip: rand(0.5, 1.2),
      size: rand(36, 64),
      alpha: rand(0.16, 0.3),
      sprite: petalSprites[Math.floor(Math.random() * petalSprites.length)],
    });

    const emberCount = () => Math.round(Math.min(32, Math.max(12, area() * 16)));
    const petalCount = () => Math.round(Math.min(5, Math.max(3, area() * 2.5)));
    let embers = Array.from({ length: emberCount() }, () => makeEmber(false));
    let petalList = Array.from({ length: petalCount() }, () => makePetal(true));
    let sparks = [];

    // Gold willow: sparks arc out, droop and fade, trailing short streaks
    const burst = ({ x, y, count = 90, power = 1 }) => {
      const n = Math.min(150, count);
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + rand(-0.06, 0.06);
        const speed = rand(1.4, 3.4) * power;
        const k = i % WILLOW.length;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          life: 1,
          decay: rand(0.005, 0.009),
          rgb: WILLOW[k],
          sprite: willowSprites[k],
          trail: [],
        });
      }
    };
    const onBurst = (e) => burst(e.detail || {});
    window.addEventListener('sky:burst', onBurst);

    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const e of embers) {
        e.y += e.vy * dt;
        e.x += Math.sin(now / 1500 + e.phase) * 0.16 * e.drift * dt;
        if (e.y < -20) Object.assign(e, makeEmber(true), { y: h + rand(0, 40) });
        ctx.globalAlpha = Math.max(0, e.alpha * (0.55 + 0.45 * Math.sin(now / 600 + e.phase * 3)));
        ctx.drawImage(e.sprite, e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
      }

      sparks = sparks.filter((s) => s.life > 0);
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.2;
      for (const s of sparks) {
        s.trail.push(s.x, s.y);
        if (s.trail.length > 16) s.trail.splice(0, 2);
        s.vx *= 0.982 ** dt;
        s.vy = s.vy * 0.982 ** dt + 0.05 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= s.decay * dt;
        const life = Math.max(0, s.life);
        ctx.strokeStyle = `rgb(${s.rgb})`;
        // streak: older points fainter
        for (let i = 2; i < s.trail.length; i += 2) {
          ctx.globalAlpha = life * (i / s.trail.length) * 0.7;
          ctx.beginPath();
          ctx.moveTo(s.trail[i - 2], s.trail[i - 1]);
          ctx.lineTo(s.trail[i], s.trail[i + 1]);
          ctx.stroke();
        }
        ctx.globalAlpha = life;
        const size = 5 * (0.5 + 0.5 * life);
        ctx.drawImage(s.sprite, s.x - size / 2, s.y - size / 2, size, size);
      }

      ctx.globalCompositeOperation = 'source-over';
      if (petalsRef.current) {
        for (const p of petalList) {
          p.y += p.vy * dt;
          p.x += (p.vx + Math.sin(now / 2000 + p.phase) * 0.3 * p.sway) * dt;
          p.rot += p.spin * dt;
          if (p.y > h + 80) Object.assign(p, makePetal(false));
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.cos((now / 1100) * p.flip + p.phase), 1);
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
      embers = embers.slice(0, emberCount());
      petalList = petalList.slice(0, petalCount());
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
