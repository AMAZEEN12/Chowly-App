import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function RestaurantCard({ restaurant }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="restaurant-card" style={{ '--accent': restaurant.accent }}>
      <div className="restaurant-art"><span>{restaurant.name.slice(0, 2).toUpperCase()}</span></div>
      <div className="restaurant-body">
        <div className="eyebrow"><MapPin size={14}/>{restaurant.location}{restaurant.distanceKm != null && <span className="chip" style={{ marginLeft: 6 }}><Navigation size={11}/> {restaurant.distanceKm.toFixed(1)} km away</span>}</div>
        <h3>{restaurant.name}</h3>
        <p className="muted">{restaurant.cuisineTypes?.join(' • ')}</p>
        {restaurant.promoText && <div className="promo"><Sparkles size={14}/>{restaurant.promoText}</div>}
        <Link className="text-link" to={`/restaurants/${restaurant._id}`}>View menu <ArrowUpRight size={16}/></Link>
      </div>
    </motion.article>
  );
}
