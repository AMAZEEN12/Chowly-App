import { useState } from 'react';
import api from '../api/client';
export default function RestaurantApplyPage() {
  const [form, setForm] = useState({ restaurantName:'', contactName:'', email:'', phone:'', location:'', message:'' });
  const [message, setMessage] = useState('');
  const submit = async e => { e.preventDefault(); try { const r = await api.post('/restaurants/apply', form); setMessage(r.data.message); setForm({ restaurantName:'', contactName:'', email:'', phone:'', 
  location:'', message:'' }); } catch(err) { setMessage(err.response?.data?.message || 'Submission failed'); } };
  return <main className="auth-page container"><div className="auth-card wide-card"><span className="eyebrow">Bonus feature</span><h1>Register your restaurant interest.</h1><p className="muted">This 
  stores a real onboarding request in MongoDB. It does not instantly create a live restaurant account.</p><form className="form-stack" onSubmit={submit}><label>Restaurant name<input value={form.
  restaurantName} onChange={e=>setForm({...form,restaurantName:e.target.value})} required/></label><label>Contact person<input value={form.contactName} onChange={e=>setForm({...form,contactName:e.target.
  value})} required/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e=>
  setForm({...form,phone:e.target.value})}/></label><label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} required/></label><label>Message<textarea value={
  form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label><button className="btn big full">Submit registration request</button>{message && <div className="toast-inline">{message}</
  div>}</form></div></main>;
}
