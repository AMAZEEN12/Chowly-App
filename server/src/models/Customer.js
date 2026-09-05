import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  dateOfBirth: { type: Date, default: null },
  password: {
    type: String,
    minlength: 6,
    required: function () { return !this.googleId; }
  },
  googleId: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
customerSchema.methods.comparePassword = function(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};
export default mongoose.model('Customer', customerSchema);