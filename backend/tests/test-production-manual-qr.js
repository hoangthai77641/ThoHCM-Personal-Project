const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Production URL - Cập nhật URL production của bạn
const PRODUCTION_URL = 'https://your-production-domain.com/api/wallet';
// Hoặc nếu deploy trên Google Cloud Run, Heroku, etc.

const TEST_CONFIG = {
  productionUrl: PRODUCTION_URL,
  workerCredentials: {
    phone: '', // Nhập số điện thoại worker test
    password: '' // Nhập password worker test  
  },
  adminCredentials: {
    phone: '', // Nhập số điện thoại admin
    password: '' // Nhập password admin
  },
  testImagePath: path.join(__dirname, 'test-proof-image.jpg'),
  workerToken: '',
  adminToken: ''
};

console.log('🚀 Testing Manual QR Banking System on PRODUCTION');
console.log('Production URL:', TEST_CONFIG.productionUrl);
console.log('='.repeat(60));

// Helper: Login and get JWT token
async function login(credentials, userType) {
  console.log(`\n🔐 Logging in as ${userType}...`);
  
  try {
    const response = await axios.post(`${TEST_CONFIG.productionUrl.replace('/wallet', '')}/auth/login`, {
      phone: credentials.phone,
      password: credentials.password
    });

    if (response.data.success && response.data.token) {
      console.log(`✅ ${userType} login successful`);
      return response.data.token;
    } else {
      console.log(`❌ ${userType} login failed:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${userType} login error:`, error.response?.data || error.message);
    return null;
  }
}

// Test 1: Create manual deposit request
async function testCreateManualDeposit() {
  console.log('\n1️⃣ Testing manual deposit creation on production...');
  
  try {
    const response = await axios.post(`${TEST_CONFIG.productionUrl}/deposit`, {
      amount: 50000, // Test với số tiền nhỏ
      paymentMethod: 'manual_qr'
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.workerToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Manual deposit created successfully on production');
    console.log('Transaction ID:', response.data.transactionId);
    console.log('QR Data:', response.data.qrData ? 'Generated ✅' : 'Not generated ❌');
    console.log('Bank Info:');
    console.log('  - Bank:', response.data.bankInfo?.bankName);
    console.log('  - Account:', response.data.bankInfo?.accountNumber);
    console.log('  - Account Name:', response.data.bankInfo?.accountName);
    console.log('  - Transfer Content:', response.data.bankInfo?.transferContent);
    
    return response.data.transactionId;
  } catch (error) {
    console.log('❌ Error creating manual deposit on production:', error.response?.data || error.message);
    return null;
  }
}

// Test 2: Upload proof of payment
async function testUploadProof(transactionId) {
  console.log('\n2️⃣ Testing proof of payment upload on production...');
  
  // Create a dummy image file if it doesn't exist
  if (!fs.existsSync(TEST_CONFIG.testImagePath)) {
    console.log('Creating dummy test image...');
    const dummyImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE5, 0x27, 0xDE, 0xFC,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(TEST_CONFIG.testImagePath, dummyImageBuffer);
  }

  try {
    const formData = new FormData();
    formData.append('proofImage', fs.createReadStream(TEST_CONFIG.testImagePath));
    formData.append('transactionId', transactionId);

    const response = await axios.post(`${TEST_CONFIG.productionUrl}/upload-proof`, formData, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.workerToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Proof of payment uploaded successfully on production');
    console.log('File saved as:', response.data.fileName);
    return true;
  } catch (error) {
    console.log('❌ Error uploading proof on production:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Get pending manual deposits (admin)
async function testGetPendingDeposits() {
  console.log('\n3️⃣ Testing get pending manual deposits on production...');
  
  try {
    const response = await axios.get(`${TEST_CONFIG.productionUrl}/pending-manual-deposits`, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.adminToken}`
      }
    });

    console.log('✅ Retrieved pending deposits successfully from production');
    console.log(`Found ${response.data.pendingDeposits.length} pending deposits`);
    
    if (response.data.pendingDeposits.length > 0) {
      const deposit = response.data.pendingDeposits[0];
      console.log('Most recent pending deposit:');
      console.log('  - ID:', deposit._id);
      console.log('  - Transaction ID:', deposit.transactionId);
      console.log('  - Amount:', deposit.amount.toLocaleString('vi-VN') + ' VNĐ');
      console.log('  - Worker:', deposit.workerId?.name);
      console.log('  - Phone:', deposit.workerId?.phone);
      console.log('  - Created:', new Date(deposit.createdAt).toLocaleString('vi-VN'));
      console.log('  - Proof Image:', deposit.proofImage);
    }
    
    return response.data.pendingDeposits;
  } catch (error) {
    console.log('❌ Error getting pending deposits from production:', error.response?.data || error.message);
    return [];
  }
}

// Test 4: Check production server health
async function testServerHealth() {
  console.log('\n🏥 Testing production server health...');
  
  try {
    // Test basic API endpoint
    const healthUrl = TEST_CONFIG.productionUrl.replace('/wallet', '/health');
    const response = await axios.get(healthUrl);
    console.log('✅ Production server is healthy');
  } catch (error) {
    console.log('⚠️ Health check failed, trying wallet endpoint...');
    
    // Fallback: try wallet stats (requires admin auth)
    try {
      const response = await axios.get(`${TEST_CONFIG.productionUrl}/stats`, {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.adminToken}`
        }
      });
      console.log('✅ Production server responding (via wallet stats)');
    } catch (statsError) {
      console.log('❌ Production server not responding:', statsError.message);
    }
  }
}

// Main test runner for production
async function runProductionTests() {
  console.log('⚠️  PRODUCTION TESTING - Please be careful!');
  console.log('This will create real transactions on your production database.');
  
  // Validate configuration
  if (!TEST_CONFIG.productionUrl.startsWith('http')) {
    console.log('❌ Please set valid production URL in TEST_CONFIG.productionUrl');
    return;
  }
  
  if (!TEST_CONFIG.workerCredentials.phone || !TEST_CONFIG.adminCredentials.phone) {
    console.log('❌ Please set worker and admin credentials in TEST_CONFIG');
    return;
  }

  try {
    // Step 1: Login and get tokens
    TEST_CONFIG.workerToken = await login(TEST_CONFIG.workerCredentials, 'Worker');
    if (!TEST_CONFIG.workerToken) return;
    
    TEST_CONFIG.adminToken = await login(TEST_CONFIG.adminCredentials, 'Admin');
    if (!TEST_CONFIG.adminToken) return;

    // Step 2: Test server health
    await testServerHealth();

    // Step 3: Test manual deposit creation
    const transactionId = await testCreateManualDeposit();
    if (!transactionId) return;

    // Step 4: Test proof upload
    const uploadSuccess = await testUploadProof(transactionId);
    if (!uploadSuccess) return;

    // Step 5: Test admin pending deposits view
    const pendingDeposits = await testGetPendingDeposits();

    console.log('\n🎉 Production testing completed successfully!');
    console.log('📋 Summary:');
    console.log(`  - Created transaction: ${transactionId}`);
    console.log(`  - Upload proof: ${uploadSuccess ? '✅' : '❌'}`);
    console.log(`  - Pending deposits: ${pendingDeposits.length}`);
    console.log('\n💡 Next steps:');
    console.log('  1. Check admin dashboard to approve/reject the test transaction');
    console.log('  2. Verify wallet balance updates correctly after approval');
    console.log('  3. Test mobile app UI with these APIs');

  } catch (error) {
    console.log('\n💥 Production test suite failed:', error.message);
  }
}

// Configuration guide
function printUsageGuide() {
  console.log('\n📖 USAGE GUIDE:');
  console.log('1. Update TEST_CONFIG.productionUrl with your production URL');
  console.log('2. Set worker and admin credentials (phone + password)');
  console.log('3. Run: node test-production-manual-qr.js');
  console.log('\n🔧 Configuration:');
  console.log('- Production URL: Update PRODUCTION_URL constant');
  console.log('- Test credentials: Update workerCredentials and adminCredentials');
  console.log('- This will create REAL transactions on production!');
  console.log('\n⚠️  IMPORTANT:');
  console.log('- Test with small amounts (50,000 VNĐ)');
  console.log('- Have admin ready to approve test transactions');
  console.log('- Monitor production logs during testing');
}

// Check if we should run or just show guide
if (process.argv.includes('--run')) {
  runProductionTests();
} else {
  printUsageGuide();
  console.log('\n🚀 To run production tests: node test-production-manual-qr.js --run');
}

module.exports = { 
  runProductionTests, 
  TEST_CONFIG,
  login,
  testCreateManualDeposit,
  testUploadProof,
  testGetPendingDeposits
};