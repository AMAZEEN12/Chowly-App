import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get('/orders/mine').then(r => setOrders(r.data)); }, []);
  return <main className="container page"><div className="page-title"><span className="eyebrow">Order history</span><h1>Your dining trail.</h1></div><div className="history-grid">{orders.map(o => <Link 
  className="history-card" to={`/orders/${o._id}`} key={o._id}><div><span className="eyebrow">{o.restaurant.name}</span><h3>₦{o.grandTotal.toLocaleString()}</h3><p className="muted">{new Date(o.createdAt).
  toLocaleString()}</p></div><span className={`status-pill ${o.status.toLowerCase()}`}>{o.status}</span></Link>)}</div></main>;
}
