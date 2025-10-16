const mongoose = require('mongoose');
const { Wallet, Transaction, PlatformFee } = require('./models/Wallet');
const User = require('./models/User');
require('dotenv').config();

// Test wallet system functionality
/**

 * TODO: Add function description

 */

async function testWalletSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test worker
    let testWorker = await User.findOne({ role: 'worker' });
    if (!testWorker) {
      console.log('❌ No worker found in database. Please create a worker first.');
      return;
    }
    
    console.log(`📋 Testing with worker: ${testWorker.name} (ID: ${testWorker._id})`);

    // Get or create wallet
    let wallet = await Wallet.findOne({ worker: testWorker._id });
    if (!wallet) {
      wallet = new Wallet({ worker: testWorker._id });
      await wallet.save();
      console.log('✅ Created new wallet for worker');
    }

    console.log(`💰 Current wallet balance: ${wallet.balance} VND`);
    console.log(`👤 Worker wallet status: ${testWorker.walletStatus || 'undefined'}`);

    // Test 1: Deposit money
    console.log('\n🧪 Test 1: Deposit 200,000 VND');
    const depositTransaction = new Transaction({
      wallet: wallet._id,
      type: 'deposit',
      amount: 200000,
      description: 'Test deposit - Bank transfer',
      paymentMethod: 'bank_transfer',
      status: 'completed',
      balanceAfter: wallet.balance + 200000
    });
    await depositTransaction.save();
    
    // Refresh wallet and worker data
    wallet = await Wallet.findById(wallet._id);
    testWorker = await User.findById(testWorker._id);
    console.log(`✅ Deposit completed. New balance: ${wallet.balance} VND`);
    console.log(`👤 Worker wallet status: ${testWorker.walletStatus}`);

    // Test 2: Deduct platform fee
    console.log('\n🧪 Test 2: Deduct platform fee (20% of 150,000 = 30,000 VND)');
    const deductTransaction = new Transaction({
      wallet: wallet._id,
      type: 'deduct',
      amount: 30000,
      description: 'Platform fee 20% - Test booking',
      status: 'completed',
      balanceAfter: wallet.balance - 30000
    });
    await deductTransaction.save();
    
    // Refresh wallet and worker data
    wallet = await Wallet.findById(wallet._id);
    testWorker = await User.findById(testWorker._id);
    console.log(`✅ Fee deducted. New balance: ${wallet.balance} VND`);
    console.log(`👤 Worker wallet status: ${testWorker.walletStatus}`);

    // Test 3: Make balance negative
    console.log('\n🧪 Test 3: Deduct large amount to make balance negative');
    const largeDeductTransaction = new Transaction({
      wallet: wallet._id,
      type: 'deduct',
      amount: wallet.balance + 50000, // Make it negative
      description: 'Large platform fee - Test negative balance',
      status: 'completed',
      balanceAfter: wallet.balance - (wallet.balance + 50000)
    });
    await largeDeductTransaction.save();
    
    // Refresh wallet and worker data
    wallet = await Wallet.findById(wallet._id);
    testWorker = await User.findById(testWorker._id);
    console.log(`✅ Large deduction completed. New balance: ${wallet.balance} VND`);
    console.log(`👤 Worker wallet status: ${testWorker.walletStatus}`);

    // Test 4: Top up to make positive again
    console.log('\n🧪 Test 4: Top up to make balance positive again');
    const topupTransaction = new Transaction({
      wallet: wallet._id,
      type: 'deposit',
      amount: 100000,
      description: 'Recovery deposit - MoMo payment',
      paymentMethod: 'momo',
      status: 'completed',
      balanceAfter: wallet.balance + 100000
    });
    await topupTransaction.save();
    
    // Refresh wallet and worker data
    wallet = await Wallet.findById(wallet._id);
    testWorker = await User.findById(testWorker._id);
    console.log(`✅ Recovery deposit completed. New balance: ${wallet.balance} VND`);
    console.log(`👤 Worker wallet status: ${testWorker.walletStatus}`);

    // Show transaction history
    console.log('\n📊 Transaction History:');
    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    transactions.forEach(tx => {
      console.log(`${tx.type.toUpperCase()}: ${tx.amount} VND - ${tx.description} (Balance after: ${tx.balanceAfter})`);
    });

    console.log('\n✅ All wallet system tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testWalletSystem();