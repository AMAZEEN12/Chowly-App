import Restaurant from '../models/Restaurant.js';
import RestaurantApplication from '../models/RestaurantApplication.js';
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
export async function applyRestaurant(req, res, next) {
  try {
    const { restaurantName, contactName, email, phone, location, message } = req.body;
    if (!restaurantName || !contactName || !email || !location) return res.status(400).json({ message: 'Restaurant name, contact name, email and location are required' });
    const application = await RestaurantApplication.create({ restaurantName, contactName, email, phone, location, message });
    res.status(201).json({ message: 'Restaurant registration request received', application });
  } catch (err) { next(err); }
}
