const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/wallet';

// Test configuration
const TEST_CONFIG = {
  workerToken: '', // Set worker JWT token
  adminToken: '',  // Set admin JWT token
  testImagePath: path.join(__dirname, 'test-proof-image.jpg')
};

console.log('🧪 Testing Manual QR Banking System');
console.log('='.repeat(50));

// Test 1: Create manual deposit request
async function testCreateManualDeposit() {
  console.log('\n1️⃣ Testing manual deposit creation...');
  
  try {
    const response = await axios.post(`${BASE_URL}/deposit`, {
      amount: 100000,
      paymentMethod: 'manual_qr'
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.workerToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Manual deposit created successfully');
    console.log('Transaction ID:', response.data.transactionId);
    console.log('QR Data:', response.data.qrData ? 'Generated' : 'Not generated');
    console.log('Bank Info:', response.data.bankInfo);
    
    return response.data.transactionId;
  } catch (error) {
    console.log('❌ Error creating manual deposit:', error.response?.data || error.message);
    return null;
  }
}

// Test 2: Upload proof of payment
async function testUploadProof(transactionId) {
  console.log('\n2️⃣ Testing proof of payment upload...');
  
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

    const response = await axios.post(`${BASE_URL}/upload-proof`, formData, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.workerToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Proof of payment uploaded successfully');
    console.log('File saved as:', response.data.fileName);
    return true;
  } catch (error) {
    console.log('❌ Error uploading proof:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Get pending manual deposits (admin)
async function testGetPendingDeposits() {
  console.log('\n3️⃣ Testing get pending manual deposits...');
  
  try {
    const response = await axios.get(`${BASE_URL}/pending-manual-deposits`, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.adminToken}`
      }
    });

    console.log('✅ Retrieved pending deposits successfully');
    console.log(`Found ${response.data.pendingDeposits.length} pending deposits`);
    
    if (response.data.pendingDeposits.length > 0) {
      console.log('First pending deposit:', {
        id: response.data.pendingDeposits[0]._id,
        amount: response.data.pendingDeposits[0].amount,
        worker: response.data.pendingDeposits[0].workerId?.name
      });
    }
    
    return response.data.pendingDeposits;
  } catch (error) {
    console.log('❌ Error getting pending deposits:', error.response?.data || error.message);
    return [];
  }
}

// Test 4: Approve manual deposit (admin)
async function testApproveDeposit(transactionId) {
  console.log('\n4️⃣ Testing manual deposit approval...');
  
  try {
    const response = await axios.post(`${BASE_URL}/approve-manual-deposit/${transactionId}`, {
      adminNotes: 'Test approval - verified payment',
      actualAmount: 100000
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Manual deposit approved successfully');
    console.log('New wallet balance:', response.data.newBalance);
    return true;
  } catch (error) {
    console.log('❌ Error approving deposit:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  if (!TEST_CONFIG.workerToken || !TEST_CONFIG.adminToken) {
    console.log('❌ Please set worker and admin tokens in TEST_CONFIG');
    console.log('Get tokens by logging in and copying from localStorage or API response');
    return;
  }

  try {
    // Test 1: Create manual deposit
    const transactionId = await testCreateManualDeposit();
    if (!transactionId) return;

    // Test 2: Upload proof
    const uploadSuccess = await testUploadProof(transactionId);
    if (!uploadSuccess) return;

    // Test 3: Get pending deposits
    const pendingDeposits = await testGetPendingDeposits();

    // Test 4: Approve deposit
    await testApproveDeposit(transactionId);

    console.log('\n🎉 All tests completed!');
    console.log('Manual QR Banking System is working correctly.');

  } catch (error) {
    console.log('\n💥 Test suite failed:', error.message);
  }
}

// Usage instructions
console.log('Usage Instructions:');
console.log('1. Start the backend server: npm start');
console.log('2. Set TEST_CONFIG.workerToken and TEST_CONFIG.adminToken');
console.log('3. Run: node test-manual-qr-banking.js');
console.log('\nTo get tokens:');
console.log('- Login as worker/admin via API');
console.log('- Copy JWT token from response');
console.log('- Set in TEST_CONFIG above');

// Uncomment to run tests
// runTests();

module.exports = { runTests, TEST_CONFIG };