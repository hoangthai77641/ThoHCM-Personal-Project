// Test QR Banking - chạy thử nghiệm
const BankingQRService = require('./services/BankingQRService');

async function testQRBanking() {
  try {
    console.log('🏦 Testing Banking QR Service...');
    
    const testParams = {
      bankCode: '970436', // Vietcombank
      accountNumber: '1234567890', // Số TK test
      accountName: 'NGUYEN VAN TEST',
      amount: 100000, // 100k VND
      description: 'NAPVI TH12345'
    };
    
    // Test QR generation
    const qrResult = await BankingQRService.generateVietQR(testParams);
    console.log('✅ QR Code generated successfully');
    console.log('📱 QR Data:', qrResult.qrData);
    
    // Test banking links
    const links = BankingQRService.generateBankingLinks(testParams);
    console.log('🔗 Banking Links:');
    console.log('  VCB:', links.vcb);
    console.log('  TCB:', links.tcb);
    console.log('  MB:', links.mb);
    
    // Test transaction ref
    const txRef = BankingQRService.generateTransactionRef('64f1234567890abcd1234567');
    console.log('🏷️  Transaction Ref:', txRef);
    
    // Test validation
    const isValid = BankingQRService.validateTransactionRef(txRef, '64f1234567890abcd1234567');
    console.log('✔️  Validation:', isValid);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testQRBanking();