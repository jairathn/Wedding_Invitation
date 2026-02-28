// Admin Dashboard — /app/admin
// Protected by admin key, shows upload stats and system controls

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Send, Film, Upload, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { getAllQueued } from '../lib/upload-queue';

interface Stats {
  totalUploads: number;
  videoCount: number;
  photoCount: number;
  pendingUploads: number;
  failedUploads: number;
  uniqueGuests: number;
}

export default function AdminScreen() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const authenticate = async () => {
    try {
      const res = await fetch('/api/admin/health', {
        headers: { 'X-Admin-Key': adminKey },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_key', adminKey);
        loadStats();
      } else {
        alert('Invalid admin key');
      }
    } catch {
      // If API is down, allow local-only admin
      setIsAuthenticated(true);
      loadStats();
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('admin_key');
    if (stored) {
      setAdminKey(stored);
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Load local queue stats
      const queued = await getAllQueued();
      const videos = queued.filter(q => q.metadata.mediaType === 'video');
      const photos = queued.filter(q => q.metadata.mediaType === 'photo');
      const failed = queued.filter(q => q.status === 'failed');
      const guests = new Set(queued.map(q => q.metadata.guestName));

      setStats({
        totalUploads: queued.length,
        videoCount: videos.length,
        photoCount: photos.length,
        pendingUploads: queued.filter(q => q.status === 'queued').length,
        failedUploads: failed.length,
        uniqueGuests: guests.size,
      });

      // Also try to load server stats
      const key = localStorage.getItem('admin_key') || adminKey;
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'X-Admin-Key': key },
        });
        if (res.ok) {
          const serverStats = await res.json();
          setStats(prev => prev ? { ...prev, ...serverStats } : prev);
        }
      } catch {
        // Server stats unavailable, use local only
      }
    } finally {
      setLoading(false);
    }
  };

  const retryFailed = async () => {
    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      await fetch('/api/upload/retry', {
        method: 'POST',
        headers: { 'X-Admin-Key': key },
      });
      loadStats();
    } catch {
      // Process locally
      const { processQueue } = await import('../lib/upload-queue');
      await processQueue();
      loadStats();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lock size={20} className="text-[#c9a84c]" />
            <h1 className="font-serif text-xl text-[#f5f0e8]">Admin Access</h1>
          </div>
          <input
            type="password"
            placeholder="Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#a0998c]/50 font-sans text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-all"
          />
          <button
            onClick={authenticate}
            className="w-full mt-3 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold rounded-xl py-3"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-[#f5f0e8]">Admin Dashboard</h1>
        <button
          onClick={loadStats}
          disabled={loading}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-[#a0998c] hover:text-white transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {stats && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Total Uploads" value={stats.totalUploads} icon={Upload} color="#c9a84c" />
            <StatCard label="Unique Guests" value={stats.uniqueGuests} icon={CheckCircle} color="#7d9b76" />
            <StatCard label="Videos" value={stats.videoCount} icon={Film} color="#d4a0a0" />
            <StatCard label="Photos" value={stats.photoCount} icon={Upload} color="#d4a843" />
            <StatCard label="Pending" value={stats.pendingUploads} icon={Upload} color="#d4a843" />
            <StatCard label="Failed" value={stats.failedUploads} icon={AlertTriangle} color="#c45c5c" />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <h2 className="font-sans font-semibold text-[#f5f0e8] text-sm uppercase tracking-wider">
              Actions
            </h2>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={retryFailed}
              className="w-full flex items-center gap-3 bg-[#1a1a2e] border border-white/5 rounded-xl p-4 text-left"
            >
              <RefreshCw size={18} className="text-[#d4a843]" />
              <div>
                <p className="text-[#f5f0e8] font-sans font-medium text-sm">Retry Failed Uploads</p>
                <p className="text-[#a0998c] text-xs mt-0.5">Process all failed upload items in the queue</p>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => alert('Reel generation is a Phase 2 feature')}
              className="w-full flex items-center gap-3 bg-[#1a1a2e] border border-white/5 rounded-xl p-4 text-left opacity-50"
            >
              <Film size={18} className="text-[#d4a0a0]" />
              <div>
                <p className="text-[#f5f0e8] font-sans font-medium text-sm">Generate All Reels</p>
                <p className="text-[#a0998c] text-xs mt-0.5">Phase 2 — Create personalized reels for all guests</p>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => alert('Email sending is a Phase 2 feature')}
              className="w-full flex items-center gap-3 bg-[#1a1a2e] border border-white/5 rounded-xl p-4 text-left opacity-50"
            >
              <Send size={18} className="text-[#7d9b76]" />
              <div>
                <p className="text-[#f5f0e8] font-sans font-medium text-sm">Send Morning-After Emails</p>
                <p className="text-[#a0998c] text-xs mt-0.5">Phase 2 — Send personalized reel emails to all guests</p>
              </div>
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a2e]/60 border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="opacity-70" style={{ color }} />
        <span className="text-xs text-[#a0998c] font-sans">{label}</span>
      </div>
      <p className="text-2xl font-serif font-semibold text-[#f5f0e8]">{value}</p>
    </div>
  );
}
