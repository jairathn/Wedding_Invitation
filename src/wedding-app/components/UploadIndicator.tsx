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
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-[#1a1a2e] border border-[#d4a843]/40 rounded-full px-3 py-1.5 text-sm">
      <Upload size={14} className="text-[#d4a843] animate-pulse" />
      <span className="text-[#d4a843]">{count} upload{count !== 1 ? 's' : ''} pending</span>
    </div>
  );
}
