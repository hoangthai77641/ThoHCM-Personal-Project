// Test QR Banking với thông tin thật của NGUYEN HOANG THAI
const BankingQRService = require('./services/BankingQRService');

async function testRealBankingQR() {
  try {
    console.log('🏦 Testing Banking QR với thông tin thật...');
    console.log('👤 Chủ TK: NGUYEN HOANG THAI');
    console.log('🏪 Ngân hàng: Vietcombank');
    console.log('💳 STK: 0441000765886');
    console.log('');
    
    const realParams = {
      bankCode: '970436', // Vietcombank
      accountNumber: '0441000765886', // STK thật của bạn
      accountName: 'NGUYEN HOANG THAI', // Tên thật
      amount: 500000, // Test với 500k VND
      description: 'NAPVI TH876543'
    };
    
    // Test QR generation
    const qrResult = await BankingQRService.generateVietQR(realParams);
    console.log('✅ QR Code generated successfully!');
    console.log('📱 QR Data:', qrResult.qrData);
    console.log('');
    
    // Test VietQR URL (official Vietnam QR service)
    const vietQRUrl = `https://img.vietqr.io/image/970436-0441000765886-compact2.png?amount=${realParams.amount}&addInfo=${encodeURIComponent(realParams.description)}&accountName=${encodeURIComponent(realParams.accountName)}`;
    console.log('🌐 VietQR URL:');
    console.log(vietQRUrl);
    console.log('');
    
    // Test banking app deep links
    const links = BankingQRService.generateBankingLinks(realParams);
    console.log('📱 Banking App Links:');
    console.log('  Vietcombank:', links.vcb);
    console.log('  Techcombank:', links.tcb);
    console.log('  MBBank:', links.mb);
    console.log('');
    
    // Test transaction reference generation
    const txRef = BankingQRService.generateTransactionRef('64f1234567890abcd1234567');
    console.log('🏷️  Sample Transaction Ref:', txRef);
    
    // Test validation
    const isValid = BankingQRService.validateTransactionRef(txRef, '64f1234567890abcd1234567');
    console.log('✔️  Reference Validation:', isValid ? 'PASS' : 'FAIL');
    console.log('');
    
    // Sample payment instructions
    console.log('📋 Hướng dẫn thanh toán cho khách hàng:');
    console.log('1. Quét QR code bằng app Vietcombank hoặc app ngân hàng khác');
    console.log('2. Hoặc chuyển khoản thủ công:');
    console.log(`   - Ngân hàng: ${realParams.accountName}`);
    console.log(`   - STK: ${realParams.accountNumber}`);
    console.log(`   - Tên: ${realParams.accountName}`);
    console.log(`   - Số tiền: ${realParams.amount.toLocaleString('vi-VN')} VNĐ`);
    console.log(`   - Nội dung: ${realParams.description}`);
    console.log('3. Chờ hệ thống xác nhận tự động (1-5 phút)');
    console.log('');
    
    console.log('🎉 Banking QR System ready for production!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testRealBankingQR();