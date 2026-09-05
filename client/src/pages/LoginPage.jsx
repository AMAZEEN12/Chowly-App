import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', dateOfBirth: '', password: '' });
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const { customerLogin, customerRegister, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goNext = () => navigate(location.state?.from || '/explore');
  const submit = async (e) => {
    e.preventDefault(); setError(''); setUnverifiedEmail('');
    try {
      if (mode === 'login') {
        await customerLogin({ email: form.email, password: form.password });
        goNext();
      } else {
        const result = await customerRegister(form);
        navigate('/check-email', { state: { email: result.email } });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.unverified) {
        setUnverifiedEmail(data.email);
        setError(data.message);
      } else if (data?.message) {
        setError(data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to reach the Chowly server. Please make sure the backend is running on port 5000.');
      } else {
        setError(mode === 'login' ? 'Sign in failed. Please check your email and password.' : 'Account creation failed. Please try again.');
      }
    }
  };
  const handleGoogle = async (credential) => {
    setError(''); setUnverifiedEmail('');
    try { await googleLogin(credential); goNext(); }
    catch (err) { setError(err.response?.data?.message || 'Google sign-in failed'); }
  };
  return <main className="auth-page container"><div className="auth-card">
    <span className="eyebrow">Customer access</span><h1>{mode === 'login' ? 'Welcome back.' : 'Create your Chowly account.'}</h1>
    <div className="tabs wide"><button className={mode==='login'?'active':''} onClick={() => setMode('login')}>Login</button><button className={mode==='register'?'active':''} onClick={() => setMode('register')}>Sign up</button></div>
    <form onSubmit={submit} className="form-stack">
      {mode === 'register' && <><label>Name<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/></label><label>Date of birth (optional — needed later to order alcoholic drinks)<input type="date" value={form.dateOfBirth} onChange={e => setForm({...form,dateOfBirth:e.target.value})}/></label></>}
      <label>Email<input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required/></label>
      <label>Password<input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required/></label>
      {error && <p className="error">{error}</p>}
      {unverifiedEmail && <Link className="text-link" to="/check-email" state={{ email: unverifiedEmail }}>Resend confirmation email</Link>}
      {mode === 'login' && <Link className="text-link" to="/forgot-password">Forgot password?</Link>}
      <button className="btn big full">{mode === 'login' ? 'Login as customer' : 'Create account'}</button>
    </form>
    <div className="divider-text"><span>or</span></div>
    <GoogleSignInButton onCredential={handleGoogle} />
    <p className="muted small-text">Demo: adebayo@chowly.demo / Password123!</p>
    <Link className="text-link" to="/staff-login">Need the staff portal?</Link>
  </div></main>;
}