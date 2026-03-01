// Snapchat-style photo booth filters
// Each filter owns its entire canvas render pipeline — color grading, overlays, borders, text

export interface PhotoFilter {
  id: string;
  name: string;
  preview: string; // CSS gradient for carousel swatch
  render(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    mirror: boolean
  ): void;
}

// ── Helpers ─────────────────────────────────────────────────

function drawVideo(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  mirror: boolean,
  cssFilter?: string
) {
  ctx.save();
  if (cssFilter) ctx.filter = cssFilter;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.filter = 'none';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function vignette(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color: string,
  strength: number
) {
  const cx = w / 2, cy = h / 2;
  const r = Math.max(w, h) * 0.75;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, color);
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hashtag(ctx: CanvasRenderingContext2D, w: number, h: number, extra?: string) {
  const fs = Math.floor(h * 0.022);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.font = `italic ${fs}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('#JayWalkingToJairath', w * 0.04, h * 0.96);
  if (extra) {
    ctx.font = `600 ${Math.floor(fs * 0.85)}px 'DM Sans', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(extra, w * 0.04, h * 0.96 - fs * 1.5);
  }
  ctx.restore();
}

function badge(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  text: string,
  bgColor: string
) {
  const fs = Math.floor(h * 0.02);
  ctx.save();
  ctx.font = `600 ${fs}px 'DM Sans', sans-serif`;
  const tw = ctx.measureText(text).width;
  const pw = fs * 0.8;
  const bw = tw + pw * 2;
  const bh = fs * 2.2;
  const bx = w * 0.96 - bw;
  const by = h * 0.04;
  ctx.fillStyle = bgColor;
  ctx.globalAlpha = 0.85;
  roundedRect(ctx, bx, by, bw, bh, bh / 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + pw, by + bh / 2);
  ctx.restore();
}

// ── Sketch (Sobel edge detection) ───────────────────────────

let _sketchBuf: HTMLCanvasElement | null = null;

function renderSketch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  mirror: boolean
) {
  const w = canvas.width, h = canvas.height;
  const scale = 0.4;
  const sw = Math.floor(w * scale);
  const sh = Math.floor(h * scale);

  if (!_sketchBuf) _sketchBuf = document.createElement('canvas');
  _sketchBuf.width = sw;
  _sketchBuf.height = sh;
  const sctx = _sketchBuf.getContext('2d');
  if (!sctx) return;

  // Draw grayscale video at reduced resolution
  sctx.filter = 'grayscale(1) contrast(1.5)';
  sctx.save();
  if (mirror) { sctx.translate(sw, 0); sctx.scale(-1, 1); }
  sctx.drawImage(video, 0, 0, sw, sh);
  sctx.restore();
  sctx.filter = 'none';

  // Sobel edge detection
  const src = sctx.getImageData(0, 0, sw, sh);
  const dst = sctx.createImageData(sw, sh);
  const sd = src.data, dd = dst.data;

  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const i = (y * sw + x) * 4;
      const tl = sd[((y - 1) * sw + (x - 1)) * 4];
      const t  = sd[((y - 1) * sw + x) * 4];
      const tr = sd[((y - 1) * sw + (x + 1)) * 4];
      const l  = sd[(y * sw + (x - 1)) * 4];
      const r  = sd[(y * sw + (x + 1)) * 4];
      const bl = sd[((y + 1) * sw + (x - 1)) * 4];
      const b  = sd[((y + 1) * sw + x) * 4];
      const br = sd[((y + 1) * sw + (x + 1)) * 4];

      const gx = -tl + tr - 2 * l + 2 * r - bl + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const mag = Math.sqrt(gx * gx + gy * gy);

      // Pencil: white paper, dark lines. Threshold for clean look.
      const val = mag > 25 ? Math.max(30, 250 - mag * 1.8) : 252;
      dd[i] = val;
      dd[i + 1] = val;
      dd[i + 2] = val;
      dd[i + 3] = 255;
    }
  }

  sctx.putImageData(dst, 0, 0);

  // Scale up to main canvas
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(_sketchBuf, 0, 0, w, h);

  // Warm paper tint
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = '#fff8eb';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

// ── Filter definitions ──────────────────────────────────────

const none: PhotoFilter = {
  id: 'none',
  name: 'Original',
  preview: 'linear-gradient(135deg, #e8e0d4 0%, #d4ccc0 100%)',
  render(ctx, canvas, video, mirror) {
    drawVideo(ctx, canvas, video, mirror);
    hashtag(ctx, canvas.width, canvas.height);
  },
};

