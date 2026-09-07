import Restaurant from '../models/Restaurant.js';
import RestaurantApplication from '../models/RestaurantApplication.js';
import { sendMail, restaurantApplicationEmail } from '../utils/mailer.js';

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'restaurant';
}

async function uniqueSlug(base) {
  let slug = base;
  let i = 2;
  while (await Restaurant.findOne({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
export async function listRestaurants(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const filter = { isActive: true };
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { cuisineTypes: { $regex: q, $options: 'i' } }
    ];
    const restaurants = await Restaurant.find(filter).sort({ name: 1 });
    res.json(restaurants);
  } catch (err) { next(err); }
}
export async function getRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) { next(err); }
}
// Self-service registration: creates a real (unpublished) Restaurant right
// away, no login required. The owner is redirected to the setup page to add
// menu items and staff, then publishes it (isActive: true) when ready.
export async function registerRestaurant(req, res, next) {
  try {
    const { name, location, phone, email, imageUrl, cuisineTypes, promoText, cashbackPercent, accent, bankName, bankAccountName, bankAccountNumber } = req.body;
    if (!name || !location) return res.status(400).json({ message: 'Restaurant name and location are required' });

    const slug = await uniqueSlug(slugify(name));
    const restaurant = await Restaurant.create({
      name,
      slug,
      location,
      phone,
      email,
      imageUrl: imageUrl || '',
      cuisineTypes: Array.isArray(cuisineTypes)
        ? cuisineTypes
        : (cuisineTypes ? String(cuisineTypes).split(',').map(s => s.trim()).filter(Boolean) : []),
      promoText: promoText || '',
      cashbackPercent: cashbackPercent || 0,
      bankName: bankName || undefined,
      bankAccountName: bankAccountName || undefined,
      bankAccountNumber: bankAccountNumber || undefined,
      accent: accent || '#ff7a00',
      isActive: false
    });
    res.status(201).json({ message: 'Restaurant created. Add your menu and staff, then publish it.', restaurant });
  } catch (err) { next(err); }
}

// Used by the setup page to edit details and to "publish" (isActive: true)
// once the owner has added at least a menu.
export async function updateRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const editable = ['name', 'location', 'phone', 'email', 'imageUrl', 'cuisineTypes', 'promoText', 'cashbackPercent', 'bankName', 'bankAccountName', 'bankAccountNumber', 'accent', 'isActive'];
    for (const field of editable) {
      if (req.body[field] !== undefined) restaurant[field] = req.body[field];
    }
    await restaurant.save();
    res.json(restaurant);
  } catch (err) { next(err); }
}

export async function applyRestaurant(req, res, next) {
  try {
    const { restaurantName, contactName, email, phone, location, message } = req.body;
    if (!restaurantName || !contactName || !email || !location) return res.status(400).json({ message: 'Restaurant name, contact name, email and location are required' });
    const application = await RestaurantApplication.create({ restaurantName, contactName, email, phone, location, message });
    res.status(201).json({ message: 'Restaurant registration request received', application });
    sendMail({ to: application.email, ...restaurantApplicationEmail(application.contactName, application.restaurantName) });
  } catch (err) { next(err); }
}
