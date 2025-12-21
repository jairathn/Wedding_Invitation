export function PaperTexture({ className = '', darker = false }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Base - warm ivory/cream color like fine cotton paper */}
      <div
        className="absolute inset-0"
        style={{
          background: darker
            ? '#F3EDE4'
            : 'linear-gradient(180deg, #FDFCF9 0%, #FAF8F4 50%, #F8F6F1 100%)',
        }}
      />

      {/* Very subtle cotton fiber texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle warmth variation */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.02) 0%, transparent 50%)',
        }}
      />

      {/* Very gentle edge darkening for depth */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 60px rgba(139, 119, 101, 0.04)',
        }}
      />
    </div>
  );
}
