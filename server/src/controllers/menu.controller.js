import MenuItem from '../models/MenuItem.js';
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
