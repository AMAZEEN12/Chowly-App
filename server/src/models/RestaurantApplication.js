import mongoose from 'mongoose';
const restaurantApplicationSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  location: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' }
}, { timestamps: true });
export default mongoose.model('RestaurantApplication', restaurantApplicationSchema);
