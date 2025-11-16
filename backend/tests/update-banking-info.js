// Script cập nhật thông tin ngân hàng thật vào database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { PlatformFee } = require('./models/Wallet');

async function updateBankingInfo() {
  try {
    // Kết nối MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thohcm';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Tìm hoặc tạo mới PlatformFee config
    let platformFee = await PlatformFee.findOne();
    if (!platformFee) {
      platformFee = new PlatformFee();
      console.log('📄 Creating new PlatformFee configuration');
    } else {
      console.log('📄 Updating existing PlatformFee configuration');
    }

    // Cập nhật thông tin ngân hàng thật
    platformFee.bankAccount = {
      bankName: 'Vietcombank',
      bankCode: '970436',
      accountNumber: '0441000765886',
      accountName: 'NGUYEN HOANG THAI'
    };

    // Cập nhật cấu hình phí và giới hạn nạp tiền
    platformFee.feePercentage = 20; // 20% phí platform
    platformFee.minTopup = 50000;   // Tối thiểu 50k
    platformFee.maxTopup = 2000000; // Tối đa 2M

    await platformFee.save();
    console.log('✅ Banking information updated successfully!');
    
    console.log('');
    console.log('🏦 New Banking Configuration:');
    console.log('  Bank:', platformFee.bankAccount.bankName);
    console.log('  Account:', platformFee.bankAccount.accountNumber);
    console.log('  Name:', platformFee.bankAccount.accountName);
    console.log('  Code:', platformFee.bankAccount.bankCode);
    console.log('');
    console.log('💰 Fee Configuration:');
    console.log('  Platform Fee:', platformFee.feePercentage + '%');
    console.log('  Min Topup:', platformFee.minTopup.toLocaleString('vi-VN') + ' VNĐ');
    console.log('  Max Topup:', platformFee.maxTopup.toLocaleString('vi-VN') + ' VNĐ');
    console.log('');
    console.log('🎉 System ready to accept real payments!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('📤 Database connection closed');
  }
}

// Chạy script
updateBankingInfo();