import mongoose from 'mongoose';
const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  nameSnapshot: { type: String, required: true },
  categorySnapshot: { type: String, enum: ['Food', 'Drink'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  originalPrice: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  prepTimeMins: { type: Number, required: true, min: 1 },
  isAlcoholic: { type: Boolean, default: false }
}, { _id: true });
const statusHistorySchema = new mongoose.Schema({
  status: String,
  at: { type: Date, default: Date.now },
  note: String
}, { _id: false });
const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  bartender: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  items: { type: [orderItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
  orderType: { type: String, enum: ['Dine-In', 'Scheduled'], default: 'Dine-In' },
  scheduledFor: { type: Date, default: null },
  tableNumber: { type: String, default: 'Walk-in' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Scheduled', 'Submitted', 'Assigned', 'Preparing', 'Ready', 'Delayed', 'Served', 'Paid', 'Cancelled'],
    default: 'Submitted',
    index: true
  },
  estimatedWaitMins: { type: Number, required: true },
  actualWaitMins: { type: Number, default: null },
  subtotal: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  servedAt: { type: Date, default: null },
  statusHistory: { type: [statusHistorySchema], default: [] }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
