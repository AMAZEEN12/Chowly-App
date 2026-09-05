import { motion } from 'framer-motion';
import { ArrowRight, Clock3, CreditCard, Search, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function LandingPage() {
  return (
    <main>
      <section className="hero container">
        <div className="orb one"/><div className="orb two"/>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="hero-copy">
          <span className="kicker"><Sparkles size={16}/> Your table, upgraded.</span>
          <h1>Order. Track. Enjoy. <span>Leave the waiting to Chowly.</span></h1>
          <p>Browse restaurants, discover food and drinks, see live waiting time, track your order and complete a clearly labelled demo payment — all from one vibrant dining experience.</p>
          <div className="hero-cta"><Link className="btn big" to="/explore">Explore restaurants <ArrowRight/></Link><Link className="btn big ghost" to="/staff-login">Staff portal</Link></div>
          <div className="trust-row"><span>⚡ Real database</span><span>📜 Order history</span><span>🗓️ Scheduled orders</span></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15, duration: .6 }} className="hero-panel">
          <div className="mini-search"><Search size={18}/><span>Search “Jollof Rice”</span></div>
          <div className="demo-order-card">
            <div className="row between"><div><small>ORDER #CHW-2408</small><h3>Table 12</h3></div><span className="status-pill">Preparing</span></div>
            <div className="big-wait">18 <small>min</small></div>
            <div className="progress"><span style={{ width: '68%' }}/></div>
            <div className="row between muted"><span>Waiter: Tolu</span><span>Chef: Rachel</span></div>
          </div>
          <div className="floating-cards"><div><Clock3/> Live wait</div><div><CreditCard/> Fast Payments</div><div><UtensilsCrossed/> Staff view</div></div>
        </motion.div>
      </section>
      <section className="container section">
        <div className="section-head"><div><span className="eyebrow">Designed around the assignment story</span><h2>Every required step is visible in the UI.</h2></div></div>
        <div className="feature-grid">
          {[
            ['01', 'Browse & discover', 'Choose a restaurant, search food/drinks and see promotions.'],
            ['02', 'Place & track', 'Add to cart, place the order and view estimated waiting time.'],
            ['03', 'Waiter workflow', 'A waiter records chef/bartender and advances the order to served.'],
            ['04', 'Feedback & payment', 'Delayed customers can complain/rate, then make a pretend payment after service.']
          ].map(([n, t, d]) => <div className="feature-card" key={n}><span>{n}</span><h3>{t}</h3><p className="muted">{d}</p></div>)}
        </div>
      </section>
    </main>
  );
}
