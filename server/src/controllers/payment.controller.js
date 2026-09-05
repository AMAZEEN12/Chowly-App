import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Staff from '../models/Staff.js';
export async function createPretendPayment(req, res, next) {
  try {
    const { orderId, method, tipAmount = 0, tipStaffId = null } = req.body;
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
