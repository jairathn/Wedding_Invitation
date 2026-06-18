import { useState } from 'react';
import { Link } from 'react-router-dom';

// Formspree form ID — set VITE_FORMSPREE_FORM_ID in your env, or replace the
// fallback below with your real form ID from https://formspree.io
const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'YOUR_FORM_ID';

export default function TextUpdates() {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

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

  if (status === 'done') {
    return (
      <section id="text-updates" style={wrap}>
        <p style={{ margin: 0 }}>You&apos;re signed up — see you there! 🎉</p>
      </section>
    );
  }

  return (
    <section id="text-updates" style={wrap}>
      <h3 style={{ margin: '0 0 .25rem' }}>Get day-of text updates</h3>
      <p style={{ margin: '0 0 1rem', fontSize: '.9rem', color: '#555' }}>
        Shuttle times, venue details, and day-of logistics — straight to your phone.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', fontSize: '.85rem', marginBottom: '.25rem' }}>
          Mobile number
        </label>
        <input
          type="tel"
          name="phone"
          required
          placeholder="+1 812 555 0123"
          style={{
            width: '100%',
            padding: '.6rem',
            border: '1px solid #cbbfa8',
            borderRadius: 8,
            marginBottom: '.9rem',
          }}
        />
        <label
          style={{
            display: 'flex',
            gap: '.5rem',
            alignItems: 'flex-start',
            fontSize: '.8rem',
            color: '#444',
            lineHeight: 1.45,
          }}
        >
          <input type="checkbox" name="sms_consent" required style={{ marginTop: '.2rem' }} />
          <span>
            <strong>Text me wedding updates.</strong> By checking this box and providing my
            number, I agree to receive recurring SMS texts from Shriya &amp; Neil&apos;s Wedding
            (shuttle times, venue details, day-of logistics) at the number above. Approx. 5
            messages through Sept 2026. Msg &amp; data rates may apply. Reply STOP to opt out,
            HELP for help. See our <Link to="/privacy">Privacy Policy</Link> and{' '}
            <Link to="/sms-terms">SMS Terms</Link>.
          </span>
        </label>
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '.7rem',
            border: 'none',
            borderRadius: 8,
            background: '#c6a355',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {status === 'sending' ? 'Signing up…' : 'Sign me up'}
        </button>
        {status === 'error' && (
          <p style={{ color: '#c4704b', fontSize: '.8rem', marginTop: '.5rem' }}>
            Something went wrong — please try again or text us directly.
          </p>
        )}
      </form>
    </section>
  );
}

const wrap = {
  maxWidth: 480,
  margin: '2rem auto',
  padding: '1.5rem',
  border: '1px solid #e5ddd0',
  borderRadius: 14,
  textAlign: 'left',
  background: 'rgba(255, 255, 255, 0.92)',
};
