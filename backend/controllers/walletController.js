const { Wallet, Transaction, PlatformFee } = require('../models/Wallet');
const User = require('../models/User');
const crypto = require('crypto');
const VNPayService = require('../services/VNPayService');
const ZaloPayService = require('../services/ZaloPayService');
const StripeService = require('../services/StripeService');

// Initialize payment services
const vnpayService = new VNPayService();
const zalopayService = new ZaloPayService();
const stripeService = new StripeService();

// Get or create worker wallet
exports.getWallet = async (req, res) => {
  try {
    const workerId = req.user.id;
    
    // Only workers can access wallet
    if (req.user.role !== 'worker') {
      return res.status(403).json({ 
        success: false,
        message: 'Chỉ thợ mới có thể truy cập ví' 
      });
    }

    let wallet = await Wallet.findOne({ worker: workerId });
    if (!wallet) {
      // Create new wallet for worker
      wallet = new Wallet({ worker: workerId });
      await wallet.save();
    }

    // Get recent transactions
    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('booking', 'finalPrice service customer')
      .populate({
        path: 'booking',
        populate: {
          path: 'service customer',
          select: 'name'
        }
      });

    // Get platform fee config
    let platformFee = await PlatformFee.findOne();
    if (!platformFee) {
      platformFee = new PlatformFee();
      await platformFee.save();
    }

    res.json({
      success: true,
      data: {
        wallet: {
          balance: wallet.balance,
          totalDeposited: wallet.totalDeposited,
          totalDeducted: wallet.totalDeducted,
          isNegative: wallet.balance < 0
        },
        transactions,
        platformFee: {
          feePercentage: platformFee.feePercentage,
          minTopup: platformFee.minTopup,
          maxTopup: platformFee.maxTopup,
          bankAccount: platformFee.bankAccount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create deposit request
exports.createDepositRequest = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { amount, paymentMethod } = req.body;
    
    console.log('💳 Deposit request:', { workerId, amount, paymentMethod });

    // Only workers can deposit
    if (req.user.role !== 'worker') {
      return res.status(403).json({ 
        success: false,
        message: 'Chỉ thợ mới có thể nạp tiền' 
      });
    }

    // Get platform fee config
    const platformFee = await PlatformFee.findOne() || new PlatformFee();
    
    // Validate amount
    if (!amount || amount < platformFee.minTopup || amount > platformFee.maxTopup) {
      return res.status(400).json({ 
        success: false,
        message: `Số tiền nạp phải từ ${platformFee.minTopup.toLocaleString('vi-VN')}đ đến ${platformFee.maxTopup.toLocaleString('vi-VN')}đ` 
      });
    }

    // Validate payment method
    const validMethods = ['bank_transfer', 'momo', 'card', 'vnpay', 'zalopay', 'stripe'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false,
        message: 'Phương thức thanh toán không hợp lệ' 
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ worker: workerId });
    if (!wallet) {
      wallet = new Wallet({ worker: workerId });
      await wallet.save();
    }

    // Generate payment reference
    const paymentReference = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    // Create transaction with pending status
    const transaction = new Transaction({
      wallet: wallet._id,
      type: 'deposit',
      amount: amount,
      description: `Nạp tiền vào ví - ${paymentMethod}`,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      status: 'pending',
      balanceAfter: wallet.balance // Will be updated when confirmed
    });

    await transaction.save();

    // Prepare payment info based on method
    let paymentInfo = {};
    
    try {
      if (paymentMethod === 'bank_transfer') {
        paymentInfo = {
          type: 'bank_transfer',
          bankName: platformFee.bankAccount.bankName,
          accountNumber: platformFee.bankAccount.accountNumber,
          accountName: platformFee.bankAccount.accountName,
          amount: amount,
          description: `NAPVI ${paymentReference}`,
          qrCode: `https://img.vietqr.io/image/${platformFee.bankAccount.bankName}-${platformFee.bankAccount.accountNumber}-compact2.png?amount=${amount}&addInfo=NAPVI%20${paymentReference}&accountName=${encodeURIComponent(platformFee.bankAccount.accountName)}`
        };
      } else if (paymentMethod === 'momo') {
        paymentInfo = {
          type: 'momo',
          momoNumber: '0987654321', // Demo MoMo number
          amount: amount,
          description: `NAPVI ${paymentReference}`
        };
      } else if (paymentMethod === 'vnpay') {
        // VNPay integration
        const vnpayResult = vnpayService.createPaymentUrl({
          amount: amount,
          orderInfo: `Nap vi ${paymentReference}`,
          txnRef: paymentReference,
          ipAddr: req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1'
        });
        
        paymentInfo = {
          type: 'vnpay',
          paymentUrl: vnpayResult.paymentUrl,
          amount: amount,
          description: `Wallet top-up ${paymentReference}`,
          txnRef: paymentReference
        };
      } else if (paymentMethod === 'zalopay') {
        // ZaloPay integration  
        const zaloPayResult = await zalopayService.createOrder({
          amount: amount,
          description: `Wallet top-up ${paymentReference}`,
          app_trans_id: `${Date.now()}_${paymentReference}`
        });
        
        if (zaloPayResult.return_code === 1) {
          paymentInfo = {
            type: 'zalopay',
            paymentUrl: zaloPayResult.order_url,
            amount: amount,
            description: `Wallet top-up ${paymentReference}`,
            app_trans_id: zaloPayResult.app_trans_id,
            zp_trans_token: zaloPayResult.zp_trans_token
          };
        } else {
          throw new Error('Không thể create đơn hàng ZaloPay: ' + zaloPayResult.return_message);
        }
      } else if (paymentMethod === 'stripe') {
        // Stripe integration
        const stripeResult = await stripeService.createCheckoutSession({
          amount: amount,
          description: `Wallet top-up ${paymentReference}`,
          success_url: `${req.protocol}://${req.get('host')}/api/wallet/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.protocol}://${req.get('host')}/api/wallet/stripe-cancel`,
          metadata: {
            payment_reference: paymentReference,
            worker_id: workerId.toString()
          }
        });
        
        paymentInfo = {
          type: 'stripe',
          paymentUrl: stripeResult.checkout_url,
          amount: amount,
          description: `Wallet top-up ${paymentReference}`,
          session_id: stripeResult.session_id
        };
      } else if (paymentMethod === 'card') {
        // Generic card payment (fallback)
        paymentInfo = {
          type: 'card',
          paymentGateway: 'Manual',
          amount: amount,
          description: `Wallet top-up ${paymentReference}`,
          requiresManualConfirmation: true
        };
      }
    } catch (paymentError) {
      console.error('Payment gateway error:', paymentError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi connection đến cổng thanh toán: ' + paymentError.message
      });
    }

    res.json({
      success: true,
      message: 'Tạo yêu cầu nạp tiền successful',
      data: {
        transaction: {
          id: transaction._id,
          amount: amount,
          paymentMethod: paymentMethod,
          paymentReference: paymentReference,
          status: 'pending'
        },
        paymentInfo
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Confirm deposit (webhook or manual admin action)
exports.confirmDeposit = async (req, res) => {
  try {
    const { transactionId, paymentReference } = req.body;
    
    // Find transaction
    let transaction;
    if (transactionId) {
      transaction = await Transaction.findById(transactionId);
    } else if (paymentReference) {
      transaction = await Transaction.findOne({ paymentReference, status: 'pending' });
    }

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy giao dịch' 
      });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Giao dịch đã được xác receive' 
      });
    }

    // Update transaction status (middleware will handle wallet balance update)
    transaction.status = 'completed';
    await transaction.save(); // This will trigger the pre-save middleware to update wallet

    const wallet = await Wallet.findById(transaction.wallet).populate('worker', 'name');

    res.json({
      success: true,
      message: 'Xác receive nạp tiền successful',
      data: {
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          balanceAfter: transaction.balanceAfter
        },
        wallet: {
          balance: wallet.balance,
          workerName: wallet.worker.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Deduct platform fee (called when booking is completed)
exports.deductPlatformFee = async (workerId, booking, finalPrice) => {
  try {
    // Get platform fee config
    const platformFee = await PlatformFee.findOne() || new PlatformFee();
    const feeAmount = Math.round(finalPrice * (platformFee.feePercentage / 100));

    // Get or create wallet
    let wallet = await Wallet.findOne({ worker: workerId });
    if (!wallet) {
      wallet = new Wallet({ worker: workerId });
      await wallet.save();
    }

    // Create deduction transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      type: 'deduct',
      amount: feeAmount,
      description: `Phí nền tảng ${platformFee.feePercentage}% - Đơn hàng #${booking._id}`,
      booking: booking._id,
      status: 'completed',
      balanceAfter: wallet.balance - feeAmount
    });

    await transaction.save(); // This will update wallet balance

    // Check if worker services need to be hidden (negative balance)
    const updatedWallet = await Wallet.findById(wallet._id);
    if (updatedWallet.balance < 0) {
      // Update worker status to indicate negative balance
      await User.findByIdAndUpdate(workerId, { 
        walletStatus: 'negative' 
      });
    }

    return {
      success: true,
      feeAmount,
      newBalance: updatedWallet.balance,
      isNegative: updatedWallet.balance < 0
    };
  } catch (error) {
    console.error('Error deducting platform fee:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get wallet statistics for admin
exports.getWalletStats = async (req, res) => {
  try {
    // Only admin can view stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Chỉ admin mới có thể xem thống kê' 
      });
    }

    const walletStats = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' },
          totalDeposited: { $sum: '$totalDeposited' },
          totalDeducted: { $sum: '$totalDeducted' },
          negativeWallets: {
            $sum: {
              $cond: [{ $lt: ['$balance', 0] }, 1, 0]
            }
          },
          totalWallets: { $sum: 1 }
        }
      }
    ]);

    const transactionStats = await Transaction.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        walletStats: walletStats[0] || {},
        transactionStats: transactionStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin: List all wallets
exports.getAllWallets = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Chỉ admin mới có thể xem danh sách ví' 
      });
    }

    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status === 'negative') {
      filter.balance = { $lt: 0 };
    } else if (status === 'positive') {
      filter.balance = { $gte: 0 };
    }

    const wallets = await Wallet.find(filter)
      .populate('worker', 'name phone status')
      .sort({ balance: 1 }) // Negative balances first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Wallet.countDocuments(filter);

    res.json({
      success: true,
      data: {
        wallets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin: Get platform fee configuration
exports.getPlatformFeeConfig = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Chỉ admin mới có thể xem cấu hình phí' 
      });
    }

    let platformFee = await PlatformFee.findOne();
    if (!platformFee) {
      platformFee = new PlatformFee();
      await platformFee.save();
    }

    res.json({
      success: true,
      data: {
        feePercentage: platformFee.feePercentage,
        minTopup: platformFee.minTopup,
        maxTopup: platformFee.maxTopup,
        bankAccount: platformFee.bankAccount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin: Update platform fee configuration
exports.updatePlatformFeeConfig = async (req, res) => {
  try {
    // Only admin can update
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Chỉ admin mới có thể update cấu hình phí' 
      });
    }

    const { 
      feePercentage, 
      minTopup, 
      maxTopup, 
      bankAccount 
    } = req.body;

    // Validation
    if (feePercentage !== undefined) {
      if (feePercentage < 0 || feePercentage > 100) {
        return res.status(400).json({ 
          success: false,
          message: 'Phí phải từ 0% đến 100%' 
        });
      }
    }

    if (minTopup !== undefined && maxTopup !== undefined) {
      if (minTopup >= maxTopup) {
        return res.status(400).json({ 
          success: false,
          message: 'Số tiền nạp tối thiểu phải nhỏ hơn số tiền tối đa' 
        });
      }
    }

    let platformFee = await PlatformFee.findOne();
    if (!platformFee) {
      platformFee = new PlatformFee();
    }

    // Update only provided fields
    if (feePercentage !== undefined) {
      platformFee.feePercentage = feePercentage;
    }
    if (minTopup !== undefined) {
      platformFee.minTopup = minTopup;
    }
    if (maxTopup !== undefined) {
      platformFee.maxTopup = maxTopup;
    }
    if (bankAccount) {
      if (bankAccount.bankName !== undefined) {
        platformFee.bankAccount.bankName = bankAccount.bankName;
      }
      if (bankAccount.accountNumber !== undefined) {
        platformFee.bankAccount.accountNumber = bankAccount.accountNumber;
      }
      if (bankAccount.accountName !== undefined) {
        platformFee.bankAccount.accountName = bankAccount.accountName;
      }
    }

    await platformFee.save();

    console.log('💰 Platform fee config updated by admin:', {
      adminId: req.user.id,
      changes: req.body
    });

    res.json({
      success: true,
      message: 'Cập nhật cấu hình successful',
      data: {
        feePercentage: platformFee.feePercentage,
        minTopup: platformFee.minTopup,
        maxTopup: platformFee.maxTopup,
        bankAccount: platformFee.bankAccount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// VNPay return URL handler
exports.vnpayReturn = async (req, res) => {
  try {
    const vnpayResult = vnpayService.verifyReturnUrl(req.query);
    
    if (vnpayResult.success) {
      // Find existing transaction or create new one
      const paymentReference = vnpayResult.txnRef;
      const amount = vnpayResult.amount / 100; // VNPay amount is in cents
      
      // Try to find existing transaction first
      let transaction = await Transaction.findOne({ paymentReference, status: 'pending' });
      
      if (transaction) {
        // Update existing transaction
        const wallet = await Wallet.findById(transaction.wallet);
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposited += amount;
          await wallet.save();
          
          transaction.status = 'completed';
          transaction.balanceAfter = wallet.balance;
          transaction.externalRef = vnpayResult.transactionNo;
          await transaction.save();
        }
      } else {
        // Create new transaction if not found (fallback)
        const workerId = paymentReference.split('_')[2];
        const wallet = await Wallet.findOne({ worker: workerId });
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposited += amount;
          
          const newTransaction = new Transaction({
            wallet: wallet._id,
            type: 'deposit',
            amount: amount,
            description: `VNPay deposit - ${paymentReference}`,
            status: 'completed',
            paymentMethod: 'vnpay',
            paymentReference: paymentReference,
            externalRef: vnpayResult.transactionNo,
            balanceAfter: wallet.balance
          });
          
          await wallet.save();
          await newTransaction.save();
        }
      }
      
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-success?amount=${amount}&method=vnpay`);
    } else {
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-error?reason=payment_failed`);
    }
  } catch (error) {
    console.error('VNPay return error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-error?reason=system_error`);
  }
};

// VNPay IPN handler
exports.vnpayIPN = async (req, res) => {
  try {
    const vnpayResult = vnpayService.verifyReturnUrl(req.body);
    
    if (vnpayResult.success) {
      res.json({ RspCode: '00', Message: 'Success' });
    } else {
      res.json({ RspCode: '97', Message: 'Checksum failed' });
    }
  } catch (error) {
    console.error('VNPay IPN error:', error);
    res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// ZaloPay callback handler
exports.zalopayCallback = async (req, res) => {
  try {
    const zalopayResult = zalopayService.verifyCallback(req.body);
    
    if (zalopayResult.success) {
      // Process the successful payment
      const { app_trans_id, amount } = req.body;
      
      // Extract payment reference from app_trans_id
      const paymentReference = app_trans_id.split('_')[1];
      
      // Try to find existing transaction first
      let transaction = await Transaction.findOne({ paymentReference, status: 'pending' });
      
      if (transaction) {
        // Update existing transaction
        const wallet = await Wallet.findById(transaction.wallet);
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposited += amount;
          await wallet.save();
          
          transaction.status = 'completed';
          transaction.balanceAfter = wallet.balance;
          transaction.externalRef = app_trans_id;
          await transaction.save();
        }
      } else {
        // Create new transaction if not found (fallback)
        const workerId = paymentReference.split('_')[2];
        const wallet = await Wallet.findOne({ worker: workerId });
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposited += amount;
          
          const newTransaction = new Transaction({
            wallet: wallet._id,
            type: 'deposit',
            amount: amount,
            description: `ZaloPay deposit - ${paymentReference}`,
            status: 'completed',
            paymentMethod: 'zalopay',
            paymentReference: paymentReference,
            externalRef: app_trans_id,
            balanceAfter: wallet.balance
          });
          
          await wallet.save();
          await newTransaction.save();
        }
      }
      
      res.json({ return_code: 1, return_message: 'Success' });
    } else {
      res.json({ return_code: -1, return_message: 'Verification failed' });
    }
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    res.json({ return_code: 0, return_message: 'Error' });
  }
};

// Stripe webhook handler
exports.stripeWebhook = async (req, res) => {
  try {
    const event = stripeService.constructWebhookEvent(req.body, req.headers['stripe-signature']);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { payment_reference, worker_id } = session.metadata;
      const amount = session.amount_total / 100; // Stripe amount is in cents
      
      // Try to find existing transaction first
      let transaction = await Transaction.findOne({ paymentReference: payment_reference, status: 'pending' });
      
      if (transaction) {
        // Update existing transaction
        const wallet = await Wallet.findById(transaction.wallet);
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposited += amount;
          await wallet.save();
          
          transaction.status = 'completed';
          transaction.balanceAfter = wallet.balance;
          transaction.externalRef = session.payment_intent;
          await transaction.save();
        }
      } else {
        // Create new transaction if not found (fallback)
        const wallet = await Wallet.findOne({ worker: worker_id });
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposited += amount;
          
          const newTransaction = new Transaction({
            wallet: wallet._id,
            type: 'deposit',
            amount: amount,
            description: `Stripe deposit - ${payment_reference}`,
            status: 'completed',
            paymentMethod: 'stripe',
            paymentReference: payment_reference,
            externalRef: session.payment_intent,
            balanceAfter: wallet.balance
          });
          
          await wallet.save();
          await newTransaction.save();
        }
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Stripe success page
exports.stripeSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (session_id) {
      const session = await stripeService.retrieveCheckoutSession(session_id);
      const amount = session.amount_total / 100;
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-success?amount=${amount}&method=stripe`);
    } else {
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-error?reason=invalid_session`);
    }
  } catch (error) {
    console.error('Stripe success error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-error?reason=system_error`);
  }
};

// Stripe cancel page  
exports.stripeCancel = async (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet-error?reason=cancelled`);
};

// Admin endpoint to confirm all pending transactions (for fixing data)
exports.confirmAllPendingTransactions = async (req, res) => {
  try {
    const pendingTransactions = await Transaction.find({ status: 'pending' })
      .populate('wallet')
      .populate({
        path: 'wallet',
        populate: {
          path: 'worker',
          select: 'name'
        }
      });

    let processedCount = 0;
    let errors = [];

    for (let transaction of pendingTransactions) {
      try {
        if (!transaction.wallet) {
          errors.push(`Transaction ${transaction._id} has no wallet`);
          continue;
        }

        transaction.status = 'completed';
        await transaction.save(); // This will trigger middleware to update wallet
        processedCount++;
      } catch (error) {
        errors.push(`Transaction ${transaction._id}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Đã xác receive ${processedCount} giao dịch successful`,
      data: {
        processedCount,
        totalFound: pendingTransactions.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getWallet: exports.getWallet,
  createDepositRequest: exports.createDepositRequest,
  confirmDeposit: exports.confirmDeposit,
  deductPlatformFee: exports.deductPlatformFee,
  getWalletStats: exports.getWalletStats,
  getAllWallets: exports.getAllWallets,
  getPlatformFeeConfig: exports.getPlatformFeeConfig,
  updatePlatformFeeConfig: exports.updatePlatformFeeConfig,
  vnpayReturn: exports.vnpayReturn,
  vnpayIPN: exports.vnpayIPN,
  zalopayCallback: exports.zalopayCallback,
  stripeWebhook: exports.stripeWebhook,
  stripeSuccess: exports.stripeSuccess,
  stripeCancel: exports.stripeCancel,
  confirmAllPendingTransactions: exports.confirmAllPendingTransactions
};
