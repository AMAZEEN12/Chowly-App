import { motion } from 'framer-motion';
import { ArrowRight, Clock3, CreditCard, MapPin, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  ['01', 'Discover nearby', 'Find restaurants, browse menus and compare options without the clutter.'],
  ['02', 'Know the wait', 'See estimated preparation time before and after you place an order.'],
  ['03', 'Order with confidence', 'Track your order, see who is handling it and keep the whole flow in one place.'],
  ['04', 'Pay when ready', 'Choose a saved payment method or complete the clearly labelled academic demo payment.']
];

const heroImages = {
  main: 'https://commons.wikimedia.org/wiki/Special:FilePath/A%20Nigeria%20Jollof%20Rice%20with%20chicken.jpg?width=1400',
  chicken: 'https://commons.wikimedia.org/wiki/Special:FilePath/Grilled%20chicken%20meat.jpg?width=700',
  drink: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zobo%20drink.jpg?width=700'
};

export default function LandingPage() {
  return (
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="kicker">
            <Sparkles size={16}/> Good food. Less waiting.
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .55 }}>
            Everything you love, <span>served smarter.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16, duration: .5 }}>
            Discover great restaurants, order your favourites, see the waiting time and keep the whole dining experience simple in one place.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24, duration: .5 }} className="hero-cta">
            <Link className="btn big" to="/explore">Explore restaurants <ArrowRight size={18}/></Link>
            <Link className="btn big ghost" to="/staff-login">Staff portal</Link>
          </motion.div>
          <div className="trust-row">
            <span><span className="trust-icon">✓</span> Secure account</span>
            <span><Clock3 size={15}/> Live order tracking</span>
            <span><CreditCard size={15}/> Simple checkout</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, x: 45, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: .12, duration: .65 }} className="hero-visual">
          <div className="hero-glow hero-glow-yellow" />
          <div className="hero-glow hero-glow-green" />
          <div className="hero-photo-stack">
            <img className="hero-food-image" src={heroImages.main} alt="Nigerian jollof rice with chicken" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/images/hero-food.svg'; }} />
            <div className="hero-mini-photo chicken-photo">
              <img src={heroImages.chicken} alt="Grilled chicken" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/images/menu/grilled-chicken.svg'; }} />
              <span>Grilled chicken</span>
            </div>
            <div className="hero-mini-photo drink-photo">
              <img src={heroImages.drink} alt="Zobo drink" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/images/menu/zobo.svg'; }} />
            </div>
          </div>
          <div className="hero-location-pill"><MapPin size={15}/> Restaurants near you</div>
          <div className="hero-order-pill"><Clock3 size={17}/><span><small>Order #CHW-2408</small><strong>Ready in 18 mins</strong></span><i /></div>
          <div className="hero-feature-pill"><UtensilsCrossed size={16}/><span>Fresh menus, smarter ordering</span></div>
        </motion.div>
      </section>

      <section className="container section home-section">
        <div className="section-head">
          <div><span className="eyebrow">How Chowly works</span><h2>Everything important, right when you need it.</h2></div>
          <Link className="text-link" to="/explore">Start exploring <ArrowRight size={16}/></Link>
        </div>
        <div className="feature-grid">
          {benefits.map(([n, t, d]) => (
            <div className="feature-card" key={n}>
              <span>{n}</span><h3>{t}</h3><p className="muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
