import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { staffLogin } = useAuth();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await staffLogin({ email, password }); navigate('/staff'); }
    catch (err) { setError(err.response?.data?.message || 'Staff login failed'); }
  };
  return <main className="auth-page container"><div className="auth-card staff-card">
    <span className="eyebrow">Restaurant staff</span><h1>Open the service dashboard.</h1>
    <p className="muted">Waiters can assign the chef and bartender, update order status and mark orders served. Chef/bartender accounts can sign in for role visibility.</p>
    <form onSubmit={submit} className="form-stack"><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} 
  onChange={e => setPassword(e.target.value)}/></label>{error && <p className="error">{error}</p>}<Link className="text-link" to="/staff/forgot-password">Forgot password?</Link><button className="btn big full">Login as staff</button></form>
    <p className="muted small-text">Demo waiter: tolu.waiter@chowly.demo / Password123!</p>
  </div></main>;
}
