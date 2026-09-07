import Staff from '../models/Staff.js';

// Used by the restaurant setup page (no login) right after self-registration,
// so a new owner can add waiters/chefs/bartenders before publishing.
export async function createStaff(req, res, next) {
  try {
    const { name, email, password, role, salary, restaurant } = req.body;
    if (!name || !email || !password || !role || !restaurant) {
      return res.status(400).json({ message: 'Name, email, password, role and restaurant are required' });
    }
    if (!['Waiter', 'Chef', 'Bartender'].includes(role)) return res.status(400).json({ message: 'Role must be Waiter, Chef or Bartender' });
    if (await Staff.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'That email is already used by another staff member' });
    const staff = await Staff.create({ name, email: email.toLowerCase(), password, role, salary: salary || 0, restaurant });
    res.status(201).json({ id: staff._id, name: staff.name, email: staff.email, role: staff.role, salary: staff.salary, restaurant: staff.restaurant });
  } catch (err) { next(err); }
}

export async function listStaffForSetup(req, res, next) {
  try {
    const { restaurant } = req.query;
    if (!restaurant) return res.status(400).json({ message: 'restaurant query param is required' });
    const staff = await Staff.find({ restaurant }).select('name email role salary').sort({ role: 1, name: 1 });
    res.json(staff);
  } catch (err) { next(err); }
}

export async function listRestaurantStaff(req, res, next) {
  try {
    const role = req.query.role;
    const filter = { restaurant: req.auth.user.restaurant._id };
    if (role && ['Waiter', 'Chef', 'Bartender'].includes(role)) filter.role = role;
    const staff = await Staff.find(filter).select('name email role restaurant').sort({ role: 1, name: 1 });
    res.json(staff);
  } catch (err) { next(err); }
}


export async function updateStaff(req, res, next) {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    if (req.body.restaurant && String(staff.restaurant) !== String(req.body.restaurant)) {
      return res.status(403).json({ message: 'That staff member does not belong to this restaurant' });
    }
    const { name, email, password, role, salary } = req.body;
    if (role !== undefined && !['Waiter', 'Chef', 'Bartender'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Waiter, Chef or Bartender' });
    }
    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();
      const duplicate = await Staff.findOne({ email: normalizedEmail, _id: { $ne: staff._id } });
      if (duplicate) return res.status(409).json({ message: 'That email is already used by another staff member' });
      staff.email = normalizedEmail;
    }
    if (name !== undefined) staff.name = name;
    if (role !== undefined) staff.role = role;
    if (salary !== undefined) staff.salary = salary;
    // Leave the existing password untouched when the password box is blank.
    if (password) staff.password = password;
    await staff.save();
    res.json({ id: staff._id, name: staff.name, email: staff.email, role: staff.role, salary: staff.salary, restaurant: staff.restaurant });
  } catch (err) { next(err); }
}
