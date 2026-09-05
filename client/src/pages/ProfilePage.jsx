import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Cake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.type !== 'customer') return <Navigate to="/login" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.');
    }
  };

  return (
    <main className="container page narrow">
      <div className="page-title">
        <span className="eyebrow">Your profile</span>
        <h1>Hello, {user.name.split(' ')[0]}.</h1>
        <p className="muted">Keep your details up to date. Your date of birth is only used to unlock alcoholic drinks (18+) and to say happy birthday.</p>
      </div>

      {user.isBirthdayToday && (
        <div className="promo-big" style={{ marginBottom: '1.5rem' }}>
          <Cake />
          Happy birthday, {user.name.split(' ')[0]}! 🎉 Enjoy your day — this one's on the house in spirit.
        </div>
      )}

      <section className="form-card auth-card">
        <form onSubmit={submit} className="form-stack">
          <label>Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>Date of birth
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </label>
          {user.age !== null && user.age !== undefined && (
            <p className="muted small-text">Current age on file: {user.age}.</p>
          )}
          {error && <p className="error">{error}</p>}
          {saved && <p className="muted small-text">Saved.</p>}
          <button className="btn big full">Save profile</button>
        </form>
      </section>
    </main>
  );
}
