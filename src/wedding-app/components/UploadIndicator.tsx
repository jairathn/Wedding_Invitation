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
    <div className="fixed top-3 right-3 z-40 flex items-center gap-2 bg-white border border-[#E8DDD3] rounded-full px-3.5 py-2 shadow-sm">
      <Upload size={13} className="text-[#D4A853] animate-pulse" strokeWidth={1.5} />
      <span className="text-[#D4A853] text-[11px] font-semibold">{count} uploading...</span>
    </div>
  );
}
