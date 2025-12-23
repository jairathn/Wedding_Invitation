import { Background } from './components/Background';
import { WeddingInvitation } from './components/WeddingInvitation';
import { BackgroundMusic } from './components/BackgroundMusic';

function App() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <BackgroundMusic />
      <main className="relative z-10">
        <WeddingInvitation />
      </main>
    </div>
  );
}

export default App;
