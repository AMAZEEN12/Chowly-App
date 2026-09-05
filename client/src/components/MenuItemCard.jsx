import { motion } from 'framer-motion';
import { Clock3, Plus, BadgePercent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const salePrice = Math.round(item.price * (1 - (item.discountPercent || 0) / 100));

  // Age-verification feature: block adding an alcoholic item in the UI
  // itself, with a clear reason. The real enforcement still happens
  // server-side in order.controller.js when the order is submitted.
  const isBlockedByAge = item.isAlcoholic && (user?.age == null || user.age < 18);

  function handleAdd() {
    if (isBlockedByAge) {
      if (!user) {
        alert('Sign in and add your date of birth to your profile to order alcoholic drinks (18+).');
      } else if (user.age == null) {
        alert('Add your date of birth in your profile before ordering an alcoholic drink (18+).');
      } else {
        alert('You must be 18 or older to order an alcoholic drink.');
      }
      return;
    }
    addItem(item);
  }

  return (
    <motion.article layout whileHover={{ y: -4 }} className="menu-card">
      <div className={`menu-icon ${item.category.toLowerCase()}`}>{item.category === 'Food' ? '🍽️' : '🥤'}</div>
      <div className="menu-card-content">
        <div className="row between gap">
          <div><span className="chip">{item.category}</span>{item.featured && <span className="chip lime">Popular</span>}{item.isAlcoholic && <span className="chip" title="Alcoholic — 18+ only">🔞 18+</span>}</div>
          <span className="prep"><Clock3 size={14}/>{item.prepTimeMins} min</span>
        </div>
        <h3>{item.name}</h3>
        <p className="muted clamp-2">{item.description}</p>
        <div className="row between gap bottom-line">
          <div className="price-block">
            {item.discountPercent > 0 && <span className="old-price">₦{item.price.toLocaleString()}</span>}
            <strong>₦{salePrice.toLocaleString()}</strong>
            {item.discountPercent > 0 && <span className="discount"><BadgePercent size={13}/>{item.discountPercent}%</span>}
          </div>
          <button className="round-add" onClick={handleAdd} aria-label={`Add ${item.name}`} title={isBlockedByAge ? 'Age verification required' : undefined}><Plus/></button>
        </div>
      </div>
    </motion.article>
  );
}
