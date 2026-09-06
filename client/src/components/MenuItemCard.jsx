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
      <div className={`menu-image ${item.category.toLowerCase()}`}>
        <img
          src={item.imageUrl || ({
    'Fried Rice': 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried%20rice%20and%20chicken%20garnished%20with%20sweet%20corn%2C%20carrot%20and%20green%20peas.jpg',
    'Grilled Chicken': 'https://www.nairaland.com/attachments/8463343_dsc6578_jpeg91cd1fd274125a9f2772336a67e4286a',
    'Malt': 'https://static.wixstatic.com/media/667e45_8b47ea44df524cb6a078ff336db69eee~mv2.png/v1/fill/w_980,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/667e45_8b47ea44df524cb6a078ff336db69eee~mv2.png',
    'Chapman': 'https://jehancancook.com/wp-content/uploads/2018/08/chapman-3.jpg',
    'Jollof Rice': 'https://flawlessfood.co.uk/wp-content/uploads/2023/01/Jollof-Rice-04.jpg',
    'Pounded Yam & Egusi': 'https://harambeeafrica.com/wp-content/uploads/2024/04/Yam-Egusi-Soup.jpg',
    'Zobo': 'https://commons.wikimedia.org/wiki/Special:FilePath/Chilled_Zobo_drink.jpg',
    'Suya Platter': 'https://i.etsystatic.com/25033905/r/il/3b57df/4774513273/il_1588xN.4774513273_dh0z.jpg',
    'Palm Wine': 'https://seeafricatoday.com/wp-content/uploads/2022/10/Palm-wine-1140x1140.jpg',
    'Catfish Pepper Soup': 'https://allnigerianfoods.com/wp-content/uploads/catfish-pepper-soup-recipe.jpg',
    'Grilled Fish': 'https://ocdn.eu/pulscms-transforms/1/LOgk9kpTURBXy8yNDA3YTUzMzNkNzcyZGU2YTJlZTA4ZDIyMmE0YTM1My5qcGeQgaEwAA',
    'Sparkling Water': 'https://product.hstatic.net/200000909439/product/8002270011023500_650x_1975e97bff7342a5af0a9ca635ca36c1_grande.png',
    'Mocktail': 'https://goodemma.com/wp-content/uploads/Flavorful-non-alcoholic-cocktails.jpg',
  }[item.name] || '')}
          alt={item.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.style.visibility = 'hidden';
          }}
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
