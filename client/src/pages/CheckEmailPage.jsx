import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const { resendVerification } = useAuth();
  const [status, setStatus] = useState('');

  const resend = async () => {
    setStatus('Sending…');
    try {
      await resendVerification(email);
      setStatus('A new confirmation link has been sent.');
    } catch {
      setStatus('Something went wrong — try again in a moment.');
    }
  };

  return <main className="auth-page container"><div className="auth-card">
    <span className="eyebrow">One more step</span>
    <h1>Check your email.</h1>
    <p className="muted">
      {email ? <>We sent a confirmation link to <strong>{email}</strong>.</> : 'We sent you a confirmation link.'}
      {' '}Click it to activate your account, then come back and log in.
    </p>
    {email && <button className="btn big full" onClick={resend} style={{ marginTop: 16 }}>Resend confirmation email</button>}
    {status && <p className="muted small-text" style={{ marginTop: 10 }}>{status}</p>}
    <Link className="text-link" to="/login" style={{ marginTop: 16, display: 'inline-block' }}>Back to login</Link>
  </div></main>;
}