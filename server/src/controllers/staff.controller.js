import Staff from '../models/Staff.js';
export async function listRestaurantStaff(req, res, next) {
  try {
    const role = req.query.role;
    const filter = { restaurant: req.auth.user.restaurant._id };
    if (role && ['Waiter', 'Chef', 'Bartender'].includes(role)) filter.role = role;
    const staff = await Staff.find(filter).select('name email role restaurant').sort({ role: 1, name: 1 });
    res.json(staff);
  } catch (err) { next(err); }
}
