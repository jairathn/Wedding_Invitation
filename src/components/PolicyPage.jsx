import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaperTexture } from './PaperTexture';

const goldLine = {
  background:
    'linear-gradient(90deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.6) 50%, rgba(212,168,83,0.2) 100%)',
};

// Shared, on-brand wrapper for the standalone /privacy and /sms-terms pages.
export function PolicyPage({ title, children }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-warm-white via-[#FDF6EE] to-cream">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-2xl overflow-hidden rounded-sm"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 12px 48px rgba(0,0,0,0.1)' }}
      >
        <PaperTexture />

        {/* Top gold accent line */}
        <div className="relative h-[3px]" style={goldLine} />

        <div className="relative px-8 py-12 sm:px-14">
          <p className="text-center font-sans text-[10px] uppercase tracking-[0.3em] text-charcoal/50">
            Shriya &amp; Neil&apos;s Wedding
          </p>
          <h1 className="mt-3 text-center font-serif text-4xl italic text-charcoal">
            {title}
          </h1>

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

          <div className="space-y-4 font-sans text-[15px] leading-relaxed text-charcoal/75">
            {children}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="font-sans text-xs uppercase tracking-[0.2em] text-terracotta transition-colors hover:text-terracotta-dark"
            >
              ← Back to invitation
            </Link>
          </div>
        </div>

        {/* Bottom gold accent line */}
        <div className="relative h-[3px]" style={goldLine} />
      </motion.article>
    </main>
  );
}
