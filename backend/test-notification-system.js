const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testNotifications = [
  {
    type: 'specific',
    data: {
      targetType: 'specific',
      userIds: ['68d5535183d6ac6898cec0f4'], // Replace with actual user ID
      title: 'Thông báo cá nhân',
      message: 'Đây là thông báo send đến người dùng cụ thể',
      type: 'info',
      priority: 'normal'
    }
  },
  {
    type: 'customers',
    data: {
      targetType: 'customers',
      title: 'Thông báo đến khách hàng',
      message: 'Chương trình khuyến mãi mới cho khách hàng!',
      type: 'promotion',
      priority: 'high'
    }
  },
  {
    type: 'workers',
    data: {
      targetType: 'workers',
      title: 'Thông báo đến thợ',
      message: 'Cập nhật quy định mới cho thợ',
      type: 'system',
      priority: 'normal'
    }
  },
  {
    type: 'all',
    data: {
      targetType: 'all',
      title: 'Thông báo toàn bộ người dùng',
      message: 'Hệ thống sẽ bảo trì vào ngày mai',
      type: 'warning',
      priority: 'high'
    }
  }
];

/**


 * TODO: Add function description


 */


async function testNotificationSystem() {
  console.log('🚀 Testing Notification System...\n');

  for (const test of testNotifications) {
    try {
      console.log(`📧 Testing ${test.type} notification...`);
      
      const response = await axios.post(`${API_BASE}/notifications/send`, test.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log(`✅ ${test.type} notification sent successfully`);
        console.log(`   Recipients: ${response.data.recipients}`);
        console.log(`   Message: "${test.data.message}"\n`);
      } else {
        console.log(`❌ ${test.type} notification failed: ${response.data.message}\n`);
      }
    } catch (error) {
      console.log(`❌ ${test.type} notification error: ${error.response?.data?.message || error.message}\n`);
    }
  }

  console.log('🎉 Notification system testing completed!');
}

// Test specific functions
/**

 * TODO: Add function description

 */

async function testGetUsers() {
  try {
    console.log('👥 Getting users for testing...');
    const response = await axios.get(`${API_BASE}/users?limit=5`);
    console.log('Available users:');
    response.data.forEach(user => {
      console.log(`  - ${user.email} (${user._id}) - Role: ${user.role}`);
    });
    console.log('');
  } catch (error) {
    console.log('❌ Error getting users:', error.message);
  }
}

// Run tests
/**

 * TODO: Add function description

 */

async function runAllTests() {
  await testGetUsers();
  await testNotificationSystem();
}

runAllTests().catch(console.error);