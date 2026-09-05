import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setMessage('This confirmation link is missing its token.'); return; }
    verifyEmail(token)
      .then(() => {
        setState('success');
        setTimeout(() => navigate('/explore'), 2000);
      })
      .catch((err) => {
        setState('error');
        setMessage(err.response?.data?.message || 'This confirmation link is invalid or has expired.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <main className="auth-page container"><div className="auth-card">
    <span className="eyebrow">Email confirmation</span>
    {state === 'checking' && <h1>Confirming your email…</h1>}
    {state === 'success' && <><h1>You're verified! 🎉</h1><p className="muted">Taking you into Chowly…</p></>}
    {state === 'error' && <><h1>Couldn't confirm that link.</h1><p className="error">{message}</p><Link className="text-link" to="/check-email">Request a new link</Link></>}
  </div></main>;
}