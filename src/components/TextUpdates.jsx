import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Formspree form ID — set VITE_FORMSPREE_FORM_ID in your env, or replace the
// fallback below with your real form ID from https://formspree.io
const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'YOUR_FORM_ID';

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
      className="relative z-10 px-4 pb-20 pt-6 scroll-mt-6"
    >
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-sm border border-cream-dark bg-warm-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_12px_48px_rgba(0,0,0,0.1)] backdrop-blur-sm">
        {/* Gold accent line to echo the invitation card */}
        <div
          className="h-[3px]"
          style={{
            background:
              'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
          }}
        />

        <div className="px-7 py-7">
          {status === 'done' ? (
            <p className="text-center font-serif text-xl italic text-charcoal">
              You&apos;re signed up — see you there! 🎉
            </p>
          ) : (
            <>
              <h3 className="text-center font-serif text-2xl italic text-charcoal">
                Get day-of text updates
              </h3>
              <p className="mx-auto mt-2 mb-6 max-w-xs text-center font-sans text-sm text-charcoal-light">
                Shuttle times, venue details, and day-of logistics — straight to your phone.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[0.18em] text-charcoal/55">
                  Mobile number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 812 555 0123"
                  className="mb-4 w-full rounded-md border border-cream-dark bg-cream/60 px-4 py-3 font-sans text-charcoal placeholder:text-taupe focus:border-golden/60 focus:bg-warm-white focus:outline-none focus:ring-2 focus:ring-golden/15 transition-all"
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
                    <Link to="/privacy" className="text-terracotta underline hover:text-terracotta-dark">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/sms-terms" className="text-terracotta underline hover:text-terracotta-dark">
                      SMS Terms
                    </Link>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-5 w-full rounded-full bg-terracotta py-3.5 font-sans text-sm font-semibold tracking-wide text-warm-white shadow-sm transition-all duration-200 hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Signing up…' : 'Sign me up'}
                </button>

                {status === 'error' && (
                  <p className="mt-3 text-center font-sans text-xs text-coral">
                    Something went wrong — please try again or text us directly.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
