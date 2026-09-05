import { useEffect, useMemo, useState } from 'react';
import { Search, LocateFixed } from 'lucide-react';
import api from '../api/client';
import RestaurantCard from '../components/RestaurantCard';
import { distanceKm } from '../utils/geo';
export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try { setRestaurants((await api.get('/restaurants', { params: { q } })).data); }
      finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  // Location feature: find the restaurants nearest to the customer's
  // current position, using the browser's own geolocation.
  function findNearMe() {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported on this device/browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError('Could not get your location — check your browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  const withDistance = useMemo(() => {
    const list = restaurants.map((r) => ({
      ...r,
      distanceKm: myLocation ? distanceKm(myLocation.lat, myLocation.lng, r.latitude, r.longitude) : null
    }));
    if (myLocation) list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return list;
  }, [restaurants, myLocation]);

  return <main className="container page">
    <div className="page-title"><span className="eyebrow">Discover</span><h1>Pick your restaurant.</h1><p className="muted">Search by restaurant, location or cuisine, or find the one nearest you. Promotions are shown directly on each 
  card.</p></div>
    <div className="row gap" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
      <label className="search-box"><Search/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search restaurants, cities or cuisines"/></label>
      <button className="btn small ghost" onClick={findNearMe} disabled={locating}>
        <LocateFixed size={16}/> {locating ? 'Locating…' : myLocation ? 'Update my location' : 'Find nearest to me'}
      </button>
    </div>
    {locationError && <p className="error">{locationError}</p>}
    {loading ? <div className="empty">Loading restaurants…</div> : <div className="restaurant-grid">{withDistance.map(r => <RestaurantCard key={r._id} restaurant={r}/>)}</div>}
  </main>;
}
