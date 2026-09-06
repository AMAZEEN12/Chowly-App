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
  isVerified: { type: Boolean, default: false },
  paymentMethods: [{
    type: { type: String, enum: ['Card', 'Bank Transfer', 'Chowly Wallet', 'Apple Pay Demo', 'Google Pay Demo'], required: true },
    label: { type: String, default: '' },
    brand: { type: String, default: '' },
    last4: { type: String, default: '' },
    expiry: { type: String, default: '' },
    accountName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    email: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  walletBalance: { type: Number, default: 0, min: 0 }
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