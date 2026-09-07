import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const restaurantPhoto = 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20Nigeria%20Jollof%20Rice%20with%20chicken.jpg?width=1200';

export default function RestaurantCard({ restaurant }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="restaurant-card" style={{ '--accent': restaurant.accent }}>
      <div className="restaurant-art">
        <img src={restaurant.imageUrl || restaurantPhoto} alt={`${restaurant.name} restaurant food`} loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/images/restaurant-cover.svg'; }} />
        <div className="restaurant-badge">{restaurant.cuisineTypes?.[0] || 'Restaurant'}</div>
      </div>
      <div className="restaurant-body">
        <div className="eyebrow"><MapPin size={14}/>{restaurant.location}{restaurant.distanceKm != null && <span className="chip distance-chip"><Navigation size={11}/> {restaurant.distanceKm.toFixed(1)} km</span>}</div>
        <h3>{restaurant.name}</h3>
        <p className="muted">{restaurant.cuisineTypes?.join(' • ')}</p>
        {restaurant.promoText && <div className="promo"><Sparkles size={14}/>{restaurant.promoText}</div>}
        <Link className="text-link" to={`/restaurants/${restaurant._id}`}>View menu <ArrowUpRight size={16}/></Link>
      </div>
    </motion.article>
  );
}
