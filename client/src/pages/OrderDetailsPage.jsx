import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock3, MessageSquareWarning, Star, WalletCards } from 'lucide-react';
import api from '../api/client';
import OrderTimeline from '../components/OrderTimeline';
import { useAuth } from '../context/AuthContext';
export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [complaint, setComplaint] = useState('My order has exceeded the estimated waiting time.');
  const [rating, setRating] = useState(1);
  const [message, setMessage] = useState('');
  const load = () => api.get(`/orders/${id}`).then(r => setOrder(r.data));
  useEffect(() => { load(); const timer = setInterval(load, 15000); return () => clearInterval(timer); }, [id]);
  if (!order) return <main className="container page"><div className="empty">Loading order…</div></main>;
  const sendComplaint = async () => {
    try { await api.post('/complaints', { orderId: order._id, description: complaint }); setMessage('Complaint saved against this order.'); load(); }
    catch (err) { setMessage(err.response?.data?.message || 'Complaint failed'); }
  };
  const sendRating = async () => {
    try { await api.put('/ratings', { orderId: order._id, value: Number(rating), comment: rating <= 2 ? 'Delay affected my experience.' : 'Service completed.' }); setMessage('Rating saved.'); }
    catch (err) { setMessage(err.response?.data?.message || 'Rating failed'); }
  };
  return <main className="container page narrow">
    <div className="order-top"><div><span className="eyebrow">Order {order._id.slice(-6).toUpperCase()}</span><h1>{order.restaurant.name}</h1><p className="muted">Table {order.tableNumber} • {new Date(
  order.createdAt).toLocaleString()}</p></div><div className={`status-large ${order.status.toLowerCase()}`}>{order.status}</div></div>
    <section className="wait-card"><Clock3/><div><small>Estimated waiting time</small><strong>{order.estimatedWaitMins} minutes</strong><span>Actual: {order.actualWaitMins ?? 'Still in progress'}</span></
  div></section>
    <OrderTimeline status={order.status}/>
    <section className="detail-card"><h2>Order details</h2>{order.items.map(i => <div className="summary-row" key={i._id}><span>{i.quantity} × {i.nameSnapshot}</span><strong>₦{(i.unitPrice*i.quantity).
  toLocaleString()}</strong></div>)}<hr/><div className="summary-row"><span>Discount</span><strong>-₦{order.discountTotal.toLocaleString()}</strong></div><div className="summary-row grand"><span>Total</
  span><strong>₦{order.grandTotal.toLocaleString()}</strong></div></section>
    <section className="people-grid"><div><small>Waiter</small><strong>{order.waiter?.name || 'Assigning…'}</strong></div><div><small>Chef</small><strong>{order.chef?.name || 'Pending'}</strong></div><div>
  <small>Bartender</small><strong>{order.bartender?.name || 'Pending'}</strong></div></section>
    {user?.type === 'customer' && order.status === 'Delayed' && <section className="detail-card danger-panel"><h2><MessageSquareWarning/> Delay feedback</h2><label>Complaint<textarea value={complaint} 
  onChange={e => setComplaint(e.target.value)}/></label><button className="btn" onClick={sendComplaint}>Submit complaint</button><div className="rating-row"><Star/><span>Rating</span><select value={
  rating} onChange={e => setRating(e.target.value)}>{[1,2,3,4,5].map(v => <option key={v}>{v}</option>)}</select><button className="btn ghost" onClick={sendRating}>Save rating</button></div></section>}
    {user?.type === 'customer' && ['Served','Paid'].includes(order.status) && <section className="detail-card"><h2><Star/> Rate your order</h2><div className="rating-row"><select value={rating} onChange={
  e => setRating(e.target.value)}>{[1,2,3,4,5].map(v => <option key={v}>{v}</option>)}</select><button className="btn ghost" onClick={sendRating}>Save rating</button></div></section>}
    {user?.type === 'customer' && order.status === 'Served' && <Link className="btn big full payment-cta" to={`/orders/${order._id}/pay`}><WalletCards/> Make pretend payment before exit</Link>}
    {message && <div className="toast-inline">{message}</div>}
  </main>;
}
