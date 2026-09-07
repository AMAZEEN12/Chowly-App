import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Edit3, Eye, Image, Plus, Save, Trash2, X } from 'lucide-react';
import api from '../api/client';
import PasswordInput from '../components/PasswordInput';

const emptyItem = { name: '', description: '', imageUrl: '', category: 'Food', price: '', prepTimeMins: '', discountPercent: 0, isAlcoholic: false, availability: true, featured: false };
const emptyStaff = { name: '', email: '', password: '', role: 'Waiter', salary: '' };
const emptyRestaurant = { name: '', location: '', phone: '', email: '', imageUrl: '', cuisineTypes: '', promoText: '', cashbackPercent: 0, accent: '#ff7a00', bankName: '', bankAccountName: '', bankAccountNumber: '' };

export default function RestaurantSetupPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [itemError, setItemError] = useState('');
  const [staffError, setStaffError] = useState('');
  const [restaurantError, setRestaurantError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const load = async () => {
    try {
      const [{ data: r }, { data: i }, { data: s }] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get('/menu/items/all', { params: { restaurant: id } }),
        api.get('/staff/setup', { params: { restaurant: id } })
      ]);
      setRestaurant(r);
      setRestaurantForm({
        name: r.name || '', location: r.location || '', phone: r.phone || '', email: r.email || '', imageUrl: r.imageUrl || '',
        cuisineTypes: (r.cuisineTypes || []).join(', '), promoText: r.promoText || '', cashbackPercent: r.cashbackPercent ?? 0,
        accent: r.accent || '#ff7a00', bankName: r.bankName || '', bankAccountName: r.bankAccountName || '', bankAccountNumber: r.bankAccountNumber || ''
      });
      setItems(i); setStaff(s); setLoading(false);
    } catch (err) {
      setRestaurantError(err.response?.data?.message || 'Could not load restaurant management page.');
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const copyManageLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
    catch { setLinkCopied(false); }
  };

  const saveRestaurant = async (e) => {
    e.preventDefault(); setRestaurantError(''); setStatus(''); setSavingRestaurant(true);
    try {
      const payload = {
        ...restaurantForm,
        cuisineTypes: restaurantForm.cuisineTypes.split(',').map(s => s.trim()).filter(Boolean),
        cashbackPercent: Number(restaurantForm.cashbackPercent) || 0
      };
      const { data } = await api.patch(`/restaurants/${id}`, payload);
      setRestaurant(data);
      setStatus('Restaurant details updated successfully.');
    } catch (err) { setRestaurantError(err.response?.data?.message || 'Could not save restaurant details.'); }
    finally { setSavingRestaurant(false); }
  };

  const startEditItem = (item) => {
    setItemError('');
    setEditingItemId(item._id);
    setItemForm({
      name: item.name || '', description: item.description || '', imageUrl: item.imageUrl || '', category: item.category || 'Food',
      price: item.price ?? '', prepTimeMins: item.prepTimeMins ?? '', discountPercent: item.discountPercent ?? 0,
      isAlcoholic: !!item.isAlcoholic, availability: item.availability !== false, featured: !!item.featured
    });
    window.scrollTo({ top: 450, behavior: 'smooth' });
  };

  const cancelItemEdit = () => { setEditingItemId(null); setItemForm(emptyItem); setItemError(''); };

  const saveItem = async (e) => {
    e.preventDefault(); setItemError(''); setStatus('');
    try {
      const payload = { ...itemForm, restaurant: id, price: Number(itemForm.price), prepTimeMins: Number(itemForm.prepTimeMins), discountPercent: Number(itemForm.discountPercent) || 0 };
      if (editingItemId) await api.patch(`/menu/items/${editingItemId}`, payload);
      else await api.post('/menu/items', payload);
      setItemForm(emptyItem); setEditingItemId(null); await load();
      setStatus(editingItemId ? 'Menu item updated successfully.' : 'Menu item added successfully.');
    } catch (err) { setItemError(err.response?.data?.message || 'Could not save that menu item.'); }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this menu item?')) return;
    try { await api.delete(`/menu/items/${itemId}`, { params: { restaurant: id } }); await load(); setStatus('Menu item removed.'); }
    catch (err) { setItemError(err.response?.data?.message || 'Could not remove that menu item.'); }
  };

  const startEditStaff = (member) => {
    setStaffError(''); setEditingStaffId(member._id);
    setStaffForm({ name: member.name || '', email: member.email || '', password: '', role: member.role || 'Waiter', salary: member.salary ?? '' });
  };
  const cancelStaffEdit = () => { setEditingStaffId(null); setStaffForm(emptyStaff); setStaffError(''); };

  const saveStaff = async (e) => {
    e.preventDefault(); setStaffError(''); setStatus('');
    try {
      const payload = { ...staffForm, restaurant: id, salary: Number(staffForm.salary) || 0 };
      if (editingStaffId) {
        // Blank password means keep the current password.
        if (!payload.password) delete payload.password;
        await api.patch(`/staff/setup/${editingStaffId}`, payload);
      } else {
        if (!payload.password) throw new Error('Password is required for a new staff member');
        await api.post('/staff/setup', payload);
      }
      setStaffForm(emptyStaff); setEditingStaffId(null); await load();
      setStatus(editingStaffId ? 'Staff details updated successfully.' : 'Staff member added successfully.');
    } catch (err) { setStaffError(err.response?.data?.message || err.message || 'Could not save that staff member.'); }
  };

  const publish = async () => {
    try {
      const { data } = await api.patch(`/restaurants/${id}`, { isActive: true });
      setRestaurant(data); setStatus('Restaurant is live — customers can find and order from it on Explore now.');
    } catch (err) { setRestaurantError(err.response?.data?.message || 'Could not publish restaurant.'); }
  };

  if (loading) return <main className="container page"><p className="muted">Loading…</p></main>;
  if (!restaurant) return <main className="container page"><div className="empty"><h2>Restaurant not found.</h2><p className="muted">{restaurantError}</p></div></main>;

  return <main className="container page restaurant-management-page">
    <div className="page-title">
      <span className="eyebrow">Restaurant management • {restaurant.isActive ? 'Live' : 'Draft'}</span>
      <h1>{restaurant.name}</h1>
      <p className="muted">Update your restaurant information, menu, food images and staff whenever you need to.</p>
      <p className="muted small-text">Management is link-based in this demo, so save/bookmark this page: <button type="button" className="text-link inline-button" onClick={copyManageLink}>{linkCopied ? 'Copied!' : 'copy management link'}</button>. {' '}<Link className="text-link" to={`/restaurants/${id}`}>Preview as a customer</Link></p>
    </div>

    <section className="detail-card management-section">
      <div className="section-heading"><div><span className="eyebrow">Restaurant profile</span><h2>Edit restaurant details</h2></div><Check size={22}/></div>
      <form className="form-grid" onSubmit={saveRestaurant}>
        <label>Restaurant name<input value={restaurantForm.name} onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} required /></label>
        <label>Location<input value={restaurantForm.location} onChange={e => setRestaurantForm({ ...restaurantForm, location: e.target.value })} required /></label>
        <label>Phone<input value={restaurantForm.phone} onChange={e => setRestaurantForm({ ...restaurantForm, phone: e.target.value })} /></label>
        <label>Contact email<input type="email" value={restaurantForm.email} onChange={e => setRestaurantForm({ ...restaurantForm, email: e.target.value })} /></label>
        <label>Cuisine types<input value={restaurantForm.cuisineTypes} onChange={e => setRestaurantForm({ ...restaurantForm, cuisineTypes: e.target.value })} placeholder="Nigerian, Grill, Seafood" /></label>
        <label>Promo text<input value={restaurantForm.promoText} onChange={e => setRestaurantForm({ ...restaurantForm, promoText: e.target.value })} placeholder="20% off this weekend" /></label>
        <label>Cashback %<input type="number" min="0" max="100" value={restaurantForm.cashbackPercent} onChange={e => setRestaurantForm({ ...restaurantForm, cashbackPercent: e.target.value })} /></label>
        <label>Brand color<input type="color" value={restaurantForm.accent} onChange={e => setRestaurantForm({ ...restaurantForm, accent: e.target.value })} /></label>
        <label className="form-grid-wide">Restaurant cover image URL<input value={restaurantForm.imageUrl} onChange={e => setRestaurantForm({ ...restaurantForm, imageUrl: e.target.value })} placeholder="https://…" /><small className="muted">Paste a direct image URL. Leave blank to use Chowly's fallback photo.</small></label>
        <label>Bank name<input value={restaurantForm.bankName} onChange={e => setRestaurantForm({ ...restaurantForm, bankName: e.target.value })} /></label>
        <label>Bank account name<input value={restaurantForm.bankAccountName} onChange={e => setRestaurantForm({ ...restaurantForm, bankAccountName: e.target.value })} /></label>
        <label>Bank account number<input value={restaurantForm.bankAccountNumber} onChange={e => setRestaurantForm({ ...restaurantForm, bankAccountNumber: e.target.value })} /></label>
        <div className="form-actions form-grid-wide"><button className="btn" disabled={savingRestaurant}><Save size={17}/>{savingRestaurant ? 'Saving…' : 'Save restaurant details'}</button></div>
      </form>
      {restaurantForm.imageUrl && <div className="image-preview"><Image size={16}/><img src={restaurantForm.imageUrl} alt="Restaurant cover preview" onError={e => { e.currentTarget.style.display = 'none'; }} /><span>Cover preview</span></div>}
      {restaurantError && <p className="error">{restaurantError}</p>}
    </section>

    <section className="detail-card management-section">
      <div className="section-heading"><div><span className="eyebrow">Menu management</span><h2>{editingItemId ? 'Edit menu item' : 'Add a menu item'}</h2></div><Image size={22}/></div>
      <form className="form-grid" onSubmit={saveItem}>
        <label>Name<input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required /></label>
        <label>Category<select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })}><option>Food</option><option>Drink</option></select></label>
        <label>Price (₦)<input type="number" min="0" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} required /></label>
        <label>Prep time (mins)<input type="number" min="1" value={itemForm.prepTimeMins} onChange={e => setItemForm({ ...itemForm, prepTimeMins: e.target.value })} required /></label>
        <label>Discount %<input type="number" min="0" max="100" value={itemForm.discountPercent} onChange={e => setItemForm({ ...itemForm, discountPercent: e.target.value })} /></label>
        <label>Description<textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} /></label>
        <label className="form-grid-wide">Food/drink image URL<input value={itemForm.imageUrl} onChange={e => setItemForm({ ...itemForm, imageUrl: e.target.value })} placeholder="https://…" /><small className="muted">Use a direct image URL. If it fails, Chowly automatically falls back to its real-photo/local fallback.</small></label>
        <label className="check-label"><input type="checkbox" checked={itemForm.isAlcoholic} onChange={e => setItemForm({ ...itemForm, isAlcoholic: e.target.checked })} />Alcoholic (18+ only)</label>
        <label className="check-label"><input type="checkbox" checked={itemForm.availability} onChange={e => setItemForm({ ...itemForm, availability: e.target.checked })} />Available to customers</label>
        <label className="check-label"><input type="checkbox" checked={itemForm.featured} onChange={e => setItemForm({ ...itemForm, featured: e.target.checked })} />Featured item</label>
        {itemError && <p className="error form-grid-wide">{itemError}</p>}
        <div className="form-actions form-grid-wide"><button className="btn"><Save size={17}/>{editingItemId ? 'Save menu changes' : 'Add menu item'}</button>{editingItemId && <button type="button" className="btn ghost" onClick={cancelItemEdit}><X size={17}/>Cancel edit</button>}</div>
      </form>

      <div className="management-list">
        {items.map(it => <article className="management-row" key={it._id}>
          <div className="management-thumb">{it.imageUrl ? <img src={it.imageUrl} alt="" onError={e => { e.currentTarget.src = '/images/menu/jollof-rice.svg'; }} /> : <Image size={20}/>}</div>
          <div className="management-main"><strong>{it.name}</strong><span>{it.category} • ₦{Number(it.price).toLocaleString()} • {it.prepTimeMins} min{it.isAlcoholic ? ' • 18+' : ''}</span><small>{it.description || 'No description'}{it.availability === false ? ' • Hidden from customers' : ''}</small></div>
          <div className="management-actions"><button className="btn small ghost" onClick={() => startEditItem(it)}><Edit3 size={15}/>Edit</button><button className="btn small danger" onClick={() => removeItem(it._id)}><Trash2 size={15}/>Remove</button></div>
        </article>)}
        {!items.length && <p className="muted small-text">No menu items yet.</p>}
      </div>
    </section>

    <section className="detail-card management-section">
      <div className="section-heading"><div><span className="eyebrow">Team management</span><h2>{editingStaffId ? 'Edit staff member' : 'Add staff member'}</h2></div><Plus size={22}/></div>
      <form className="form-grid" onSubmit={saveStaff}>
        <label>Name<input value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} required /></label>
        <label>Email<input type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} required /></label>
        <label>{editingStaffId ? 'New password (optional)' : 'Password'}<PasswordInput value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} required={!editingStaffId} placeholder={editingStaffId ? 'Leave blank to keep current password' : 'At least 6 characters'} /></label>
        <label>Role<select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}><option>Waiter</option><option>Chef</option><option>Bartender</option></select></label>
        <label>Salary<input type="number" min="0" value={staffForm.salary} onChange={e => setStaffForm({ ...staffForm, salary: e.target.value })} /></label>
        {staffError && <p className="error form-grid-wide">{staffError}</p>}
        <div className="form-actions form-grid-wide"><button className="btn"><Save size={17}/>{editingStaffId ? 'Save staff changes' : 'Add staff member'}</button>{editingStaffId && <button type="button" className="btn ghost" onClick={cancelStaffEdit}><X size={17}/>Cancel edit</button>}</div>
      </form>

      <div className="management-list">
        {staff.map(s => <article className="management-row" key={s._id}>
          <div className="staff-avatar">{s.name?.slice(0, 1).toUpperCase()}</div>
          <div className="management-main"><strong>{s.name}</strong><span>{s.role} • {s.email}</span><small>Salary: ₦{Number(s.salary || 0).toLocaleString()}</small></div>
          <div className="management-actions"><button className="btn small ghost" onClick={() => startEditStaff(s)}><Edit3 size={15}/>Edit</button></div>
        </article>)}
        {!staff.length && <p className="muted small-text">No staff added yet.</p>}
      </div>
      <p className="muted small-text" style={{ marginTop: 16 }}>Staff log in at <Link className="text-link" to="/staff-login">the staff portal</Link>. When editing a staff member, leaving the password blank keeps their current password.</p>
    </section>

    {!restaurant.isActive && <button className="btn big full" onClick={publish} disabled={!items.length} title={!items.length ? 'Add at least one menu item first' : ''}>Publish restaurant</button>}
    {status && <p className="toast-inline" style={{ marginTop: 12 }}>{status}</p>}
  </main>;
}