const rajasthani: PhotoFilter = {
  id: 'rajasthani',
  name: 'Rajasthani',
  preview: 'linear-gradient(135deg, #d4a853 0%, #c4704b 50%, #8b4513 100%)',
  render(ctx, canvas, video, mirror) {
    const w = canvas.width, h = canvas.height;

    // Rich warm desert tones
    drawVideo(ctx, canvas, video, mirror,
      'saturate(1.6) sepia(0.4) brightness(1.05) contrast(1.15)');

    // Golden overlay
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 210, 140, 0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Gold vignette
    vignette(ctx, w, h, 'rgba(139, 69, 19, 0.7)', 0.45);

    // Ornate gold border
    const bw = Math.max(8, Math.floor(Math.min(w, h) * 0.015));
    ctx.strokeStyle = 'rgba(212, 168, 83, 0.85)';
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);

    // Inner thin line
    const inn = bw * 2.5;
    ctx.strokeStyle = 'rgba(212, 168, 83, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(inn, inn, w - inn * 2, h - inn * 2);

    // Corner diamonds
    const ds = Math.floor(Math.min(w, h) * 0.035);
    ctx.fillStyle = 'rgba(212, 168, 83, 0.7)';
    for (const [cx, cy] of [[inn, inn], [w - inn, inn], [inn, h - inn], [w - inn, h - inn]] as const) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-ds / 2, -ds / 2, ds, ds);
      ctx.restore();
      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, ds * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    hashtag(ctx, w, h, 'Rajasthani');
    badge(ctx, w, h, '👑 Rajasthani', 'rgba(139, 69, 19, 0.8)');
  },
};

const sketch: PhotoFilter = {
  id: 'sketch',
  name: 'Sketch',
  preview: 'linear-gradient(135deg, #f5f0e8 0%, #bbb5a8 100%)',
  render(ctx, canvas, video, mirror) {
    const w = canvas.width, h = canvas.height;
    renderSketch(ctx, canvas, video, mirror);

    // Corner bracket frame
    const s = Math.floor(Math.min(w, h) * 0.07);
    const m = 12;
    ctx.strokeStyle = 'rgba(60, 50, 40, 0.5)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (const [x1, y1, x2, y2, x3, y3] of [
      [m + s, m, m, m, m, m + s],
      [w - m - s, m, w - m, m, w - m, m + s],
      [m, h - m - s, m, h - m, m + s, h - m],
      [w - m, h - m - s, w - m, h - m, w - m - s, h - m],
    ] as [number, number, number, number, number, number][]) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }

    hashtag(ctx, w, h);
    badge(ctx, w, h, '✏️ Portrait', 'rgba(80, 70, 60, 0.7)');
  },
};

const spanish: PhotoFilter = {
  id: 'spanish',
  name: 'Spanish',
  preview: 'linear-gradient(135deg, #2b5f8a 0%, #e8865a 100%)',
  render(ctx, canvas, video, mirror) {
    const w = canvas.width, h = canvas.height;

    // Mediterranean color grading
    drawVideo(ctx, canvas, video, mirror,
      'saturate(1.3) contrast(1.12) brightness(1.06)');

    // Blue shadow split-tone
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(43, 95, 138, 0.14)';
    ctx.fillRect(0, 0, w, h);

    // Warm highlight split-tone
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(232, 134, 90, 0.09)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Cool blue vignette
    vignette(ctx, w, h, 'rgba(20, 50, 80, 0.6)', 0.35);

    // Blue border
    const bw = Math.max(6, Math.floor(Math.min(w, h) * 0.012));
    ctx.strokeStyle = 'rgba(43, 95, 138, 0.7)';
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);

    // Inner terracotta line
    const inn = bw * 2;
    ctx.strokeStyle = 'rgba(196, 112, 75, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(inn, inn, w - inn * 2, h - inn * 2);

    // Arch decorations along top
    const archR = Math.floor(Math.min(w, h) * 0.018);
    ctx.strokeStyle = 'rgba(43, 95, 138, 0.35)';
    ctx.lineWidth = 1.5;
    for (let x = bw * 4; x < w - bw * 4; x += archR * 2.8) {
      ctx.beginPath();
      ctx.arc(x, bw * 2.2, archR, Math.PI, 0);
      ctx.stroke();
    }

    hashtag(ctx, w, h, 'Barcelona 🇪🇸');
    badge(ctx, w, h, '🏰 Barcelona', 'rgba(43, 95, 138, 0.85)');
  },
};

