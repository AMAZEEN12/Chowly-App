import Rating from '../models/Rating.js';
import Order from '../models/Order.js';
export async function upsertRating(req, res, next) {
  try {
    const { orderId, value, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.customer) !== String(req.auth.user._id)) return res.status(403).json({ message: 'You can only rate your own order' });
    if (!['Delayed', 'Served', 'Paid'].includes(order.status)) return res.status(400).json({ message: 'Rate an order after service or when it is delayed' });
    const rating = await Rating.findOneAndUpdate(
      { order: order._id },
      { customer: req.auth.user._id, value, comment: comment || '' },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(rating);
  } catch (err) { next(err); }
}
export async function getOrderRating(req, res, next) {
  try {
    const rating = await Rating.findOne({ order: req.params.orderId });
    res.json(rating);
  } catch (err) { next(err); }
}
