// Email Collection Prompt
// Shown after first recording — optional email for morning-after delivery

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
      // Store locally if API unavailable
      localStorage.setItem('guest_email', email.trim());
    }
    setSaving(false);
    navigate('/app/home');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-full bg-[#c9a84c]/10 flex items-center justify-center mx-auto mb-5">
          <Mail size={24} className="text-[#c9a84c]" />
        </div>

        <h2 className="font-serif text-xl font-semibold text-[#f5f0e8] mb-2">
          Want your photos & videos?
        </h2>
        <p className="text-sm text-[#a0998c] mb-6 leading-relaxed">
          We'll send you all your captured memories after the wedding. Totally optional!
        </p>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#a0998c]/50 font-sans text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-all mb-4"
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-sans font-semibold rounded-xl py-3.5"
        >
          {email.trim() ? 'Save & Continue' : 'Skip for Now'}
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
}
