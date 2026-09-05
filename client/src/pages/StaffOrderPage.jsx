import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
export default function StaffOrderPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [bartenders, setBartenders] = useState([]);
  const [chefId, setChefId] = useState('');
  const [bartenderId, setBartenderId] = useState('');
  const [status, setStatus] = useState('Preparing');
  const [message, setMessage] = useState('');
  const load = () => api.get(`/orders/${id}`).then(r => { setOrder(r.data); setChefId(r.data.chef?._id || ''); setBartenderId(r.data.bartender?._id || ''); });
  useEffect(() => {
    if (user?.type === 'staff') Promise.all([load(), api.get('/staff', { params: { role: 'Chef' } }), api.get('/staff', { params: { role: 'Bartender' } })]).then(([,c,b]) => { setChefs(c.data); 
  setBartenders(b.data); });
  }, [id, user]);
  if (user?.type !== 'staff') return <Navigate to="/staff-login" replace/>;
  if (!order) return <main className="container page"><div className="empty">Loading order…</div></main>;
  const save = async () => {
    try { await api.patch(`/orders/${id}/assignment`, { chefId: chefId || null, bartenderId: bartenderId || null, status }); setMessage('Order updated successfully.'); load(); }
    catch (err) { setMessage(err.response?.data?.message || 'Update failed'); }
  };
  return <main className="container page narrow"><div className="order-top"><div><span className="eyebrow">Waiter workflow</span><h1>Order #{order._id.slice(-6).toUpperCase()}</h1><p className="muted">{
  order.customer.name} • Table {order.tableNumber}</p></div><span className={`status-large ${order.status.toLowerCase()}`}>{order.status}</span></div><section className="detail-card"><h2>Items</h2>{order.
  items.map(i => <div className="summary-row" key={i._id}><span>{i.quantity} × {i.nameSnapshot}</span><span>{i.prepTimeMins} min prep</span></div>)}</section><section className="form-card"><h2>Assign 
  preparation staff</h2>{user.role !== 'Waiter' && <p className="warning">This account is {user.role}. The assignment controls are intentionally restricted to Waiter accounts.</p>}<label>Chef<select value=
  {chefId} onChange={e => setChefId(e.target.value)}><option value="">Select chef</option>{chefs.map(s => <option value={s._id} key={s._id}>{s.name}</option>)}</select></label><label>Bartender<select 
  value={bartenderId} onChange={e => setBartenderId(e.target.value)}><option value="">Select bartender</option>{bartenders.map(s => <option value={s._id} key={s._id}>{s.name}</option>)}</select></label>
  <label>Order status<select value={status} onChange={e => setStatus(e.target.value)}>{['Assigned','Preparing','Ready','Delayed','Served'].map(s => <option key={s}>{s}</option>)}</select></label><button 
  disabled={user.role !== 'Waiter'} className="btn big full" onClick={save}>Save waiter update</button>{message && <div className="toast-inline">{message}</div>}</section></main>;
}
