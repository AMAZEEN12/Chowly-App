import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserRound, UtensilsCrossed, LogOut, Cake } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };
  return (
    <header className="nav-wrap">
      <nav className="nav container">
        <Link className="brand" to="/"><span className="brand-mark">C</span><span>Chowly</span></Link>
        <div className="nav-links">
          <NavLink to="/explore">Explore</NavLink>
          {user?.type === 'customer' && <NavLink to="/orders">My orders</NavLink>}
          {user?.type === 'customer' && (
            <NavLink to="/profile">
              Profile{user.isBirthdayToday && <Cake size={14} style={{ marginLeft: 4 }} />}
            </NavLink>
          )}
          {user?.type === 'staff' && <NavLink to="/staff">Staff dashboard</NavLink>}
          <NavLink to="/restaurant/apply">For restaurants</NavLink>
        </div>
        <div className="nav-actions">
          <Link className="icon-btn" to="/cart" aria-label="Cart"><ShoppingBag size={18}/><span>{count}</span></Link>
          {!user ? <Link className="btn small ghost" to="/login"><UserRound size={17}/> Sign in</Link> : (
            <button className="btn small ghost" onClick={handleLogout}><LogOut size={17}/> {user.name.split(' ')[0]}</button>
          )}
          <Link className="btn small" to={user?.type === 'staff' ? '/staff' : '/staff-login'}><UtensilsCrossed size={17}/> Staff</Link>
        </div>
      </nav>
    </header>
  );
}
