import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['Waiter', 'Chef', 'Bartender'], required: true },
  salary: { type: Number, default: 0 },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true }
}, { timestamps: true });
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
staffSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
export default mongoose.model('Staff', staffSchema);
