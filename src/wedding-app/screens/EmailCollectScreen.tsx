// Email Collection — /app/email-collect
// Centered modal with frosted glass

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { getStoredSession } from '../lib/session';

export default function EmailCollectScreen() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      navigate('/app/home');
      return;
    }
    setSaving(true);
    try {
      await fetch('/api/email/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: session?.guestId,
          email: email.trim(),
        }),
      });
    } catch {
      localStorage.setItem('guest_email', email.trim());
    }
    setSaving(false);
    navigate('/app/home');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-[#050505]">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40%] h-[30%] rounded-full bg-[#c9a84c]/[0.04] blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.06] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#c9a84c]/10 flex items-center justify-center mx-auto mb-6">
            <Mail size={24} className="text-[#c9a84c]" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-xl font-semibold text-white mb-2">
            Get your memories
          </h2>
          <p className="text-[13px] text-white/30 mb-6 leading-relaxed">
            We'll send you all your captured photos and videos after the wedding.
          </p>

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 font-sans text-[14px] focus:outline-none focus:border-[#c9a84c]/40 focus:bg-white/[0.07] transition-all duration-200 mb-4"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold text-[14px] rounded-xl py-3.5 hover:bg-[#d4b55a] transition-all shadow-lg shadow-[#c9a84c]/10"
          >
            {email.trim() ? 'Save & Continue' : 'Skip for Now'}
            <ArrowRight size={15} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
