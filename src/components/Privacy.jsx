import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main style={{ maxWidth: 640, margin: '3rem auto', padding: '0 1.25rem', lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>
        Shriya &amp; Neil&apos;s Wedding collects your name, email, and mobile number solely
        to share wedding information with you. <strong>We do not sell, rent, or share your
        phone number or personal information with third parties or affiliates for marketing
        purposes.</strong> Phone numbers submitted for SMS updates are used only to send
        wedding-related texts. To stop texts, reply STOP. Questions:{' '}
        hello@jaywalkingtojairath.wedding.
      </p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">← Back to invitation</Link>
      </p>
    </main>
  );
}
