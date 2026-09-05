import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

const emptyItem = { name: '', description: '', category: 'Food', price: '', prepTimeMins: '', discountPercent: 0, isAlcoholic: false, imageUrl: '' };
const emptyStaff = { name: '', email: '', password: '', role: 'Waiter', salary: '' };


// Compress uploaded images before sending them to the API. The menu card itself
// controls the displayed dimensions, so the restaurant owner never has to crop
// or choose a pixel size.
async function prepareMenuImage(file) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Please choose an image smaller than 12MB.');

  const bitmap = await createImageBitmap(file);
  const maxWidth = 1400;
  const maxHeight = 1000;
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function RestaurantSetupPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [itemError, setItemError] = useState('');
  const [staffError, setStaffError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyManageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  const handleItemImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await prepareMenuImage(file);
      setItemForm(prev => ({ ...prev, imageUrl }));
      setItemError('');
    } catch (err) {
      setItemError(err.message || 'Could not prepare that image');
      e.target.value = '';
    }
  };

  const load = async () => {
    const [{ data: r }, { data: i }, { data: s }] = await Promise.all([
      api.get(`/restaurants/${id}`),
      api.get('/menu/items/all', { params: { restaurant: id } }),
      api.get('/staff/setup', { params: { restaurant: id } })
    ]);
    setRestaurant(r); setItems(i); setStaff(s); setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    setItemError('');
    try {
      await api.post('/menu/items', { ...itemForm, restaurant: id });
      setItemForm(emptyItem);
      load();
    } catch (err) { setItemError(err.response?.data?.message || 'Could not add that menu item'); }
  };

  const removeItem = async (itemId) => { await api.delete(`/menu/items/${itemId}`); load(); };

  const addStaff = async (e) => {
    e.preventDefault();
    setStaffError('');
    try {
      await api.post('/staff/setup', { ...staffForm, restaurant: id });
      setStaffForm(emptyStaff);
      load();
    } catch (err) { setStaffError(err.response?.data?.message || 'Could not add that staff member'); }
  };

  const publish = async () => {
    const { data } = await api.patch(`/restaurants/${id}`, { isActive: true });
    setRestaurant(data);
    setStatus('Restaurant is live — customers can find and order from it on Explore now.');
  };

  if (loading || !restaurant) return <main className="container page"><p className="muted">Loading…</p></main>;

  return <main className="container page">
    <div className="page-title">
      <span className="eyebrow">Restaurant setup • {restaurant.isActive ? 'Live' : 'Draft'}</span>
      <h1>{restaurant.name}</h1>
      <p className="muted">
        {restaurant.isActive
          ? 'Live — customers can browse and order here. You can still add more items and staff below.'
          : 'Not visible on Explore yet. Add at least one menu item, then publish when ready.'}
      </p>
      <p className="muted small-text">
        There's no owner login, so this page's link is the only way back in to manage {restaurant.name} —{' '}
        <button type="button" className="text-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={copyManageLink}>
          {linkCopied ? 'Copied!' : 'copy this link'}
        </button> and bookmark it.
        {' '}Want to see it the way customers do? <Link className="text-link" to={`/restaurants/${id}`}>Preview as a customer</Link> (that page is for ordering, not managing).
      </p>
    </div>

    <div className="detail-card" style={{ marginBottom: 24 }}>
      <h2>Menu items</h2>
      <form className="form-stack" onSubmit={addItem}>
        <label>Name<input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required/></label>
        <label>Category
          <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })}>
            <option>Food</option><option>Drink</option>
          </select>
        </label>
        <label>Price (₦)<input type="number" min="0" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} required/></label>
        <label>Prep time (mins)<input type="number" min="1" value={itemForm.prepTimeMins} onChange={e => setItemForm({ ...itemForm, prepTimeMins: e.target.value })} required/></label>
        <label>Discount % (optional)<input type="number" min="0" max="100" value={itemForm.discountPercent} onChange={e => setItemForm({ ...itemForm, discountPercent: e.target.value })}/></label>
        <label>Description (optional)<textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })}/></label>
        <div className="image-upload">
          <label className="upload-label">
            Menu image (optional)
            <input type="file" accept="image/*" onChange={handleItemImage} />
            <span>Choose a food photo. It will automatically fit the same menu-card size as every other item.</span>
          </label>
          {itemForm.imageUrl && (
            <div className="upload-preview">
              <img src={itemForm.imageUrl} alt="Menu preview" />
              <button type="button" className="btn small ghost" onClick={() => setItemForm(prev => ({ ...prev, imageUrl: '' }))}>Remove image</button>
            </div>
          )}
        </div>
        <label><input type="checkbox" checked={itemForm.isAlcoholic} onChange={e => setItemForm({ ...itemForm, isAlcoholic: e.target.checked })} style={{ width: 'auto', marginRight: 8 }}/>Alcoholic (18+ only)</label>
        {itemError && <p className="error">{itemError}</p>}
        <button className="btn">Add menu item</button>
      </form>
      {items.length > 0 && <ul style={{ marginTop: 16, paddingLeft: 18 }}>
        {items.map(it => <li key={it._id} className="menu-admin-item">
          <div className="menu-admin-item-info">
            <img
              src={it.imageUrl || ({
                'Zobo': 'https://commons.wikimedia.org/wiki/Special:FilePath/Chilled_Zobo_drink.jpg',
                'Chapman': 'https://i.pinimg.com/736x/81/a4/cc/81a4cc8d14614b2e699ee3896cc59c23.jpg',
                'Palm Wine': 'https://www.nairaland.com/attachments/5037988_palmwine_jpegb65231f7d6af6f0d7dc0dbd47e3269c2',
                'Malt': 'https://static.wixstatic.com/media/667e45_8b47ea44df524cb6a078ff336db69eee~mv2.png/v1/fill/w_980,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/667e45_8b47ea44df524cb6a078ff336db69eee~mv2.png'
              }[it.name] || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80')}
              alt={it.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = it.category === 'Food'
                  ? 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80'
                  : 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=300&q=80';
              }}
            />
            <div>
              <strong>{it.name}</strong>
              <div className="muted small-text">{it.category} — ₦{it.price} — {it.prepTimeMins} min{it.isAlcoholic ? ' — 18+' : ''}</div>
            </div>
          </div>
          <button className="btn small ghost" onClick={() => removeItem(it._id)}>Remove</button>
        </li>)}
      </ul>}
      {!items.length && <p className="muted small-text" style={{ marginTop: 12 }}>No menu items yet.</p>}
    </div>

    <div className="detail-card" style={{ marginBottom: 24 }}>
      <h2>Staff</h2>
      <form className="form-stack" onSubmit={addStaff}>
        <label>Name<input value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} required/></label>
        <label>Email<input type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} required/></label>
        <label>Password<input type="password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} required/></label>
        <label>Role
          <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}>
            <option>Waiter</option><option>Chef</option><option>Bartender</option>
          </select>
        </label>
        <label>Salary (optional)<input type="number" min="0" value={staffForm.salary} onChange={e => setStaffForm({ ...staffForm, salary: e.target.value })}/></label>
        {staffError && <p className="error">{staffError}</p>}
        <button className="btn">Add staff member</button>
      </form>
      {staff.length > 0 && <ul style={{ marginTop: 16, paddingLeft: 18 }}>
        {staff.map(s => <li key={s._id} style={{ marginBottom: 6 }}><strong>{s.name}</strong> — {s.role} — {s.email}</li>)}
      </ul>}
      {!staff.length && <p className="muted small-text" style={{ marginTop: 12 }}>No staff added yet.</p>}
      <p className="muted small-text" style={{ marginTop: 12 }}>Staff log in at <Link className="text-link" to="/staff-login">the staff portal</Link> with the email and password set above.</p>
    </div>

    {!restaurant.isActive && (
      <button className="btn big full" onClick={publish} disabled={!items.length} title={!items.length ? 'Add at least one menu item first' : ''}>
        Publish restaurant
      </button>
    )}
    {status && <p className="toast-inline" style={{ marginTop: 12 }}>{status}</p>}
  </main>;
}
