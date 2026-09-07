import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import api from '../api/client';
import MenuItemCard from '../components/MenuItemCard';
export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [q, setQ] = useState('');
  useEffect(() => {
    Promise.all([api.get(`/restaurants/${id}`), api.get('/menu/items', { params: { restaurant: id } })])
      .then(([r, m]) => { setRestaurant(r.data); setItems(m.data); });
  }, [id]);
  const shown = useMemo(() => items.filter(i => (category === 'All' || i.category === category) && i.name.toLowerCase().includes(q.toLowerCase())), [items, category, q]);
  if (!restaurant) return <main className="container page"><div className="empty">Loading menu…</div></main>;
  return <main className="container page">
    <section className="restaurant-hero" style={{ '--accent': restaurant.accent }}>
      <img className="restaurant-hero-image" src={restaurant.imageUrl || 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20Nigeria%20Jollof%20Rice%20with%20chicken.jpg?width=1600'} alt="" aria-hidden="true" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/images/restaurant-cover.svg'; }} />
      <div className="restaurant-hero-copy"><span className="eyebrow">{restaurant.location}</span><h1>{restaurant.name}</h1><p>{restaurant.cuisineTypes?.join(' • ')}</p></div>
      <div className="promo-big"><Sparkles/>{restaurant.promoText || 'Fresh menu available now'}<small>{restaurant.cashbackPercent}% demo cashback badge</small></div>
    </section>
    <div className="menu-toolbar">
      <div className="tabs">{['All','Food','Drink'].map(x => <button key={x} className={category === x ? 'active' : ''} onClick={() => setCategory(x)}>{x}</button>)}</div>
      <label className="search-box compact"><Search/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search this menu"/></label>
    </div>
    <div className="menu-grid">{shown.map(item => <MenuItemCard key={item._id} item={item}/>)}</div>
  </main>;
}
