import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Staff from '../models/Staff.js';
import { discountedPrice, estimateWaitMins, minutesBetween } from '../utils/orderMath.js';
import { calculateAge } from '../utils/age.js';
const ACTIVE_STATUSES = ['Submitted', 'Assigned', 'Preparing', 'Ready', 'Delayed'];
async function chooseWaiter(restaurantId) {
  const waiters = await Staff.find({ restaurant: restaurantId, role: 'Waiter' });
  if (!waiters.length) return null;
  const counts = await Promise.all(waiters.map(async (waiter) => ({
    waiter,
    count: await Order.countDocuments({ waiter: waiter._id, status: { $in: ACTIVE_STATUSES } })
  })));
  counts.sort((a, b) => a.count - b.count);
  return counts[0].waiter;
}
async function refreshDelay(order) {
  if (!['Assigned', 'Preparing', 'Ready'].includes(order.status)) return order;
  if (minutesBetween(order.createdAt) > order.estimatedWaitMins) {
    order.status = 'Delayed';
    order.statusHistory.push({ status: 'Delayed', note: 'Estimated waiting time exceeded' });
    await order.save();
  }
  return order;
}
export async function createOrder(req, res, next) {
  try {
    const { restaurantId, items = [], tableNumber, notes, orderType = 'Dine-In', scheduledFor } = req.body;
    if (!restaurantId || !items.length) return res.status(400).json({ message: 'Restaurant and at least one item are required' });
    const ids = items.map(i => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: ids }, restaurant: restaurantId, availability: true });
    if (menuItems.length !== new Set(ids).size) return res.status(400).json({ message: 'One or more selected items are invalid or unavailable for this restaurant' });

    // Age-verification feature: any alcoholic item requires a customer who
    // has told us their date of birth and is 18 or older.
    const hasAlcohol = menuItems.some((item) => item.isAlcoholic);
    if (hasAlcohol) {
      const age = calculateAge(req.auth.user.dateOfBirth);
      if (age === null) {
        return res.status(403).json({ message: 'Add your date of birth in your profile before ordering an alcoholic drink.' });
      }
      if (age < 18) {
        return res.status(403).json({ message: 'You must be 18 or older to order an alcoholic drink.' });
      }
    }

    const itemMap = new Map(menuItems.map(i => [String(i._id), i]));
    const snapshots = items.map(({ menuItemId, quantity }) => {
      const source = itemMap.get(String(menuItemId));
      const qty = Math.max(1, Number(quantity || 1));
      const salePrice = discountedPrice(source.price, source.discountPercent);
      return {
        menuItem: source._id,
        nameSnapshot: source.name,
        categorySnapshot: source.category,
        quantity: qty,
        originalPrice: source.price,
        unitPrice: salePrice,
        prepTimeMins: source.prepTimeMins,
        isAlcoholic: !!source.isAlcoholic
      };
    });
    const subtotal = snapshots.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);
    const grandTotal = snapshots.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const discountTotal = subtotal - grandTotal;
    const activeCount = await Order.countDocuments({ restaurant: restaurantId, status: { $in: ACTIVE_STATUSES } });
    const estimatedWaitMins = estimateWaitMins(snapshots, activeCount);
    const waiter = await chooseWaiter(restaurantId);
    const isScheduled = orderType === 'Scheduled' && scheduledFor;
    const initialStatus = isScheduled ? 'Scheduled' : (waiter ? 'Assigned' : 'Submitted');
    const order = await Order.create({

      customer: req.auth.user._id,
      restaurant: restaurantId,
      waiter: waiter?._id || null,
      items: snapshots,
      orderType: isScheduled ? 'Scheduled' : 'Dine-In',
      scheduledFor: isScheduled ? new Date(scheduledFor) : null,
      tableNumber: tableNumber || 'Walk-in',
      notes: notes || '',
      status: initialStatus,
      estimatedWaitMins,
      subtotal,
      discountTotal,
      grandTotal,
      statusHistory: [{ status: initialStatus, note: waiter ? `Assigned to waiter ${waiter.name}` : 'Waiting for waiter assignment' }]
    });
    await order.populate(['restaurant', 'waiter', 'items.menuItem']);
    res.status(201).json(order);
  } catch (err) { next(err); }
}
export async function getCustomerOrders(req, res, next) {
  try {
    const orders = await Order.find({ customer: req.auth.user._id })
      .populate('restaurant', 'name location slug accent')
      .populate('waiter chef bartender', 'name role')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
}
export async function getOrder(req, res, next) {
  try {
    let order = await Order.findById(req.params.id)
      .populate('restaurant', 'name location slug accent')
      .populate('customer', 'name email')
      .populate('waiter chef bartender', 'name role')
      .populate('items.menuItem', 'name category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const owner = req.auth.type === 'customer' && String(order.customer._id) === String(req.auth.user._id);
    const sameRestaurantStaff = req.auth.type === 'staff' && String(order.restaurant._id) === String(req.auth.user.restaurant._id);
    if (!owner && !sameRestaurantStaff) return res.status(403).json({ message: 'You cannot view this order' });
    await refreshDelay(order);
    order = await Order.findById(order._id)
      .populate('restaurant', 'name location slug accent')
      .populate('customer', 'name email')
      .populate('waiter chef bartender', 'name role');
    res.json(order);
  } catch (err) { next(err); }
}
export async function listStaffOrders(req, res, next) {
  try {
    const filter = { restaurant: req.auth.user.restaurant._id };
    if (req.query.active === '1') filter.status = { $in: ['Scheduled', ...ACTIVE_STATUSES] };
    const orders = await Order.find(filter)
      .populate('customer', 'name')
      .populate('restaurant', 'name')
      .populate('waiter chef bartender', 'name role')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
}
export async function updateOrderAssignment(req, res, next) {
  try {
    if (req.auth.user.role !== 'Waiter') return res.status(403).json({ message: 'Only a waiter can update assignment details' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (String(order.restaurant) !== String(req.auth.user.restaurant._id)) return res.status(403).json({ message: 'Order belongs to another restaurant' });
    const { chefId, bartenderId, status } = req.body;
    if (chefId) {
      const chef = await Staff.findOne({ _id: chefId, restaurant: order.restaurant, role: 'Chef' });
      if (!chef) return res.status(400).json({ message: 'Chef must be a chef from the same restaurant' });
      order.chef = chef._id;
    }
    if (bartenderId) {
      const bartender = await Staff.findOne({ _id: bartenderId, restaurant: order.restaurant, role: 'Bartender' });
      if (!bartender) return res.status(400).json({ message: 'Bartender must be a bartender from the same restaurant' });
      order.bartender = bartender._id;
    }
    order.waiter = req.auth.user._id;
    const allowed = ['Assigned', 'Preparing', 'Ready', 'Delayed', 'Served'];
    if (status && !allowed.includes(status)) return res.status(400).json({ message: 'Invalid waiter status update' });
    if (status) {
      order.status = status;
      order.statusHistory.push({ status, note: `Updated by waiter ${req.auth.user.name}` });
    }
    if (status === 'Served') {
      order.servedAt = new Date();
      order.actualWaitMins = minutesBetween(order.createdAt, order.servedAt);
    }
    await order.save();
    await order.populate('waiter chef bartender', 'name role');
    res.json(order);
  } catch (err) { next(err); }
}
