import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  // Added for the profile/age-verification features: a customer's date of
  // birth powers both the happy-birthday greeting and the 18+ check on
  // alcoholic drinks. It is optional at signup so existing behaviour is
  // unchanged, but ordering an alcoholic item requires it to be filled in.
  dateOfBirth: { type: Date, default: null },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
customerSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
export default mongoose.model('Customer', customerSchema);
