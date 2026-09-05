import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'adebayo@chowly.demo', phone: '', dateOfBirth: '', password: 'Password123!' });
  const [error, setError] = useState('');
  const { customerLogin, customerRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (mode === 'login') await customerLogin({ email: form.email, password: form.password });
      else await customerRegister(form);
      navigate(location.state?.from || '/explore');
    } catch (err) { setError(err.response?.data?.message || 'Sign in failed'); }
  };
  return <main className="auth-page container"><div className="auth-card">
    <span className="eyebrow">Customer access</span><h1>{mode === 'login' ? 'Welcome back.' : 'Create your Chowly account.'}</h1>
    <div className="tabs wide"><button className={mode==='login'?'active':''} onClick={() => setMode('login')}>Login</button><button className={mode==='register'?'active':''} onClick={() => setMode(
  'register')}>Sign up</button></div>
    <form onSubmit={submit} className="form-stack">
      {mode === 'register' && <><label>Name<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/></label><label>Date of birth (optional — needed later to order alcoholic drinks)<input type="date" value={form.dateOfBirth} onChange={e => setForm({...form,dateOfBirth:e.target.value})}/></label></>}
      <label>Email<input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required/></label>
      <label>Password<input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required/></label>
      {error && <p className="error">{error}</p>}
      <button className="btn big full">{mode === 'login' ? 'Login as customer' : 'Create account'}</button>
    </form>
    <p className="muted small-text">Demo: adebayo@chowly.demo / Password123!</p>
    <Link className="text-link" to="/staff-login">Need the staff portal?</Link>
  </div></main>;
}
