import { Link } from 'react-router-dom';

export default function SmsTerms() {
  return (
    <main style={{ maxWidth: 640, margin: '3rem auto', padding: '0 1.25rem', lineHeight: 1.6 }}>
      <h1>SMS Terms &amp; Conditions</h1>
      <p>
        By providing your mobile number and checking the consent box on Shriya &amp; Neil&apos;s
        Wedding site, you agree to receive recurring SMS text messages about the wedding —
        shuttle times, venue details, and day-of logistics.
      </p>
      <ul>
        <li>
          <strong>Message frequency:</strong> recurring; approximately 5 messages through
          September 2026.
        </li>
        <li>
          <strong>Cost:</strong> message and data rates may apply, depending on your carrier
          plan.
        </li>
        <li>
          <strong>Opt out:</strong> reply STOP at any time to stop receiving messages.
        </li>
        <li>
          <strong>Help:</strong> reply HELP for assistance, or email
          hello@jaywalkingtojairath.wedding.
        </li>
        <li>
          Carriers are not liable for delayed or undelivered messages.
        </li>
      </ul>
      <p>
        We do not sell, rent, or share your phone number with third parties for marketing
        purposes. See our <Link to="/privacy">Privacy Policy</Link> for details on how your
        information is handled.
      </p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">← Back to invitation</Link>
      </p>
    </main>
  );
}
