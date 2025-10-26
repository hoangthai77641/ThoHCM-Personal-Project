#!/usr/bin/env node

/**
 * Script test ZaloPay credentials
 * Chạy sau khi nhận được app_id, key1, key2 từ ZaloPay
 */

const crypto = require('crypto');
const axios = require('axios');

// Test credentials (thay thế bằng credentials thật khi nhận được)
const TEST_CONFIG = {
  app_id: process.env.ZALOPAY_APP_ID || 'YOUR_REAL_APP_ID',
  key1: process.env.ZALOPAY_KEY1 || 'YOUR_REAL_KEY1', 
  key2: process.env.ZALOPAY_KEY2 || 'YOUR_REAL_KEY2',
  endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn'
};

class ZaloPayTester {
  
  static validateCredentials() {
    console.log('🔍 Checking ZaloPay credentials...\n');
    
    const issues = [];
    
    // Check APP_ID
    if (!TEST_CONFIG.app_id || TEST_CONFIG.app_id === 'YOUR_REAL_APP_ID') {
      issues.push('❌ APP_ID chưa được cập nhật');
    } else {
      console.log('✅ APP_ID:', TEST_CONFIG.app_id);
    }
    
    // Check KEY1
    if (!TEST_CONFIG.key1 || TEST_CONFIG.key1 === 'YOUR_REAL_KEY1') {
      issues.push('❌ KEY1 chưa được cập nhật');
    } else {
      console.log('✅ KEY1 length:', TEST_CONFIG.key1.length, 'chars');
    }
    
    // Check KEY2  
    if (!TEST_CONFIG.key2 || TEST_CONFIG.key2 === 'YOUR_REAL_KEY2') {
      issues.push('❌ KEY2 chưa được cập nhật');
    } else {
      console.log('✅ KEY2 length:', TEST_CONFIG.key2.length, 'chars');
    }
    
    console.log('🌐 Endpoint:', TEST_CONFIG.endpoint);
    
    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(issue));
      return false;
    }
    
    console.log('\n✅ All credentials look good!');
    return true;
  }
  
  static testMACGeneration() {
    console.log('\n🔐 Testing MAC signature generation...\n');
    
    // Test data
    const testData = 'test_string_for_mac';
    
    try {
      // Generate MAC với KEY1
      const mac1 = crypto.createHmac('sha256', TEST_CONFIG.key1)
        .update(testData)
        .digest('hex');
      console.log('✅ MAC with KEY1:', mac1);
      
      // Generate MAC với KEY2  
      const mac2 = crypto.createHmac('sha256', TEST_CONFIG.key2)
        .update(testData)
        .digest('hex');
      console.log('✅ MAC with KEY2:', mac2);
      
      return true;
    } catch (error) {
      console.log('❌ MAC generation failed:', error.message);
      return false;
    }
  }
  
  static async testCreateOrder() {
    console.log('\n📦 Testing order creation...\n');
    
    if (!this.validateCredentials()) {
      console.log('❌ Skipping order test - credentials invalid');
      return false;
    }
    
    const appTransId = `${moment().format('YYMMDD')}_${Date.now()}`;
    
    const order = {
      app_id: parseInt(TEST_CONFIG.app_id),
      app_trans_id: appTransId,
      app_user: 'test_user',
      amount: 10000, // 10k VND test
      description: 'Test nap tien vi - ThoHCM',
      bank_code: '',
      item: JSON.stringify([{
        itemid: 'wallet_topup',
        itemname: 'Nap tien vi',
        itemprice: 10000,
        itemquantity: 1
      }]),
      embed_data: JSON.stringify({
        redirecturl: 'https://your-app.com/wallet'
      }),
      callback_url: 'https://your-backend.com/api/wallet/zalopay-callback'
    };
    
    // Tạo MAC signature
    const macData = [
      order.app_id,
      order.app_trans_id, 
      order.app_user,
      order.amount,
      order.app_time || Date.now(),
      order.embed_data,
      order.item
    ].join('|');
    
    order.mac = crypto.createHmac('sha256', TEST_CONFIG.key1)
      .update(macData)
      .digest('hex');
    
    console.log('📋 Order data:');
    console.log('  App Trans ID:', order.app_trans_id);
    console.log('  Amount:', order.amount, 'VND');
    console.log('  MAC:', order.mac);
    
    try {
      const response = await axios.post(`${TEST_CONFIG.endpoint}/v2/create`, order, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\n✅ Order created successfully!');
      console.log('📨 Response:', response.data);
      
      if (response.data.return_code === 1) {
        console.log('💳 Payment URL:', response.data.order_url);
        return true;
      } else {
        console.log('❌ Order creation failed:', response.data.return_message);
        return false;
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.message);
      if (error.response) {
        console.log('📨 Error response:', error.response.data);
      }
      return false;
    }
  }
  
  static testCallbackVerification() {
    console.log('\n🔄 Testing callback signature verification...\n');
    
    // Mock callback data từ ZaloPay
    const mockCallback = {
      data: JSON.stringify({
        app_id: TEST_CONFIG.app_id,
        app_trans_id: '251026_1234567890',
        amount: 10000,
        app_time: Date.now(),
        status: 1
      }),
      mac: '' // Sẽ generate
    };
    
    // Generate expected MAC
    mockCallback.mac = crypto.createHmac('sha256', TEST_CONFIG.key2)
      .update(mockCallback.data)
      .digest('hex');
    
    console.log('📋 Mock callback:');
    console.log('  Data:', mockCallback.data);
    console.log('  MAC:', mockCallback.mac);
    
    // Verify MAC
    const expectedMac = crypto.createHmac('sha256', TEST_CONFIG.key2)
      .update(mockCallback.data)
      .digest('hex');
    
    if (mockCallback.mac === expectedMac) {
      console.log('✅ Callback verification successful!');
      return true;
    } else {
      console.log('❌ Callback verification failed!');
      console.log('Expected MAC:', expectedMac);
      console.log('Received MAC:', mockCallback.mac);
      return false;
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 ZaloPay Integration Tester');
  console.log('===============================\n');
  
  const results = {
    credentials: ZaloPayTester.validateCredentials(),
    mac: ZaloPayTester.testMACGeneration(),
    callback: ZaloPayTester.testCallbackVerification()
  };
  
  // Chỉ test tạo order nếu credentials OK
  if (results.credentials) {
    results.order = await ZaloPayTester.testCreateOrder();
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! ZaloPay integration is ready!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check credentials and configuration.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Get real credentials from ZaloPay (call 1900 561 909)');
  console.log('2. Update backend/.env with real values');
  console.log('3. Run this test again');
  console.log('4. Test small transaction on production');
}

// Import moment safely
try {
  const moment = require('moment');
  main().catch(console.error);
} catch (error) {
  console.log('❌ Missing dependencies. Run: npm install moment axios');
  process.exit(1);
}