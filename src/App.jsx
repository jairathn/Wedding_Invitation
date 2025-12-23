import { useState } from 'react';
import { Background } from './components/Background';
import { WeddingInvitation } from './components/WeddingInvitation';
import { BackgroundMusic } from './components/BackgroundMusic';
import { PhotoCarousel } from './components/PhotoCarousel';

function App() {
  const [showCarousel, setShowCarousel] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Background />
      <PhotoCarousel show={showCarousel} />
      <BackgroundMusic />
      <main className="relative z-10">
        <WeddingInvitation onEnvelopeOpen={() => setShowCarousel(true)} />
      </main>
    </div>
  );
}

export default App;
