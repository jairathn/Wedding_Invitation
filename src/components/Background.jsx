export function Background() {
  return (
    <div className="fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/castell-background.jpg)',
        }}
      />
      {/* More visible background - 70% cream overlay */}
      <div className="absolute inset-0 bg-cream/70" />
    </div>
  );
}
