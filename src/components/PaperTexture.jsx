export function PaperTexture({ className = '', darker = false }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Base cream gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: darker
            ? 'linear-gradient(145deg, #F5F0E6 0%, #EDE6D8 50%, #F2EBE0 100%)'
            : 'linear-gradient(145deg, #FFFEF9 0%, #FAF7F0 25%, #F5F0E8 50%, #FAF7F0 75%, #FFFEF9 100%)',
        }}
      />

      {/* Linen texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zM2 0h1v1H2zM4 0h1v1H4zM6 0h1v1H6zM8 0h1v1H8zM10 0h1v1h-1zM12 0h1v1h-1zM14 0h1v1h-1zM16 0h1v1h-1zM18 0h1v1h-1zM20 0h1v1h-1zM22 0h1v1h-1zM24 0h1v1h-1zM26 0h1v1h-1zM28 0h1v1h-1zM30 0h1v1h-1zM32 0h1v1h-1zM34 0h1v1h-1zM36 0h1v1h-1zM38 0h1v1h-1zM1 1h1v1H1zM3 1h1v1H3zM5 1h1v1H5zM7 1h1v1H7zM9 1h1v1H9zM11 1h1v1h-1zM13 1h1v1h-1zM15 1h1v1h-1zM17 1h1v1h-1zM19 1h1v1h-1zM21 1h1v1h-1zM23 1h1v1h-1zM25 1h1v1h-1zM27 1h1v1h-1zM29 1h1v1h-1zM31 1h1v1h-1zM33 1h1v1h-1zM35 1h1v1h-1zM37 1h1v1h-1zM39 1h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle fiber/grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Inner shadow for depth/weight feel */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 100px rgba(139, 119, 101, 0.08)',
        }}
      />

      {/* Subtle edge darkening */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(139, 119, 101, 0.04) 100%)',
        }}
      />
    </div>
  );
}
