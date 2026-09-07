import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const role = searchParams.get('role') === 'staff' ? 'staff' : 'customer';
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await resetPassword(role, token, password);
      navigate(role === 'staff' ? '/staff' : '/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <main className="auth-page container"><div className="auth-card">
      <span className="eyebrow">{role === 'staff' ? 'Restaurant staff' : 'Customer account'}</span>
      <h1>This link is missing its token.</h1>
      <Link className="text-link" to={role === 'staff' ? '/staff/forgot-password' : '/forgot-password'}>Request a new link</Link>
    </div></main>;
  }

  return <main className="auth-page container"><div className="auth-card">
    <span className="eyebrow">{role === 'staff' ? 'Restaurant staff' : 'Customer account'}</span>
    <h1>Set a new password.</h1>
    <form className="form-stack" onSubmit={submit}>
      <label>New password<PasswordInput value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" /></label>
      <label>Confirm new password<PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn big full" disabled={loading}>{loading ? 'Saving…' : 'Set new password'}</button>
    </form>
  </div></main>;
}
