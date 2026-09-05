import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';
import { signToken, publicCustomer, publicStaff } from '../utils/auth.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { sendMail, verifyEmailTemplate, passwordResetEmailTemplate } from '../utils/mailer.js';

function sendVerificationEmail(customer) {
  const verifyToken = jwt.sign({ id: customer._id, type: 'email-verify' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const link = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  sendMail({ to: customer.email, ...verifyEmailTemplate(customer.name, link) });
}

function sendPasswordResetEmail(user, role) {
  const resetToken = jwt.sign({ id: user._id, type: 'password-reset', role }, process.env.JWT_SECRET, { expiresIn: '30m' });
  const link = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&role=${role}`;
  sendMail({ to: user.email, ...passwordResetEmailTemplate(user.name, link) });
}

export async function registerCustomer(req, res, next) {
  try {
    const { name, email, phone, password, dateOfBirth } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await Customer.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const customer = await Customer.create({ name, email, phone, password, dateOfBirth: dateOfBirth || null, isVerified: false });
    sendVerificationEmail(customer);
    res.status(201).json({ message: 'Account created. Check your email to confirm it before logging in.', email: customer.email });
  } catch (err) { next(err); }
}

export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase() });
    if (!customer || !(await customer.comparePassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
    if (!customer.isVerified) return res.status(403).json({ message: 'Please confirm your email before logging in. Check your inbox for the confirmation link.', unverified: true, email: customer.email });
    const token = signToken({ id: customer._id, type: 'customer' });
    res.json({ token, user: publicCustomer(customer) });
  } catch (err) { next(err); }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Missing verification token' });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ message: 'This confirmation link is invalid or has expired.' }); }
    if (decoded.type !== 'email-verify') return res.status(400).json({ message: 'This confirmation link is invalid.' });

    const customer = await Customer.findById(decoded.id);
    if (!customer) return res.status(404).json({ message: 'Account not found.' });

    if (!customer.isVerified) {
      customer.isVerified = true;
      await customer.save();
    }

    const loginToken = signToken({ id: customer._id, type: 'customer' });
    res.json({ token: loginToken, user: publicCustomer(customer) });
  } catch (err) { next(err); }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase() });
    if (customer && !customer.isVerified) sendVerificationEmail(customer);
    res.json({ message: 'If that email has a pending account, a new confirmation link has been sent.' });
  } catch (err) { next(err); }
}

export async function forgotPasswordCustomer(req, res, next) {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase() });
    if (customer) sendPasswordResetEmail(customer, 'customer');
    res.json({ message: 'If that email has an account, a password reset link has been sent.' });
  } catch (err) { next(err); }
}

export async function resetPasswordCustomer(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ message: 'This reset link is invalid or has expired.' }); }
    if (decoded.type !== 'password-reset' || decoded.role !== 'customer') return res.status(400).json({ message: 'This reset link is invalid.' });

    const customer = await Customer.findById(decoded.id);
    if (!customer) return res.status(404).json({ message: 'Account not found.' });

    customer.password = password;
    await customer.save();
    const loginToken = signToken({ id: customer._id, type: 'customer' });
    res.json({ token: loginToken, user: publicCustomer(customer) });
  } catch (err) { next(err); }
}

export async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });
    const { googleId, email, name } = await verifyGoogleToken(credential);

    let customer = await Customer.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (!customer) {
      customer = await Customer.create({ name, email, googleId, isVerified: true });
    } else if (!customer.googleId) {
      customer.googleId = googleId;
      customer.isVerified = true;
      await customer.save();
    }

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

export async function forgotPasswordStaff(req, res, next) {
  try {
    const { email } = req.body;
    const staff = await Staff.findOne({ email: (email || '').toLowerCase() });
    if (staff) sendPasswordResetEmail(staff, 'staff');
    res.json({ message: 'If that email has a staff account, a password reset link has been sent.' });
  } catch (err) { next(err); }
}

export async function resetPasswordStaff(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(400).json({ message: 'This reset link is invalid or has expired.' }); }
    if (decoded.type !== 'password-reset' || decoded.role !== 'staff') return res.status(400).json({ message: 'This reset link is invalid.' });

    const staff = await Staff.findById(decoded.id).populate('restaurant');
    if (!staff) return res.status(404).json({ message: 'Account not found.' });

    staff.password = password;
    await staff.save();
    const loginToken = signToken({ id: staff._id, type: 'staff' });
    res.json({ token: loginToken, user: publicStaff(staff) });
  } catch (err) { next(err); }
}

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