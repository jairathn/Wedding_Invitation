import { PolicyPage } from './PolicyPage';

export default function Privacy() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        Shriya &amp; Neil&apos;s Wedding collects your name, email, and mobile number solely
        to share wedding information with you.{' '}
        <strong className="font-semibold text-charcoal">
          We do not sell, rent, or share your phone number or personal information with third
          parties or affiliates for marketing purposes.
        </strong>{' '}
        Phone numbers submitted for SMS updates are used only to send wedding-related texts. To
        stop texts, reply STOP. Questions: hello@jaywalkingtojairath.wedding.
      </p>
    </PolicyPage>
  );
}
