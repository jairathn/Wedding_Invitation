export function PaperTexture({ className = '', darker = false }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Base cream gradient - warm stationery color */}
      <div
        className="absolute inset-0"
        style={{
          background: darker
            ? 'linear-gradient(145deg, #F5F0E6 0%, #EDE6D8 50%, #F2EBE0 100%)'
            : 'linear-gradient(160deg, #FDFBF7 0%, #F9F6F0 30%, #F5F1E8 60%, #F8F5EE 100%)',
        }}
      />

      {/* Subtle noise/grain texture - NOT lined */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Very subtle fiber texture - organic, not lined */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B7765' fill-opacity='1'%3E%3Ccircle cx='10' cy='15' r='0.5'/%3E%3Ccircle cx='30' cy='45' r='0.4'/%3E%3Ccircle cx='50' cy='25' r='0.3'/%3E%3Ccircle cx='70' cy='65' r='0.5'/%3E%3Ccircle cx='85' cy='35' r='0.4'/%3E%3Ccircle cx='20' cy='75' r='0.3'/%3E%3Ccircle cx='60' cy='85' r='0.5'/%3E%3Ccircle cx='40' cy='55' r='0.4'/%3E%3Ccircle cx='90' cy='90' r='0.3'/%3E%3Ccircle cx='5' cy='50' r='0.4'/%3E%3Ccircle cx='75' cy='10' r='0.3'/%3E%3Ccircle cx='45' cy='95' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Inner shadow for depth/weight feel */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 80px rgba(139, 119, 101, 0.06)',
        }}
      />

      {/* Subtle warm vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(139, 119, 101, 0.03) 100%)',
        }}
      />
    </div>
  );
}
