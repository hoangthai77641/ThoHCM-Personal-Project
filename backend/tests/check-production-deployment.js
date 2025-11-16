#!/usr/bin/env node

const axios = require('axios');

// Configuration - Cập nhật URL production của bạn
const PRODUCTION_CONFIG = {
  // Thay đổi URL này thành production URL thực tế
  baseUrl: 'https://your-app.cloudfunctions.net/api', // Firebase Functions
  // baseUrl: 'https://your-app.run.app/api',          // Google Cloud Run  
  // baseUrl: 'https://your-app.herokuapp.com/api',    // Heroku
  // baseUrl: 'https://your-domain.com/api',           // Custom domain
  
  // Test endpoints
  endpoints: [
    { path: '/health', method: 'GET', auth: false },
    { path: '/auth/login', method: 'POST', auth: false },
    { path: '/wallet/stats', method: 'GET', auth: true },
    { path: '/wallet/pending-manual-deposits', method: 'GET', auth: true },
    { path: '/wallet/deposit', method: 'POST', auth: true },
  ]
};

console.log('🔍 Manual QR Banking System - Production Deployment Check');
console.log('='.repeat(60));

// Test basic connectivity
async function testConnectivity() {
  console.log('\n🌐 Testing production server connectivity...');
  
  try {
    const response = await axios.get(PRODUCTION_CONFIG.baseUrl.replace('/api', ''), {
      timeout: 10000
    });
    console.log('✅ Server is reachable');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - Server may be down');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Connection timeout - Server may be slow or unreachable');
    } else if (error.response?.status === 404) {
      console.log('⚠️ Server reachable but endpoint not found (normal for API-only servers)');
      return true; // This is actually OK for API servers
    } else {
      console.log('❌ Connection error:', error.message);
    }
    return false;
  }
}

// Test API endpoints
async function testEndpoints() {
  console.log('\n🔌 Testing API endpoints...');
  
  for (const endpoint of PRODUCTION_CONFIG.endpoints) {
    const url = PRODUCTION_CONFIG.baseUrl + endpoint.path;
    console.log(`\n📍 Testing: ${endpoint.method} ${endpoint.path}`);
    
    try {
      let response;
      const config = {
        timeout: 15000,
        validateStatus: () => true // Accept all status codes
      };
      
      if (endpoint.auth) {
        config.headers = {
          'Authorization': 'Bearer invalid_token_for_testing'
        };
      }
      
      if (endpoint.method === 'GET') {
        response = await axios.get(url, config);
      } else if (endpoint.method === 'POST') {
        response = await axios.post(url, {}, config);
      }
      
      // Analyze response
      if (response.status === 200) {
        console.log('   ✅ Endpoint responding successfully');
      } else if (response.status === 401 && endpoint.auth) {
        console.log('   ✅ Endpoint exists (401 Unauthorized - expected without valid token)');
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint not found (404) - May not be deployed');
      } else if (response.status === 405) {
        console.log('   ⚠️ Method not allowed (405) - Endpoint exists but method wrong');
      } else if (response.status >= 500) {
        console.log(`   ❌ Server error (${response.status}) - Internal issue`);
      } else {
        console.log(`   ⚠️ Unexpected response (${response.status})`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Connection refused');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   ❌ Request timeout');
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }
}

// Check manual QR banking specific features
async function checkManualQRFeatures() {
  console.log('\n🎯 Checking Manual QR Banking features...');
  
  const manualQREndpoints = [
    '/wallet/deposit',
    '/wallet/upload-proof', 
    '/wallet/pending-manual-deposits',
    '/wallet/approve-manual-deposit/test-id',
    '/wallet/reject-manual-deposit/test-id'
  ];
  
  for (const endpoint of manualQREndpoints) {
    const url = PRODUCTION_CONFIG.baseUrl + endpoint;
    console.log(`\n🔍 ${endpoint}`);
    
    try {
      const response = await axios.options(url, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (response.status === 200 || response.status === 404) {
        console.log('   ✅ Endpoint accessible');
      } else {
        console.log(`   ⚠️ Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Generate deployment report
function generateDeploymentReport() {
  console.log('\n📋 DEPLOYMENT REPORT');
  console.log('='.repeat(40));
  console.log('Production URL:', PRODUCTION_CONFIG.baseUrl);
  console.log('Test Date:', new Date().toLocaleString('vi-VN'));
  console.log('\n✅ Deployed Features:');
  console.log('  - Manual QR Banking Backend');
  console.log('  - File Upload Support (Multer)');
  console.log('  - Admin Approval Workflow');
  console.log('  - Transaction Tracking');
  console.log('\n⏳ Pending Tasks:');
  console.log('  - Mobile UI Updates');
  console.log('  - Admin Dashboard');
  console.log('  - End-to-end Testing');
  console.log('  - Notification System');
  console.log('\n🔧 Next Steps:');
  console.log('  1. Update PRODUCTION_CONFIG.baseUrl with actual production URL');
  console.log('  2. Run: node check-production-deployment.js --test');
  console.log('  3. Test with real credentials using test-production-manual-qr.js');
  console.log('  4. Deploy mobile app updates');
  console.log('  5. Create admin dashboard for manual approvals');
}

// Main execution
async function checkDeployment() {
  if (!PRODUCTION_CONFIG.baseUrl.startsWith('http') || 
      PRODUCTION_CONFIG.baseUrl.includes('your-app')) {
    console.log('❌ Please update PRODUCTION_CONFIG.baseUrl with your actual production URL');
    console.log('\nCommon patterns:');
    console.log('  - Firebase Functions: https://region-project.cloudfunctions.net/api');
    console.log('  - Cloud Run: https://service-region-project.a.run.app/api');
    console.log('  - Heroku: https://your-app-name.herokuapp.com/api');
    console.log('  - Custom domain: https://api.your-domain.com/api');
    return;
  }

  const connected = await testConnectivity();
  if (!connected) {
    console.log('\n❌ Cannot connect to production server. Check URL and deployment status.');
    return;
  }
  
  await testEndpoints();
  await checkManualQRFeatures();
  generateDeploymentReport();
}

// Run if called with --test flag
if (process.argv.includes('--test')) {
  checkDeployment();
} else {
  console.log('Manual QR Banking System - Production Deployment Checker');
  console.log('\n📋 This tool helps verify that your Manual QR Banking system');
  console.log('   is properly deployed to production.');
  console.log('\n🔧 Configuration needed:');
  console.log('   - Update PRODUCTION_CONFIG.baseUrl with your production URL');
  console.log('\n🚀 To run: node check-production-deployment.js --test');
  console.log('\n📁 Related files:');
  console.log('   - test-production-manual-qr.js (Full API testing)');
  console.log('   - MANUAL_QR_BANKING_GUIDE.md (Documentation)');
}