import jwt from 'jsonwebtoken';
import { calculateAge, isBirthdayToday } from './age.js';
export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
export function publicCustomer(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    dateOfBirth: customer.dateOfBirth,
    age: calculateAge(customer.dateOfBirth),
    isBirthdayToday: isBirthdayToday(customer.dateOfBirth),
    type: 'customer'
  };
}
export function publicStaff(staff) {
  return {
    id: staff._id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    restaurant: staff.restaurant,
    type: 'staff'
  };
}
