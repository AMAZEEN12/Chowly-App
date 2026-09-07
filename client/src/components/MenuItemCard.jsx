import { motion } from 'framer-motion';
import { Clock3, Plus, BadgePercent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const localImages = {
  'Fried Rice': '/images/menu/fried-rice.svg',
  'Grilled Chicken': '/images/menu/grilled-chicken.svg',
  'Malt': '/images/menu/malt.svg',
  'Chapman': '/images/menu/chapman.svg',
  'Jollof Rice': '/images/menu/jollof-rice.svg',
  'Pounded Yam & Egusi': '/images/menu/pounded-yam-egusi.svg',
  'Zobo': '/images/menu/zobo.svg',
  'Suya Platter': '/images/menu/suya-platter.svg',
  'Palm Wine': '/images/menu/palm-wine.svg',
  'Catfish Pepper Soup': '/images/menu/catfish-pepper-soup.svg',
  'Grilled Fish': '/images/menu/grilled-fish.svg',
  'Sparkling Water': '/images/menu/sparkling-water.svg',
  'Mocktail': '/images/menu/mocktail.svg'
};

// Real food/drink photography from Wikimedia Commons and established food sites.
// A local SVG fallback is kept for resilience if a third-party image is unavailable.
const realImages = {
  'Fried Rice': 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried%20rice%20and%20chicken%20garnished%20with%20sweet%20corn%2C%20carrot%20and%20green%20peas.jpg?width=1200',
  'Grilled Chicken': 'https://commons.wikimedia.org/wiki/Special:FilePath/Grilled%20chicken%20meat.jpg?width=1200',
  'Malt': 'https://commons.wikimedia.org/wiki/Special:FilePath/Guinness%20Malta.jpg?width=1200',
  'Chapman': 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20glass%20of%20Chapman.jpg?width=1200',
  'Jollof Rice': 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20Nigeria%20Jollof%20Rice%20with%20chicken.jpg?width=1200',
  'Pounded Yam & Egusi': 'https://commons.wikimedia.org/wiki/Special:FilePath/Pounded%20yam%20and%20Egusi%20soup.jpg?width=1200',
  'Zobo': 'https://commons.wikimedia.org/wiki/Special:FilePath/Zobo%20drink.jpg?width=1200',
  'Suya Platter': 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian%20home%20made%20suya%20and%20sliced%20onions.png?width=1200',
  'Palm Wine': 'https://commons.wikimedia.org/wiki/Special:FilePath/Fresh%20Palm%20Wine.jpg?width=1200',
  'Catfish Pepper Soup': 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian%20prepared%20Pepper-Soup.jpg?width=1200',
  'Grilled Fish': 'https://commons.wikimedia.org/wiki/Special:FilePath/Grilled%20fish%20in%20Northern%20Nigeria.jpg?width=1200',
  'Sparkling Water': 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20plastic%20bottle%20water.jpg?width=1200',
  'Mocktail': 'https://commons.wikimedia.org/wiki/Special:FilePath/Assorted%20Mocktails.jpg?width=1200'
};

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const salePrice = Math.round(item.price * (1 - (item.discountPercent || 0) / 100));
  const isBlockedByAge = item.isAlcoholic && (user?.age == null || user.age < 18);

  const candidates = [item.imageUrl, realImages[item.name], localImages[item.name], '/images/menu/jollof-rice.svg'].filter(Boolean);

  function handleImageError(event) {
    const currentIndex = Number(event.currentTarget.dataset.imageIndex || 0);
    const nextIndex = currentIndex + 1;
    if (nextIndex < candidates.length) {
      event.currentTarget.dataset.imageIndex = String(nextIndex);
      event.currentTarget.src = candidates[nextIndex];
    }
  }

  function handleAdd() {
    if (isBlockedByAge) {
      if (!user) alert('Sign in and add your date of birth to your profile to order alcoholic drinks (18+).');
      else if (user.age == null) alert('Add your date of birth in your profile before ordering an alcoholic drink (18+).');
      else alert('You must be 18 or older to order an alcoholic drink.');
      return;
    }
    addItem(item);
  }

  return (
    <motion.article layout whileHover={{ y: -5 }} className="menu-card">
      <div className={`menu-image ${item.category.toLowerCase()}`}>
        <img
          src={candidates[0]}
          data-image-index="0"
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      </div>
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
