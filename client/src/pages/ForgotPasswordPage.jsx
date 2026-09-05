import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage({ role = 'customer' }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { message } = await forgotPassword(role, email);
      setStatus(message);
    } catch {
      setStatus('Something went wrong — try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-page container"><div className="auth-card">
    <span className="eyebrow">{role === 'staff' ? 'Restaurant staff' : 'Customer account'}</span>
    <h1>Forgot your password?</h1>
    <p className="muted">Enter your email and, if there's an account, we'll send a link to set a new password.</p>
    <form className="form-stack" onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></label>
      <button className="btn big full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
    </form>
    {status && <p className="toast-inline" style={{ marginTop: 16 }}>{status}</p>}
    <Link className="text-link" style={{ marginTop: 16, display: 'inline-block' }} to={role === 'staff' ? '/staff-login' : '/login'}>Back to login</Link>
  </div></main>;
}
