import MenuItem from '../models/MenuItem.js';
import Menu from '../models/Menu.js';

async function findOrCreateMenu(restaurantId, category) {
  let menu = await Menu.findOne({ restaurant: restaurantId, type: category });
  if (!menu) menu = await Menu.create({ restaurant: restaurantId, type: category, name: category === 'Drink' ? 'Drinks Menu' : 'Food Menu' });
  return menu;
}

// Used by the restaurant setup page (no login) to add items to a restaurant
// that was just self-registered.
export async function createMenuItem(req, res, next) {
  try {
    const { restaurant, name, description, category, price, prepTimeMins, discountPercent, isAlcoholic } = req.body;
    if (!restaurant || !name || !category || price === undefined || prepTimeMins === undefined) {
      return res.status(400).json({ message: 'Restaurant, name, category, price and prep time are required' });
    }
    if (!['Food', 'Drink'].includes(category)) return res.status(400).json({ message: 'Category must be Food or Drink' });
    const menu = await findOrCreateMenu(restaurant, category);
    const item = await MenuItem.create({
      menu: menu._id,
      restaurant,
      name,
      description: description || '',
      category,
      price,
      prepTimeMins,
      discountPercent: discountPercent || 0,
      isAlcoholic: !!isAlcoholic
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

// Unlike listMenuItems (customer-facing, availability-filtered), this returns
// every item for a restaurant so the owner can see everything they've added.
export async function listAllMenuItemsForRestaurant(req, res, next) {
  try {
    const { restaurant } = req.query;
    if (!restaurant) return res.status(400).json({ message: 'restaurant query param is required' });
    const items = await MenuItem.find({ restaurant }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) { next(err); }
}

export async function deleteMenuItem(req, res, next) {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item removed' });
  } catch (err) { next(err); }
}

export async function listMenuItems(req, res, next) {
  try {
    const { restaurant, category, q } = req.query;
    const filter = { availability: true };
    if (restaurant) filter.restaurant = restaurant;
    if (category && ['Food', 'Drink'].includes(category)) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };
    const items = await MenuItem.find(filter).populate('menu', 'name type').populate('restaurant', 'name slug accent').sort({ featured: -1, name: 1 });
    res.json(items);
  } catch (err) { next(err); }
}
