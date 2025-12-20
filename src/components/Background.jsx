export function Background() {
  return (
    <div className="fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/castell-background.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-cream/85" />
    </div>
  );
}
