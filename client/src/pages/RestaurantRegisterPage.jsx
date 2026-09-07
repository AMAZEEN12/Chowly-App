import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function RestaurantRegisterPage() {
  const [form, setForm] = useState({
    name: '', location: '', phone: '', email: '', imageUrl: '',
    cuisineTypes: '', promoText: '', cashbackPercent: 0, accent: '#ff7a00'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/restaurants/register', form);
      navigate(`/restaurant/${data.restaurant._id}/setup`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your restaurant');
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-page container"><div className="auth-card wide-card">
    <span className="eyebrow">Get listed on Chowly</span>
    <h1>Register your restaurant.</h1>
    <p className="muted">
      This creates a real restaurant record right away — no account needed.
      On the next page you'll add your menu and staff, then publish it live.
      Looking to just leave your details for our team instead? <Link className="text-link" to="/restaurant/apply">Register interest here.</Link>
    </p>
    <form className="form-stack" onSubmit={submit}>
      <label>Restaurant name
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required/>
      </label>
      <label>Location
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required/>
      </label>
      <label>Phone
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/>
      </label>
      <label>Contact email
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
      </label>
      <label>Restaurant cover image URL (optional)
        <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…"/>
      </label>
      <label>Cuisine types (comma separated)
        <input value={form.cuisineTypes} onChange={e => setForm({ ...form, cuisineTypes: e.target.value })} placeholder="Nigerian, Grill, Seafood"/>
      </label>
      <label>Promo text (optional)
        <input value={form.promoText} onChange={e => setForm({ ...form, promoText: e.target.value })} placeholder="20% off this weekend"/>
      </label>
      <label>Cashback % (optional)
        <input type="number" min="0" max="100" value={form.cashbackPercent} onChange={e => setForm({ ...form, cashbackPercent: e.target.value })}/>
      </label>
      <label>Brand color
        <input type="color" value={form.accent} onChange={e => setForm({ ...form, accent: e.target.value })}/>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn big full" disabled={loading}>{loading ? 'Creating…' : 'Create restaurant & continue'}</button>
    </form>
  </div></main>;
}
