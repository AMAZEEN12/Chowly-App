import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, UtensilsCrossed } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link className="brand footer-logo" to="/">
            <span className="brand-mark">C</span>
            <span>Chowly</span>
          </Link>
          <p>Order food, track your wait and enjoy a smoother dining experience.</p>
          <div className="footer-socials">
            <a href="mailto:hello@chowly.app" aria-label="Email Chowly"><Mail size={17} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Chowly on Instagram"><Instagram size={17} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <Link to="/explore">Restaurants</Link>
          <Link to="/cart">Your cart</Link>
          <Link to="/orders">My orders</Link>
        </div>

        <div className="footer-links-group">
          <h4>For restaurants</h4>
          <Link to="/restaurant/register">List your restaurant <ArrowUpRight size={14} /></Link>
          <Link to="/restaurant/apply">Restaurant application</Link>
          <Link to="/staff-login"><UtensilsCrossed size={14} /> Staff portal</Link>
        </div>

        <div className="footer-note">
          <span className="footer-pill">Made for better dining</span>
          <p>Payments in this academic project are simulated and clearly labelled as demo transactions.</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Chowly. All rights reserved.</span>
        <span>Built with the MERN stack.</span>
      </div>
    </footer>
  );
}
