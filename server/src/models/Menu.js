import mongoose from 'mongoose';
const menuSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Food', 'Drink'], required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
export default mongoose.model('Menu', menuSchema);
