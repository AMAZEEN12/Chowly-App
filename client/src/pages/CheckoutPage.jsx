import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState('12');
  const [notes, setNotes] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setBusy(true); setError('');
    try {
      const payload = {
        restaurantId: cart.restaurant._id,
        items: cart.items.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
        tableNumber, notes,
        orderType: scheduled ? 'Scheduled' : 'Dine-In',
        scheduledFor: scheduled ? scheduledFor : null
      };
      const order = (await api.post('/orders', payload)).data;
      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (err) { setError(err.response?.data?.message || 'Could not place order'); }
    finally { setBusy(false); }
  };
  if (!cart.items.length) return <main className="container page"><div className="empty">Your cart is empty.</div></main>;
  return <main className="container page narrow">
    <div className="page-title"><span className="eyebrow">Checkout</span><h1>Confirm your dining order.</h1><p className="muted">Payment happens later, after the order is served.</p></div>
    <div className="form-card">
      <label>Table number<input value={tableNumber} onChange={e => setTableNumber(e.target.value)} /></label>
      <label className="toggle-line"><input type="checkbox" checked={scheduled} onChange={e => setScheduled(e.target.checked)}/><span>Schedule this order before arriving</span></label>
      {scheduled && <label>Scheduled time<input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} /></label>}
      <label>Kitchen notes<textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="No onions, allergy note, etc."/></label>
      <div className="summary-row"><span>Total</span><strong>₦{total.toLocaleString()}</strong></div>
      {error && <p className="error">{error}</p>}
      <button disabled={busy || (scheduled && !scheduledFor)} className="btn big full" onClick={submit}>{busy ? 'Placing order…' : 'Place order'}</button>
    </div>
  </main>;
}
