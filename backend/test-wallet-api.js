const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

/**


 * TODO: Add function description


 */


async function testWalletAPI() {
  console.log('🧪 Testing Wallet API Response Format');
  
  try {
    // Connect to database to get a worker token
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a worker to get token
    const User = require('./models/User');
    const jwt = require('jsonwebtoken');
    
    const worker = await User.findOne({ role: 'worker' });
    if (!worker) {
      console.log('❌ No worker found');
      return;
    }

    // Generate token for testing
    const token = jwt.sign(
      { id: worker._id, role: worker.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log(`👤 Testing with worker: ${worker.name}`);

    // Test wallet API
    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5000/api/wallet',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('📊 API Response Structure:');
    console.log('- success:', response.data.success);
    console.log('- data keys:', Object.keys(response.data.data || {}));

    if (response.data.data) {
      const walletData = response.data.data.wallet;
      const transactions = response.data.data.transactions;
      const platformFee = response.data.data.platformFee;

      console.log('\n💰 Wallet data:');
      if (walletData) {
        console.log('  - balance type:', typeof walletData.balance, '=', walletData.balance);
        console.log('  - totalDeposited type:', typeof walletData.totalDeposited, '=', walletData.totalDeposited);
        console.log('  - isNegative type:', typeof walletData.isNegative, '=', walletData.isNegative);
      }

      console.log('\n📝 Transactions:');
      if (Array.isArray(transactions)) {
        console.log('  - transactions count:', transactions.length);
        if (transactions.length > 0) {
          const firstTx = transactions[0];
          console.log('  - first transaction keys:', Object.keys(firstTx));
          console.log('  - amount type:', typeof firstTx.amount, '=', firstTx.amount);
          console.log('  - type field:', typeof firstTx.type, '=', firstTx.type);
        }
      } else {
        console.log('  - transactions is not array:', typeof transactions);
      }

      console.log('\n🏦 Platform fee:');
      if (platformFee) {
        console.log('  - feePercentage type:', typeof platformFee.feePercentage, '=', platformFee.feePercentage);
        console.log('  - bankAccount:', platformFee.bankAccount);
      }
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📡 Response status:', error.response.status);
      console.error('📡 Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
  }
}

testWalletAPI();