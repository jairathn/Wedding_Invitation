// Wedding Monogram — Circular terracotta gradient badge with "N&S"
// Matches design: warm gradient circle, white Playfair text

export default function Monogram({ size = 44, variant = 'default', className = '' }: {
  size?: number;
  variant?: 'default' | 'light';
  className?: string;
}) {
  // 'light' variant: white circle with terracotta text (for dark backgrounds like camera screens)
  if (variant === 'light') {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Neil & Shriya monogram"
      >
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: size * 0.36,
          fontWeight: 600,
          color: 'white',
          letterSpacing: '0.05em',
        }}>N&S</span>
      </div>
    );
  }

  // Default: terracotta gradient circle with white text
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #C4704B 0%, #A85D3E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(196, 112, 75, 0.25)',
        flexShrink: 0,
      }}
      aria-label="Neil & Shriya monogram"
    >
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: size * 0.36,
        fontWeight: 600,
        color: 'white',
        letterSpacing: '0.05em',
      }}>N&S</span>
    </div>
  );
}
