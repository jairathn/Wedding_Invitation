// Wedding Monogram — N & S
// Terracotta on light backgrounds, white on dark/camera backgrounds

export default function Monogram({ size = 80, variant = 'default', className = '' }: {
  size?: number;
  variant?: 'default' | 'light'; // 'light' = white version for dark backgrounds
  className?: string;
}) {
  const mainColor = variant === 'light' ? '#FFFFFF' : '#C4704B';
  const accentColor = variant === 'light' ? 'rgba(255,255,255,0.4)' : '#2B5F8A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="Neil & Shriya monogram"
    >
      {/* Outer circle */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke={mainColor}
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Inner decorative circle */}
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke={mainColor}
        strokeWidth="0.5"
        strokeDasharray="4 4"
        opacity="0.3"
      />
      {/* N letter */}
      <text
        x="78"
        y="125"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="72"
        fontWeight="600"
        fill={mainColor}
        textAnchor="middle"
      >
        N
      </text>
      {/* Ampersand */}
      <text
        x="100"
        y="108"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="22"
        fontWeight="400"
        fontStyle="italic"
        fill={accentColor}
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
        fill={mainColor}
        textAnchor="middle"
      >
        S
      </text>
      {/* Small decorative dots */}
      <circle cx="50" cy="100" r="2" fill={mainColor} opacity="0.3" />
      <circle cx="150" cy="100" r="2" fill={mainColor} opacity="0.3" />
      <circle cx="100" cy="50" r="2" fill={mainColor} opacity="0.3" />
      <circle cx="100" cy="150" r="2" fill={mainColor} opacity="0.3" />
    </svg>
  );
}
