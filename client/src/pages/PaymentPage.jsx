import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
export default function PaymentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('Demo Card');
  const [tipAmount, setTipAmount] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data)); }, [id]);
  if (user?.type !== 'customer') return <Navigate to="/login" replace/>;
  if (!order) return <main className="container page"><div className="empty">Loading payment…</div></main>;
  const pay = async () => {
    setError('');
    try { await api.post('/payments', { orderId: order._id, method, tipAmount: Number(tipAmount), tipStaffId: order.waiter?._id || null }); navigate(`/orders/${order._id}`); }
    catch (err) { setError(err.response?.data?.message || 'Payment failed'); }
  };
  return <main className="container page narrow"><div className="page-title"><span className="eyebrow">Pretend payment</span><h1>Settle before you exit.</h1><p className="warning"><ShieldCheck/> This is a 
  simulated academic payment. No real money or bank credentials are processed.</p></div><section className="form-card"><div className="summary-row grand"><span>Order total</span><strong>₦{order.grandTotal.
  toLocaleString()}</strong></div><label>Payment method<select value={method} onChange={e => setMethod(e.target.value)}>{['Demo Card','Demo Bank Transfer','Chowly Wallet','Apple Pay Demo','Google Pay Demo'].map(m => <option key={m}>{m}</option>)}</select></label><label>Tip for staff (optional)<input type="number" min="0" step="100" value={tipAmount} onChange={e => setTipAmount(e.target.value)}/></
  label><div className="summary-row"><span>Demo amount to record</span><strong>₦{(order.grandTotal + Number(tipAmount || 0)).toLocaleString()}</strong></div>{error && <p className="error">{error}</p>
  }<button className="btn big full" onClick={pay}>Record pretend payment</button></section></main>;
}
