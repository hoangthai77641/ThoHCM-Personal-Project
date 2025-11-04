const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'worker', 'driver', 'admin'], default: 'customer' }
}, { timestamps: true });

// extra fields
userSchema.add({
  address: { type: String },
  usageCount: { type: Number, default: 0 },
  // loyalty level derived from usageCount; values: 'normal', 'vip'
  loyaltyLevel: { type: String, enum: ['normal', 'vip'], default: 'normal' },
  // password reset via OTP
  resetOTP: { type: String },
  resetOTPExpiry: { type: Date },
  // approval status for workers
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
  // avatar image
  avatar: { type: String },
  // CCCD / Citizen identification for workers (admin managed)
  citizenId: { type: String, trim: true },
  // Online status for workers to receive new bookings
  isOnline: { type: Boolean, default: false },
  // Wallet status for workers (to hide services when negative)
  walletStatus: { type: String, enum: ['positive', 'negative'], default: 'positive' },
  // FCM token for push notifications
  fcmToken: { type: String }
});

// Compound unique indexes for flexible validation
// 1 phone can have 1 customer + 1 worker
userSchema.index({ phone: 1, role: 1 }, { unique: true });

// CCCD must be unique across all workers and drivers only (customers don't have CCCD)
userSchema.index({ citizenId: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    citizenId: { $exists: true },
    role: { $in: ['worker', 'driver'] }
  }
});

module.exports = mongoose.model('User', userSchema);
