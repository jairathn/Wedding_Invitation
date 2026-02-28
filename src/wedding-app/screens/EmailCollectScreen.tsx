// Email Collection — /app/email-collect
// Warm centered card on cream background

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
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-[#FEFCF9]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(44,40,37,0.08)] border border-[#E8DDD3]/30 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#C4704B]/10 flex items-center justify-center mx-auto mb-5">
            <Mail size={24} className="text-[#C4704B]" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-xl font-semibold text-[#2C2825] mb-2">
            Get your memories
          </h2>
          <p className="text-[13px] text-[#8A8078] mb-6 leading-relaxed">
            We'll send you all your captured photos and videos after the wedding. Totally optional!
          </p>

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#F7F3ED] border border-[#E8DDD3] rounded-xl px-4 py-3 text-[#2C2825] placeholder-[#B8AFA6] font-sans text-[15px] focus:outline-none focus:border-[#C4704B]/40 focus:ring-2 focus:ring-[#C4704B]/10 transition-all mb-4"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#C4704B] text-white font-sans font-semibold text-[14px] rounded-full py-3.5 hover:bg-[#B5613E] transition-all shadow-sm"
          >
            {email.trim() ? 'Save & Continue' : 'Skip for Now'}
            <ArrowRight size={15} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
