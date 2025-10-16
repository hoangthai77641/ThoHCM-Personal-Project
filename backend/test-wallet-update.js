const mongoose = require('mongoose');
const { Wallet, Transaction, PlatformFee } = require('./models/Wallet');
const User = require('./models/User');

// Test wallet balance update
/**

 * TODO: Add function description

 */

async function testWalletUpdate() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/thohcm');
    console.log('✅ Connected to MongoDB');

    // Find a test worker
    const worker = await User.findOne({ role: 'worker' });
    if (!worker) {
      console.log('❌ No worker found for testing');
      return;
    }

    console.log(`🧪 Testing with worker: ${worker.name} (${worker._id})`);

    // Get or create wallet
    let wallet = await Wallet.findOne({ worker: worker._id });
    if (!wallet) {
      wallet = new Wallet({ worker: worker._id });
      await wallet.save();
    }

    console.log(`💰 Initial balance: ${wallet.balance} VND`);
    console.log(`📊 Total deposited: ${wallet.totalDeposited} VND`);

    // Create a test deposit transaction
    const testAmount = 100000;
    const paymentReference = 'TEST_' + Date.now();
    
    const transaction = new Transaction({
      wallet: wallet._id,
      type: 'deposit',
      amount: testAmount,
      description: `Test deposit - ${paymentReference}`,
      paymentMethod: 'bank_transfer',
      paymentReference: paymentReference,
      status: 'pending',
      balanceAfter: wallet.balance
    });

    await transaction.save();
    console.log(`📝 Created pending transaction: ${testAmount} VND`);

    // Simulate confirming the transaction
    transaction.status = 'completed';
    await transaction.save();
    
    // Refresh wallet to see updated balance
    wallet = await Wallet.findById(wallet._id);
    
    console.log(`💰 Final balance: ${wallet.balance} VND`);
    console.log(`📊 Total deposited: ${wallet.totalDeposited} VND`);
    console.log(`🔄 Transaction balance after: ${transaction.balanceAfter} VND`);

    if (wallet.balance >= testAmount && wallet.totalDeposited >= testAmount) {
      console.log('✅ Wallet update test PASSED');
    } else {
      console.log('❌ Wallet update test FAILED');
      console.log('Expected balance increase:', testAmount);
      console.log('Actual balance:', wallet.balance);
    }

    // Get recent transactions for this wallet
    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n📋 Recent transactions:');
    transactions.forEach((t, i) => {
      console.log(`${i + 1}. ${t.type} - ${t.amount} VND - ${t.status} - Balance after: ${t.balanceAfter}`);
    });

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testWalletUpdate();