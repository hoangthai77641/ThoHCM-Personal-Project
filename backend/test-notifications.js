const axios = require('axios');

// Base URL của API
const API_BASE = 'http://localhost:3001';

// Token admin để test (cần thay đổi với token thực tế)
const ADMIN_TOKEN = 'your-admin-token-here';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  }
});

/**


 * TODO: Add function description


 */


async function testNotifications() {
  console.log('🚀 Testing Notification System...\n');

  try {
    // Test 1: Gửi thông báo đến một user cụ thể
    console.log('📝 Test 1: Gửi thông báo đến user cụ thể');
    try {
      const response1 = await api.post('/api/notifications/send/user', {
        userId: '60d0fe4f5311236168a109ca', // Thay thế với ID thực tế
        title: 'Test Notification to Specific User',
        message: 'Đây là thông báo test send đến một user cụ thể',
        type: 'info',
        priority: 'normal'
      });
      console.log('✅ Success:', response1.data.message);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Gửi thông báo đến tất cả khách hàng
    console.log('📝 Test 2: Gửi thông báo đến tất cả khách hàng');
    try {
      const response2 = await api.post('/api/notifications/send/customers', {
        title: 'Khuyến mãi đặc biệt dành cho khách hàng!',
        message: 'Giảm giá 20% tất cả dịch vụ sửa chữa điện trong tuần này. Đặt lịch ngay!',
        type: 'promotion',
        priority: 'high'
      });
      console.log('✅ Success:', response2.data.message);
      console.log('📊 Recipients:', response2.data.recipients);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Gửi thông báo đến tất cả thợ
    console.log('📝 Test 3: Gửi thông báo đến tất cả thợ');
    try {
      const response3 = await api.post('/api/notifications/send/workers', {
        title: 'Cập nhật quan trọng cho thợ',
        message: 'Hệ thống sẽ được bảo trì từ 2:00 - 4:00 sáng mai. Vui lòng hoàn successful việc trước giờ này.',
        type: 'warning',
        priority: 'high'
      });
      console.log('✅ Success:', response3.data.message);
      console.log('📊 Recipients:', response3.data.recipients);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Gửi thông báo đến tất cả user
    console.log('📝 Test 4: Gửi thông báo đến tất cả user');
    try {
      const response4 = await api.post('/api/notifications/send/all-users', {
        title: 'Thông báo hệ thống quan trọng',
        message: 'Chúng tôi đã update chính sách bảo mật. Vui lòng đọc và xác receive.',
        type: 'system',
        priority: 'normal'
      });
      console.log('✅ Success:', response4.data.message);
      console.log('📊 Recipients:', response4.data.recipients);
      if (response4.data.breakdown) {
        console.log('📈 Breakdown:', response4.data.breakdown);
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Gửi thông báo tùy chỉnh
    console.log('📝 Test 5: Gửi thông báo tùy chỉnh');
    try {
      const response5 = await api.post('/api/notifications/send/custom', {
        title: 'Thông báo tùy chỉnh',
        message: 'Đây là thông báo test với cấu hình tùy chỉnh',
        type: 'info',
        priority: 'normal',
        targetType: 'customers', // hoặc 'workers', 'all', 'specific', 'custom'
        data: {
          actionUrl: '/promotions',
          buttonText: 'Xem chi tiết'
        }
      });
      console.log('✅ Success:', response5.data.message);
      console.log('📊 Recipients:', response5.data.recipients);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('💥 General Error:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

// Chạy test
if (require.main === module) {
  console.log('⚠️  IMPORTANT: Please update ADMIN_TOKEN with a valid admin token before running tests.\n');
  console.log('You can get a token by:');
  console.log('1. Login as admin via web interface');
  console.log('2. Check localStorage.getItem("token") in browser console');
  console.log('3. Copy the token and paste it above\n');
  console.log('For now, running tests without authentication (they may fail)...\n');
  
  testNotifications();
}

module.exports = { testNotifications };