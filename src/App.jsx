import { Background } from './components/Background';
import { TrifoldInvitation } from './components/TrifoldInvitation';

function App() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-10">
        <TrifoldInvitation />
      </main>
    </div>
  );
}

export default App;
