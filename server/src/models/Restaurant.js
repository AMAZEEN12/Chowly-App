import mongoose from 'mongoose';
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  location: { type: String, required: true },
  // Coordinates power the "nearest restaurant" feature on the Explore page -
  // the client compares these against the customer's browser location.
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  phone: String,
  email: String,
  cuisineTypes: [{ type: String }],
  promoText: { type: String, default: '' },
  cashbackPercent: { type: Number, default: 0, min: 0, max: 100 },
  accent: { type: String, default: '#ff7a00' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Restaurant', restaurantSchema);