const haldiFilter: PhotoFilter = {
  id: 'haldi',
  name: 'Haldi',
  preview: 'linear-gradient(135deg, #e8b84d 0%, #d4a030 50%, #c49020 100%)',
  render(ctx, canvas, video, mirror) {
    const w = canvas.width, h = canvas.height;

    // Deep turmeric golden glow
    drawVideo(ctx, canvas, video, mirror,
      'saturate(1.6) sepia(0.3) brightness(1.1) hue-rotate(-15deg) contrast(1.05)');

    // Yellow overlay
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 220, 100, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Warm golden vignette
    vignette(ctx, w, h, 'rgba(200, 150, 0, 0.5)', 0.4);

    // Marigold gradient border
    const bw = Math.max(8, Math.floor(Math.min(w, h) * 0.015));
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(232, 184, 77, 0.9)');
    grad.addColorStop(0.5, 'rgba(232, 134, 90, 0.9)');
    grad.addColorStop(1, 'rgba(232, 184, 77, 0.9)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);

    // Marigold flower circles at corners
    const r = Math.floor(Math.min(w, h) * 0.022);
    const offset = bw * 3;
    for (const [cx, cy] of [[offset, offset], [w - offset, offset], [offset, h - offset], [w - offset, h - offset]] as const) {
      // Petals
      ctx.fillStyle = 'rgba(255, 200, 50, 0.45)';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = 'rgba(232, 160, 50, 0.7)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    hashtag(ctx, w, h, 'Haldi ✨');
    badge(ctx, w, h, '✨ Haldi', 'rgba(200, 160, 30, 0.85)');
  },
};

const sangeet: PhotoFilter = {
  id: 'sangeet',
  name: 'Sangeet',
  preview: 'linear-gradient(135deg, #8844aa 0%, #e84870 50%, #d46840 100%)',
  render(ctx, canvas, video, mirror) {
    const w = canvas.width, h = canvas.height;

    // Vibrant purple/magenta stage lighting
    drawVideo(ctx, canvas, video, mirror,
      'saturate(1.7) contrast(1.2) brightness(0.95) hue-rotate(-10deg)');

    // Purple shadows
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(136, 68, 170, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Pink highlights
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(232, 72, 112, 0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Purple vignette
    vignette(ctx, w, h, 'rgba(80, 20, 100, 0.7)', 0.45);

    // Neon glow border
    const bw = Math.max(5, Math.floor(Math.min(w, h) * 0.008));
    const glowGrad = ctx.createLinearGradient(0, 0, w, 0);
    glowGrad.addColorStop(0, 'rgba(136, 68, 170, 0.8)');
    glowGrad.addColorStop(0.5, 'rgba(232, 72, 112, 0.8)');
    glowGrad.addColorStop(1, 'rgba(136, 68, 170, 0.8)');
    ctx.save();
    ctx.shadowColor = 'rgba(136, 68, 170, 0.7)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = glowGrad;
    ctx.lineWidth = bw;
    const m = bw * 2.5;
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);
    ctx.restore();

    // Twinkling sparkles
    const t = Date.now() / 1000;
    for (let i = 0; i < 25; i++) {
      const sx = ((i * 37 + 13) % 100) / 100 * w;
      const sy = ((i * 53 + 7) % 100) / 100 * h;
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i * 0.7));
      ctx.globalAlpha = twinkle * 0.55;
      ctx.fillStyle = 'white';
      const ss = (1 + (i % 3)) * Math.min(w, h) * 0.002;
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fill();
      // Cross sparkle rays
      ctx.fillRect(sx - ss * 2.5, sy - 0.5, ss * 5, 1);
      ctx.fillRect(sx - 0.5, sy - ss * 2.5, 1, ss * 5);
    }
    ctx.globalAlpha = 1;

    hashtag(ctx, w, h, 'Sangeet Night 🎤');
    badge(ctx, w, h, '🎤 Sangeet', 'rgba(136, 68, 170, 0.85)');
  },
};

const wedding: PhotoFilter = {
  id: 'wedding',
  name: 'Wedding',
  preview: 'linear-gradient(135deg, #e8c4b8 0%, #f0ddd4 50%, #d4a898 100%)',
  render(ctx, canvas, video, mirror) {
    const w = canvas.width, h = canvas.height;

    // Soft romantic base
    drawVideo(ctx, canvas, video, mirror,
      'saturate(0.9) brightness(1.08) contrast(0.95) sepia(0.06)');

    // Dreamy bloom — re-draw blurred at low opacity
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.filter = 'blur(18px) brightness(1.25)';
    if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();
    ctx.filter = 'none';
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Rose-gold vignette
    vignette(ctx, w, h, 'rgba(200, 160, 140, 0.5)', 0.35);

    // Elegant double border
    const bw = Math.max(2, Math.floor(Math.min(w, h) * 0.005));
    const m1 = bw * 4;
    const m2 = m1 + bw * 4;
    ctx.strokeStyle = 'rgba(212, 168, 152, 0.6)';
    ctx.lineWidth = bw;
    ctx.strokeRect(m1, m1, w - m1 * 2, h - m1 * 2);
    ctx.strokeStyle = 'rgba(212, 168, 152, 0.35)';
    ctx.lineWidth = bw * 0.7;
    ctx.strokeRect(m2, m2, w - m2 * 2, h - m2 * 2);

    // Diamond accents at midpoints
    const ds = Math.floor(Math.min(w, h) * 0.012);
    ctx.fillStyle = 'rgba(212, 168, 152, 0.5)';
    for (const [cx, cy] of [[w / 2, m1], [w / 2, h - m1], [m1, h / 2], [w - m1, h / 2]] as const) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-ds / 2, -ds / 2, ds, ds);
      ctx.restore();
    }

    hashtag(ctx, w, h);
    badge(ctx, w, h, '💍 Wedding', 'rgba(196, 112, 75, 0.75)');
  },
};

// ── Export ───────────────────────────────────────────────────

export const PHOTO_FILTERS: PhotoFilter[] = [
  none,
  rajasthani,
  sketch,
  spanish,
  haldiFilter,
  sangeet,
  wedding,
];
