import Complaint from '../models/Complaint.js';
import Order from '../models/Order.js';
import { minutesBetween } from '../utils/orderMath.js';
export async function createComplaint(req, res, next) {
  try {
    const { orderId, description } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.customer) !== String(req.auth.user._id)) return res.status(403).json({ message: 'You can only complain about your own order' });
    const delayed = order.status === 'Delayed' || (['Assigned', 'Preparing', 'Ready'].includes(order.status) && minutesBetween(order.createdAt) > order.estimatedWaitMins);
    if (!delayed) return res.status(400).json({ message: 'Complaint is enabled when the order exceeds its estimated waiting time' });
    const complaint = await Complaint.create({ order: order._id, customer: req.auth.user._id, description });
    if (order.status !== 'Delayed') {
      order.status = 'Delayed';
      order.statusHistory.push({ status: 'Delayed', note: 'Customer submitted a delay complaint' });
      await order.save();
    }
    res.status(201).json(complaint);
  } catch (err) { next(err); }
}
export async function listOrderComplaints(req, res, next) {
  try {
    const complaints = await Complaint.find({ order: req.params.orderId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) { next(err); }
}
