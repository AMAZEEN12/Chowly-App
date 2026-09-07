import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Edit3, ExternalLink } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const load = () => api.get('/orders/staff').then(r => setOrders(r.data));
  useEffect(() => { if (user?.type === 'staff') { load(); const t = setInterval(load, 10000); return () => clearInterval(t); } }, [user]);
  const stats = useMemo(() => ({ active: orders.filter(o => !['Paid','Cancelled'].includes(o.status)).length, delayed: orders.filter(o => o.status==='Delayed').length, served: orders.filter(o => o.status==='Served').length }), [orders]);
  if (user?.type !== 'staff') return <Navigate to="/staff-login" replace/>;
  const restaurantId = user.restaurant?._id || user.restaurant?.id;
  return <main className="container page"><div className="page-title"><span className="eyebrow">{user.restaurant?.name || 'Restaurant'} • {user.role}</span><h1>Service dashboard</h1><div className="dashboard-actions"><Link className="btn" to={restaurantId ? `/restaurant/${restaurantId}/setup` : '/staff'}><Edit3 size={17}/> Manage restaurant</Link>{restaurantId && <Link className="btn ghost" to={`/restaurants/${restaurantId}`}><ExternalLink size={17}/> View restaurant</Link>}</div></div><div className=
  "stat-grid"><div><small>Active</small><strong>{stats.active}</strong></div><div><small>Delayed</small><strong>{stats.delayed}</strong></div><div><small>Ready to settle</small><strong>{stats.served}</
  strong></div></div><div className="order-table">{orders.map(o => <Link to={`/staff/orders/${o._id}`} className="order-row" key={o._id}><div><strong>#{o._id.slice(-6).toUpperCase()}</strong><span>{o.
  customer?.name} • Table {o.tableNumber}</span></div><div><span>{o.items.reduce((s,i)=>s+i.quantity,0)} items</span><span>{o.estimatedWaitMins} min est.</span></div><span className={`status-pill ${o.
  status.toLowerCase()}`}>{o.status}</span></Link>)}</div></main>;
}
