import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { getPendingCount } from '../lib/upload-queue';

export default function UploadIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      const c = await getPendingCount();
      setCount(c);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <div className="fixed top-3 right-3 z-40 flex items-center gap-2 bg-[#111]/80 backdrop-blur-xl border border-white/[0.06] rounded-full px-3.5 py-2 shadow-lg">
      <Upload size={13} className="text-amber-400 animate-pulse" strokeWidth={1.5} />
      <span className="text-amber-400/80 text-[11px] font-medium tracking-wide">{count} pending</span>
    </div>
  );
}
