import { useEffect, useState } from 'react';
import { getPendingCount } from '../lib/upload-queue';

export default function UploadIndicator() {
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const c = await getPendingCount();
      setCount(c);
      // Auto-reset dismissed when new uploads are queued
      if (c > 0) setDismissed(false);
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0 || dismissed) return null;

  return (
    <button
      onClick={() => setDismissed(true)}
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'white',
        border: '1px solid #E8DDD3',
        borderRadius: 20,
        padding: '6px 14px',
        boxShadow: '0 2px 12px rgba(44,40,37,0.08)',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span style={{ color: '#D4A853', fontSize: 11, fontWeight: 600 }}>{count} uploading...</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#B8AFA6" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </button>
  );
}
