// Wedding Monogram — intertwined N & S
// Warm gold on dark backgrounds

export default function Monogram({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="Neil & Shriya monogram"
    >
      <defs>
        <linearGradient id="mono-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5c47a" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#b8943f" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="url(#mono-gold)"
        strokeWidth="1.5"
      />
      {/* Inner decorative circle */}
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="url(#mono-gold)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
      {/* N letter */}
      <text
        x="78"
        y="125"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="72"
        fontWeight="600"
        fill="url(#mono-gold)"
        textAnchor="middle"
      >
        N
      </text>
      {/* Ampersand */}
      <text
        x="100"
        y="108"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="22"
        fontWeight="400"
        fontStyle="italic"
        fill="url(#mono-gold)"
        textAnchor="middle"
      >
        &amp;
      </text>
      {/* S letter */}
      <text
        x="122"
        y="125"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="72"
        fontWeight="600"
        fill="url(#mono-gold)"
        textAnchor="middle"
      >
        S
      </text>
      {/* Small decorative dots */}
      <circle cx="50" cy="100" r="2" fill="url(#mono-gold)" opacity="0.6" />
      <circle cx="150" cy="100" r="2" fill="url(#mono-gold)" opacity="0.6" />
      <circle cx="100" cy="50" r="2" fill="url(#mono-gold)" opacity="0.6" />
      <circle cx="100" cy="150" r="2" fill="url(#mono-gold)" opacity="0.6" />
    </svg>
  );
}
