const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  worker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // Mỗi thợ chỉ có 1 ví
  },
  balance: { 
    type: Number, 
    default: 0 // Số dư ví
  },
  totalDeposited: { 
    type: Number, 
    default: 0 // Tổng số tiền đã nạp
  },
  totalDeducted: { 
    type: Number, 
    default: 0 // Tổng số tiền đã bị trừ phí
  }
}, { timestamps: true });

// Transaction history schema
const transactionSchema = new mongoose.Schema({
  wallet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Wallet', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['deposit', 'deduct', 'refund'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  // For deposits
  paymentMethod: { 
    type: String, 
    enum: ['bank_transfer', 'momo', 'card'] 
  },
  paymentReference: { 
    type: String // Mã giao dịch ngân hàng
  },
  // For deductions
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  },
  // Status for deposits (pending until confirmed)
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' 
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });

// Platform fee configuration
const platformFeeSchema = new mongoose.Schema({
  feePercentage: { 
    type: Number, 
    default: 20 // 20% platform fee
  },
  minTopup: { 
    type: Number, 
    default: 100000 // 100k VND minimum
  },
  maxTopup: { 
    type: Number, 
    default: 1000000 // 1M VND maximum
  },
  bankAccount: {
    bankName: { type: String, default: 'Vietcombank' },
    bankCode: { type: String, default: '970436' },
    accountNumber: { type: String, default: '0441000765886' },
    accountName: { type: String, default: 'NGUYEN HOANG THAI' }
  }
}, { timestamps: true });

// Middleware to update wallet totals and worker status
transactionSchema.pre('save', async function(next) {
  // Check if this is a new transaction with completed status OR status changed to completed
  const isNewCompleted = this.isNew && this.status === 'completed';
  const isStatusChanged = this.isModified('status') && this.status === 'completed' && !this.wasCompleted;
  
  if (isNewCompleted || isStatusChanged) {
    const Wallet = mongoose.model('Wallet');
    const User = mongoose.model('User');
    const wallet = await Wallet.findById(this.wallet);
    
    if (this.type === 'deposit') {
      wallet.balance += this.amount;
      wallet.totalDeposited += this.amount;
    } else if (this.type === 'deduct') {
      wallet.balance -= this.amount;
      wallet.totalDeducted += this.amount;
    } else if (this.type === 'refund') {
      wallet.balance += this.amount;
    }
    
    this.balanceAfter = wallet.balance;
    await wallet.save();
    
    // Update worker wallet status based on balance
    const newStatus = wallet.balance >= 0 ? 'positive' : 'negative';
    await User.findByIdAndUpdate(wallet.worker, { 
      walletStatus: newStatus 
    });
    
    // Mark as processed to avoid double processing
    this.wasCompleted = true;
  }
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const PlatformFee = mongoose.model('PlatformFee', platformFeeSchema);

module.exports = { Wallet, Transaction, PlatformFee };