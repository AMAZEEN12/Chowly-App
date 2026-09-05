import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
export default function CartPage() {
  const { cart, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!cart.items.length) return <main className="container page"><div className="empty"><h2>Your cart is empty.</h2><Link className="btn" to="/explore">Explore restaurants</Link></div></main>;
  const goCheckout = () => {
    if (user?.type !== 'customer') return navigate('/login', { state: { from: '/checkout' } });
    navigate('/checkout');
  };
  return <main className="container page narrow">
    <div className="page-title"><span className="eyebrow">Your cart</span><h1>{cart.restaurant?.name}</h1></div>
    <div className="stack">{cart.items.map(item => <div className="cart-line" key={item._id}>
      <div><h3>{item.name}</h3><p className="muted">₦{Math.round(item.price * (1 - (item.discountPercent || 0)/100)).toLocaleString()} each</p></div>
      <div className="qty"><button onClick={() => updateQuantity(item._id, item.quantity-1)}><Minus size={15}/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item._id, item.
  quantity+1)}><Plus size={15}/></button></div>
      <button className="icon-btn danger" onClick={() => removeItem(item._id)}><Trash2 size={17}/></button>
    </div>)}</div>
    <div className="checkout-bar"><div><small>Estimated food total</small><strong>₦{total.toLocaleString()}</strong></div><button className="btn big" onClick={goCheckout}>Continue to checkout</button></
  div>
  </main>;
}
