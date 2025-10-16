const axios = require('axios');

// Test payment integration
/**

 * TODO: Add function description

 */

async function testPaymentIntegration() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Payment Gateway Integration...\n');

  // First, test if server is running
  try {
    const healthCheck = await axios.get(`${baseURL}/health`);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    return;
  }

  // You'll need a valid JWT token for these tests
  const authToken = 'YOUR_JWT_TOKEN_HERE';
  
  if (authToken === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n⚠️  To run full tests, update the authToken variable with a valid JWT token');
    console.log('   You can get one by logging in through the mobile app or creating a test user\n');
  }

  // Test different payment methods
  const paymentMethods = [
    'bank_transfer',
    'momo', 
    'vnpay',
    'zalopay',
    'stripe'
  ];

  for (const method of paymentMethods) {
    console.log(`\n🔄 Testing ${method} payment...`);
    
    try {
      const response = await axios.post(`${baseURL}/wallet/deposit`, {
        amount: 100000,
        paymentMethod: method
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ ${method} - Payment request created successfully`);
      
      if (response.data.data && response.data.data.paymentInfo) {
        const paymentInfo = response.data.data.paymentInfo;
        
        if (paymentInfo.type === 'bank_transfer') {
          console.log(`   💳 Bank: ${paymentInfo.bankName}`);
          console.log(`   📱 QR Code available: ${paymentInfo.qrCode ? 'Yes' : 'No'}`);
        } else if (paymentInfo.type === 'vnpay') {
          console.log(`   🔗 Payment URL: ${paymentInfo.paymentUrl ? 'Generated' : 'Failed'}`);
        } else if (paymentInfo.type === 'zalopay') {
          console.log(`   🔗 Payment URL: ${paymentInfo.paymentUrl ? 'Generated' : 'Failed'}`);
        } else if (paymentInfo.type === 'stripe') {
          console.log(`   🔗 Checkout URL: ${paymentInfo.paymentUrl ? 'Generated' : 'Failed'}`);
        }
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${method} - Error: ${error.response.data.message || error.response.statusText}`);
        
        // Check if it's an authentication error
        if (error.response.status === 401) {
          console.log(`   🔑 Authentication required - update authToken variable`);
        }
      } else {
        console.log(`❌ ${method} - Network Error: ${error.message}`);
      }
    }
  }

  console.log('\n📋 Test Summary:');
  console.log('- Bank Transfer: Always works (no external dependencies)');
  console.log('- MoMo: Demo mode (always works)');
  console.log('- VNPay: Uses sandbox credentials');
  console.log('- ZaloPay: Uses sandbox credentials'); 
  console.log('- Stripe: Needs valid API keys in .env');
  console.log('\n✨ Payment integration test completed!');
}

// Run tests
testPaymentIntegration().catch(console.error);