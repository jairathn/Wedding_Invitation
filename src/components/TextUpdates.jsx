import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';

// Formspree form ID — overridable via VITE_FORMSPREE_FORM_ID, defaults to the
// live form at https://formspree.io/f/xnjykgzg
const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'xnjykgzg';

const goldLine = {
  background:
    'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
};

function Divider() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/40" />
      <div className="mx-3">
        <svg width="8" height="8" viewBox="0 0 8 8" className="text-golden/60">
          <path fill="currentColor" d="M4 0L4.9 3.1L8 4L4.9 4.9L4 8L3.1 4.9L0 4L3.1 3.1L4 0Z" />
        </svg>
      </div>
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-golden/40" />
    </div>
  );
}

export default function TextUpdates() {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const sectionRef = useRef(null);

  // The Twilio reviewer opens this site at /#text-updates. Make sure the
  // opt-in is brought into view on load regardless of the envelope intro,
  // so the form is reachable without friction.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#text-updates') {
      const t = setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
      return () => clearTimeout(t);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    try {
      const res = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      setStatus(res.ok ? 'done' : 'error');
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <section
      id="text-updates"
      ref={sectionRef}
      className="relative z-10 flex justify-center px-4 pb-24 pt-8 scroll-mt-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-sm"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 12px 48px rgba(0,0,0,0.1)' }}
      >
        <PaperTexture />

        {/* Top gold accent line */}
        <div className="relative h-[3px]" style={goldLine} />

        <div className="relative px-8 py-9 sm:px-10">
          {status === 'done' ? (
            <div className="py-6 text-center">
              <h3 className="font-serif text-2xl italic text-charcoal">
                You&apos;re on the list
              </h3>
              <Divider />
              <p className="font-sans text-sm text-charcoal/60">
                We&apos;ll text you the day-of details. See you in Barcelona! 🥂
              </p>
            </div>
          ) : (
            <>
              <p className="text-center font-sans text-[10px] uppercase tracking-[0.3em] text-charcoal/50">
                Stay in the loop
              </p>
              <h3 className="mt-2 text-center font-serif text-3xl italic text-charcoal">
                Day-of Text Updates
              </h3>

              <Divider />

              <p className="mx-auto -mt-1 mb-7 max-w-xs text-center font-sans text-sm leading-relaxed text-charcoal/60">
                Shuttle times, venue details, and day-of logistics — sent straight to your phone.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="mb-1.5 block font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Mobile number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 812 555 0123"
                  className="mb-5 w-full rounded-sm border border-cream-dark/80 bg-white/50 px-4 py-3 font-sans text-charcoal placeholder:text-taupe transition-all focus:border-golden/50 focus:bg-white/70 focus:outline-none focus:ring-1 focus:ring-golden/20"
                />

                <label className="flex items-start gap-2.5 font-sans text-xs leading-relaxed text-charcoal/70">
                  <input
                    type="checkbox"
                    name="sms_consent"
                    required
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-terracotta"
                  />
                  <span>
                    <strong className="font-semibold text-charcoal">Text me wedding updates.</strong>{' '}
                    By checking this box and providing my number, I agree to receive recurring SMS
                    texts from Shriya &amp; Neil&apos;s Wedding (shuttle times, venue details,
                    day-of logistics) at the number above. Approx. 5 messages through Sept 2026.
                    Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. See our{' '}
                    <Link to="/privacy" className="text-terracotta underline decoration-golden/40 underline-offset-2 hover:text-terracotta-dark">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/sms-terms" className="text-terracotta underline decoration-golden/40 underline-offset-2 hover:text-terracotta-dark">
                      SMS Terms
                    </Link>
                    .
                  </span>
                </label>

                <motion.button
                  type="submit"
                  disabled={status === 'sending'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full rounded-sm bg-terracotta py-3 font-serif text-lg font-bold italic tracking-wide text-warm-white transition-colors duration-300 hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ boxShadow: '0 6px 24px rgba(196,114,94,0.35), 0 2px 6px rgba(0,0,0,0.12)' }}
                >
                  {status === 'sending' ? 'Signing up…' : 'Sign Me Up'}
                </motion.button>

                {status === 'error' && (
                  <p className="mt-3 text-center font-sans text-xs text-coral">
                    Something went wrong — please try again or text us directly.
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        {/* Bottom gold accent line */}
        <div className="relative h-[3px]" style={goldLine} />
      </motion.div>
    </section>
  );
}
