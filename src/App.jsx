import { Background } from './components/Background';
import { WeddingInvitation } from './components/WeddingInvitation';

function App() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-10">
        <WeddingInvitation />
      </main>
    </div>
  );
}

export default App;
