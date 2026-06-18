import { Link } from 'react-router-dom';

export default function SmsTerms() {
  return (
    <main className="min-h-screen bg-cream px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl italic text-charcoal">SMS Terms</h1>
        <div
          className="mt-4 mb-8 h-[3px] w-24"
          style={{
            background:
              'linear-gradient(90deg, rgba(212,168,83,0.6) 0%, rgba(212,168,83,0.2) 100%)',
          }}
        />
        <p className="font-sans text-[15px] leading-relaxed text-charcoal/80">
          By opting in, you agree to receive recurring SMS messages from Shriya &amp; Neil&apos;s
          Wedding about wedding logistics (shuttle times, venue details, schedule changes). Message
          frequency varies — approximately 5 messages through September 2026. Message and data rates
          may apply. Reply STOP at any time to unsubscribe; reply HELP for help or email
          hello@jaywalkingtojairath.wedding. Carriers are not liable for delayed or undelivered
          messages.
        </p>
        <p className="mt-10 font-sans text-sm">
          <Link to="/" className="text-terracotta underline hover:text-terracotta-dark">
            ← Back to invitation
          </Link>
        </p>
      </div>
    </main>
  );
}
