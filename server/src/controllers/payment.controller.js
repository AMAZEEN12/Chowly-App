import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Staff from '../models/Staff.js';
const PAYMENT_METHODS = ['Card', 'Bank Transfer', 'Chowly Wallet', 'Apple Pay Demo', 'Google Pay Demo'];

function normaliseCardBrand(number) {
  const n = String(number || '').replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'American Express';
  return 'Card';
}

export async function listPaymentMethods(req, res, next) {
  try {
    const customer = req.auth.user;
    res.json({
      paymentMethods: customer.paymentMethods || [],
      walletBalance: Number(customer.walletBalance || 0)
    });
  } catch (err) { next(err); }
}

export async function addPaymentMethod(req, res, next) {
  try {
    const { type } = req.body;
    if (!PAYMENT_METHODS.includes(type)) return res.status(400).json({ message: 'Unsupported payment method' });
    const customer = req.auth.user;
    const method = { type, createdAt: new Date() };

    if (type === 'Card') {
      const cardNumber = String(req.body.cardNumber || '').replace(/\s+/g, '');
      const expiry = String(req.body.expiry || '').trim();
      const cardholder = String(req.body.cardholder || '').trim();
      if (!/^\d{12,19}$/.test(cardNumber) || !cardholder || !/^\d{2}\/\d{2}$/.test(expiry)) {
        return res.status(400).json({ message: 'Enter a valid cardholder name, card number and expiry (MM/YY).' });
      }
      method.brand = normaliseCardBrand(cardNumber);
      method.last4 = cardNumber.slice(-4);
      method.expiry = expiry;
      method.label = `${method.brand} •••• ${method.last4}`;
    } else if (type === 'Bank Transfer') {
      const bankName = String(req.body.bankName || '').trim();
      const accountName = String(req.body.accountName || '').trim();
      const accountNumber = String(req.body.accountNumber || '').replace(/\D/g, '');
      if (!bankName || !accountName || !/^\d{10}$/.test(accountNumber)) {
        return res.status(400).json({ message: 'Enter your bank name, account name and 10-digit account number.' });
      }
      method.bankName = bankName;
      method.accountName = accountName;
      method.last4 = accountNumber.slice(-4);
      method.label = `${bankName} •••• ${method.last4}`;
    } else if (type === 'Chowly Wallet') {
      const label = String(req.body.label || '').trim();
      if (!label) return res.status(400).json({ message: 'Give your wallet a name.' });
      method.label = label;
    } else {
      const email = String(req.body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) return res.status(400).json({ message: `Enter the email connected to ${type.replace(' Demo', '')}.` });
      method.email = email;
      method.label = `${type.replace(' Demo', '')} • ${email}`;
    }

    customer.paymentMethods.push(method);
    await customer.save();
    const saved = customer.paymentMethods[customer.paymentMethods.length - 1];
    res.status(201).json({ paymentMethod: saved, paymentMethods: customer.paymentMethods });
  } catch (err) { next(err); }
}

export async function deletePaymentMethod(req, res, next) {
  try {
    const customer = req.auth.user;
    const method = customer.paymentMethods.id(req.params.methodId);
    if (!method) return res.status(404).json({ message: 'Payment method not found' });
    customer.paymentMethods.pull(req.params.methodId);
    await customer.save();
    res.json({ paymentMethods: customer.paymentMethods });
  } catch (err) { next(err); }
}

export async function createPretendPayment(req, res, next) {
  try {
    const { orderId, method, paymentMethodId = null, tipAmount = 0, tipStaffId = null } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.customer) !== String(req.auth.user._id)) return res.status(403).json({ message: 'You can only pay for your own order' });
    if (order.status !== 'Served') return res.status(400).json({ message: 'Pretend payment becomes available after the order is served' });
    if (order.paymentStatus === 'Paid') return res.status(409).json({ message: 'This order is already paid' });
    let tipStaff = null;
    if (tipStaffId) {
      tipStaff = await Staff.findOne({ _id: tipStaffId, restaurant: order.restaurant });
      if (!tipStaff) return res.status(400).json({ message: 'Tip recipient must belong to this restaurant' });
    }
    if (!PAYMENT_METHODS.includes(method)) return res.status(400).json({ message: 'Unsupported payment method' });
    let selectedPaymentMethod = null;
    if (paymentMethodId) {
      selectedPaymentMethod = req.auth.user.paymentMethods?.id(paymentMethodId);
      if (!selectedPaymentMethod || selectedPaymentMethod.type !== method) {
        return res.status(400).json({ message: 'Please choose a valid saved payment method.' });
      }
    } else if (method !== 'Bank Transfer') {
      return res.status(400).json({ message: 'Choose or add a payment method before confirming payment.' });
    }
    if (method === 'Chowly Wallet' && !selectedPaymentMethod) {
      return res.status(400).json({ message: 'Add a Chowly Wallet before paying.' });
    }
    const tip = Math.max(0, Number(tipAmount || 0));
    const amount = order.grandTotal + tip;
    const transactionRef = `CHW-DEMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payment = await Payment.create({
      order: order._id,
      customer: req.auth.user._id,
      amount,
      tipAmount: tip,
      tipStaff: tipStaff?._id || null,
      method,
      transactionRef,
      isPretend: true
    });
    order.paymentStatus = 'Paid';
    order.status = 'Paid';
    order.statusHistory.push({ status: 'Paid', note: `Pretend payment recorded via ${method}` });
    await order.save();
    res.status(201).json({ payment, order });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'A payment already exists for this order' });
    next(err);
  }
}
export async function getOrderPayment(req, res, next) {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId }).populate('tipStaff', 'name role');
    res.json(payment);
  } catch (err) { next(err); }
}
