import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserRound, UtensilsCrossed, LogOut, Cake, Moon, Sun } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('chowly-theme') === 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('chowly-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => { logout(); navigate('/'); };
  return (
    <header className="nav-wrap">
      <nav className="nav container">
        <Link className="brand" to="/"><span className="brand-mark">C</span><span>Chowly</span></Link>
        <div className="nav-links">
          <NavLink to="/explore">Explore</NavLink>
          {user?.type === 'customer' && <NavLink to="/orders">My orders</NavLink>}
          {user?.type === 'customer' && <NavLink to="/profile">Profile{user.isBirthdayToday && <Cake size={14} style={{ marginLeft: 4 }} />}</NavLink>}
          {user?.type === 'staff' && <NavLink to="/staff">Staff dashboard</NavLink>}
          <NavLink to="/restaurant/register">List your restaurant</NavLink>
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={() => setDark(v => !v)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <Sun size={17}/> : <Moon size={17}/>}<span>{dark ? 'Light' : 'Dark'}</span>
          </button>
          <Link className="icon-btn" to="/cart" aria-label="Cart"><ShoppingBag size={18}/><span>{count}</span></Link>
          {!user ? <Link className="btn small ghost" to="/login"><UserRound size={17}/> Sign in</Link> : <button className="btn small ghost" onClick={handleLogout}><LogOut size={17}/> {user.name.split(' ')[0]}</button>}
          <Link className="btn small" to={user?.type === 'staff' ? '/staff' : '/staff-login'}><UtensilsCrossed size={17}/> Staff</Link>
        </div>
      </nav>
    </header>
  );
}
