import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-cream px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl italic text-charcoal">Privacy Policy</h1>
        <div
          className="mt-4 mb-8 h-[3px] w-24"
          style={{
            background:
              'linear-gradient(90deg, rgba(212,168,83,0.6) 0%, rgba(212,168,83,0.2) 100%)',
          }}
        />
        <p className="font-sans text-[15px] leading-relaxed text-charcoal/80">
          Shriya &amp; Neil&apos;s Wedding collects your name, email, and mobile number solely
          to share wedding information with you.{' '}
          <strong className="font-semibold text-charcoal">
            We do not sell, rent, or share your phone number or personal information with third
            parties or affiliates for marketing purposes.
          </strong>{' '}
          Phone numbers submitted for SMS updates are used only to send wedding-related texts. To
          stop texts, reply STOP. Questions: hello@jaywalkingtojairath.wedding.
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
