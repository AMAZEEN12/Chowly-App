import mongoose from 'mongoose';
const complaintSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  description: { type: String, required: true, minlength: 5 },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' }
}, { timestamps: true });
export default mongoose.model('Complaint', complaintSchema);
