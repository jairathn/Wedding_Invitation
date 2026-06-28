import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TextUpdates from './TextUpdates';

// Dedicated, fully public page used as the Twilio proof-of-consent URL
// (https://jaywalkingtojairath.wedding/public). No envelope/name gate — the
// reviewer immediately sees business identity, the event, the messaging
// program, the opt-in form with consent, and links to the policies.
export default function UpdatesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-warm-white via-[#FDF6EE] to-cream">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16">
        {/* Identity / event */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-charcoal/45">
            Wedding Text Updates
          </p>
          <h1 className="mt-3 font-serif text-4xl italic leading-tight text-charcoal sm:text-5xl">
            Shriya &amp; Neil&apos;s Wedding
          </h1>
          <p className="mt-3 font-sans text-xs uppercase tracking-[0.2em] text-charcoal/55">
            September 9–11, 2026 · Barcelona, Spain
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center py-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-golden/40" />
            <div className="mx-3">
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-golden/60">
                <path fill="currentColor" d="M4 0L4.9 3.1L8 4L4.9 4.9L4 8L3.1 4.9L0 4L3.1 3.1L4 0Z" />
              </svg>
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-golden/40" />
          </div>

          <p className="mx-auto max-w-md font-sans text-[15px] leading-relaxed text-charcoal/70">
            Welcome to Shriya &amp; Neil&apos;s wedding information page. To receive informational
            text updates about our wedding-day logistics — shuttle times, venue details, and
            schedule changes — enter your mobile number and check the consent box below. Sign-up is
            voluntary, you provide your own number, and we only message the number you submit here.
            Approximately 5 messages through September 2026. Reply STOP anytime to opt out, HELP for
            help. This wedding text program is operated by Bedside Bike, LLC.
          </p>
        </motion.header>

        {/* Opt-in form (carries the consent checkbox + policy links) */}
        <div className="w-full">
          <TextUpdates />
        </div>

        {/* Footer — public web presence: identity, policies, contact */}
        <footer className="-mt-6 text-center">
          <p className="font-serif text-base italic text-charcoal/80">
            Shriya &amp; Neil&apos;s Wedding
          </p>
          <p className="mt-1 font-sans text-[11px] text-charcoal/45">
            Wedding text program operated by Bedside Bike, LLC
          </p>
          <nav className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-xs text-charcoal/60">
            <Link to="/privacy" className="transition-colors hover:text-terracotta">
              Privacy Policy
            </Link>
            <Link to="/sms-terms" className="transition-colors hover:text-terracotta">
              SMS Terms
            </Link>
            <a
              href="mailto:hello@jaywalkingtojairath.wedding"
              className="transition-colors hover:text-terracotta"
            >
              Contact
            </a>
            <Link to="/" className="transition-colors hover:text-terracotta">
              Invitation
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
