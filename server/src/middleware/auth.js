import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';
async function resolveAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type === 'customer') {
    const customer = await Customer.findById(decoded.id);
    return customer ? { type: 'customer', user: customer } : null;
  }
  if (decoded.type === 'staff') {
    const staff = await Staff.findById(decoded.id).populate('restaurant');
    return staff ? { type: 'staff', user: staff } : null;
  }
  return null;
}
export async function protectAny(req, res, next) {
  try {
    const auth = await resolveAuth(req);
    if (!auth) return res.status(401).json({ message: 'Authentication required' });
    req.auth = auth;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
export async function protectCustomer(req, res, next) {
  await protectAny(req, res, () => {
    if (req.auth.type !== 'customer') return res.status(403).json({ message: 'Customer access required' });
    next();
  });
}
export async function protectStaff(req, res, next) {
  await protectAny(req, res, () => {
    if (req.auth.type !== 'staff') return res.status(403).json({ message: 'Staff access required' });
    next();
  });
}
