import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true, min: 0 },
  tipAmount: { type: Number, default: 0, min: 0 },
  tipStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  method: { type: String, enum: ['Card', 'Bank Transfer', 'Chowly Wallet', 'Apple Pay Demo', 'Google Pay Demo'], required: true },
  status: { type: String, enum: ['Completed'], default: 'Completed' },
  transactionRef: { type: String, required: true, unique: true },
  isPretend: { type: Boolean, default: true, immutable: true }
}, { timestamps: true });
export default mongoose.model('Payment', paymentSchema);
