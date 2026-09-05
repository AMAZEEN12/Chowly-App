import mongoose from 'mongoose';
const menuItemSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  // Stored as a data URL so a restaurant can upload an image without needing a separate file-storage service.
  imageUrl: { type: String, default: '' },
  category: { type: String, enum: ['Food', 'Drink'], required: true },
  price: { type: Number, required: true, min: 0 },
  prepTimeMins: { type: Number, required: true, min: 1 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  availability: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  // Age-gating feature: alcoholic drinks require the ordering customer to be
  // 18 or older (checked server-side in order.controller.js at order time).
  isAlcoholic: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('MenuItem', menuItemSchema);
