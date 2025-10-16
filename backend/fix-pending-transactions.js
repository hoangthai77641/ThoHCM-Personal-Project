const mongoose = require('mongoose');
const { Wallet, Transaction, PlatformFee } = require('./models/Wallet');
const User = require('./models/User');

// Fix pending transactions
/**

 * TODO: Add function description

 */

async function fixPendingTransactions() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/thohcm');
    console.log('✅ Connected to MongoDB');

    // Find all pending transactions
    const pendingTransactions = await Transaction.find({ status: 'pending' })
      .populate('wallet')
      .populate({
        path: 'wallet',
        populate: {
          path: 'worker',
          select: 'name'
        }
      });

    console.log(`🔍 Found ${pendingTransactions.length} pending transactions`);

    for (let transaction of pendingTransactions) {
      if (!transaction.wallet) {
        console.log(`⚠️ Transaction ${transaction._id} has no wallet, skipping`);
        continue;
      }

      console.log(`\n🔄 Processing transaction ${transaction._id}:`);
      console.log(`   Worker: ${transaction.wallet.worker?.name || 'Unknown'}`);
      console.log(`   Amount: ${transaction.amount} VND`);
      console.log(`   Type: ${transaction.type}`);
      console.log(`   Payment Method: ${transaction.paymentMethod}`);
      console.log(`   Current wallet balance: ${transaction.wallet.balance} VND`);

      // Confirm the transaction
      transaction.status = 'completed';
      await transaction.save(); // This will trigger middleware to update wallet

      // Refresh wallet to see updated balance
      const updatedWallet = await Wallet.findById(transaction.wallet._id);
      console.log(`   ✅ Updated wallet balance: ${updatedWallet.balance} VND`);
      console.log(`   📊 Updated total deposited: ${updatedWallet.totalDeposited} VND`);
    }

    console.log(`\n✅ Processed ${pendingTransactions.length} transactions successfully!`);

    // Show final wallet states
    const wallets = await Wallet.find().populate('worker', 'name');
    console.log('\n💰 Final wallet states:');
    for (let wallet of wallets) {
      console.log(`${wallet.worker?.name || 'Unknown'}: Balance ${wallet.balance} VND, Total Deposited ${wallet.totalDeposited} VND`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixPendingTransactions();