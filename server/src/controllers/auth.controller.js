import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';
import { signToken, publicCustomer, publicStaff } from '../utils/auth.js';
export async function registerCustomer(req, res, next) {
  try {
    const { name, email, phone, password, dateOfBirth } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await Customer.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const customer = await Customer.create({ name, email, phone, password, dateOfBirth: dateOfBirth || null });
    const token = signToken({ id: customer._id, type: 'customer' });
    res.status(201).json({ token, user: publicCustomer(customer) });
  } catch (err) { next(err); }
}
export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase() });
    if (!customer || !(await customer.comparePassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
    const token = signToken({ id: customer._id, type: 'customer' });
    res.json({ token, user: publicCustomer(customer) });
  } catch (err) { next(err); }
}
export async function loginStaff(req, res, next) {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email: (email || '').toLowerCase() }).populate('restaurant');
    if (!staff || !(await staff.comparePassword(password || ''))) return res.status(401).json({ message: 'Invalid staff credentials' });
    const token = signToken({ id: staff._id, type: 'staff' });
    res.json({ token, user: publicStaff(staff) });
  } catch (err) { next(err); }
}

// Profile registration feature: a logged-in customer can view and complete
// their own profile (name, phone, date of birth). Date of birth is what
// powers both the happy-birthday greeting and the 18+ alcohol check.
export async function getMe(req, res, next) {
  try {
    res.json(publicCustomer(req.auth.user));
  } catch (err) { next(err); }
}

export async function updateMe(req, res, next) {
  try {
    const { name, phone, dateOfBirth } = req.body;
    const customer = req.auth.user;
    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth || null;
    await customer.save();
    res.json(publicCustomer(customer));
  } catch (err) { next(err); }
}
