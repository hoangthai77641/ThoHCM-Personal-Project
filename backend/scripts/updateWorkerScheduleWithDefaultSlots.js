const mongoose = require('mongoose');
const WorkerSchedule = require('../models/WorkerSchedule');
const User = require('../models/User');

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thohcm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/**


 * TODO: Add function description


 */


async function updateAllWorkerSchedules() {
  try {
    console.log('🔄 Starting work schedule update for all workers...');
    
    // Get tất cả thợ
    const workers = await User.find({ role: 'worker' });
    console.log(`📊 Tìm thấy ${workers.length} thợ`);
    
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const worker of workers) {
      console.log(`\n👤 Xử lý thợ: ${worker.name} (${worker._id})`);
      
      // Find lịch làm việc hiện tại
      let schedule = await WorkerSchedule.findOne({ worker: worker._id });
      
      if (!schedule) {
        // Create lịch mặc định mới với khung giờ update
        console.log('   ➕ Creating new work schedule...');
        schedule = await WorkerSchedule.createDefaultSchedule(worker._id, 7);
        createdCount++;
        console.log('   ✅ Schedule created successfully');
      } else {
        // Update khung giờ mặc định
        console.log('   🔄 Updating default time slots...');
        
        // Update defaultTimeSlots nếu chưa có hoặc khác với mặc định mới
        const newDefaultTimeSlots = {
          morning: ["08:00", "09:00", "10:00", "11:00", "12:00"],
          afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00"],
          evening: ["19:00", "20:00"]
        };
        
        schedule.defaultTimeSlots = newDefaultTimeSlots;
        
        // Update giờ làm việc mặc định
        schedule.defaultWorkingHours.end = "20:00";
        
        // Delete các slot cũ chưa được đặt và create lại với khung giờ mới
        const now = new Date();
        const bookedSlots = schedule.availableSlots.filter(slot => slot.isBooked);
        
        // Giữ lại các slot đã được đặt, delete các slot chưa đặt
        schedule.availableSlots = bookedSlots;
        
        // Create lại lịch với khung giờ mới cho 7 ngày tới
        schedule.generateSlotsForDays(7);
        
        await schedule.save();
        updatedCount++;
        console.log('   ✅ Update completed successfully');
        
        // Log thông tin slot mới
        const newSlots = schedule.availableSlots.filter(slot => !slot.isBooked && slot.startTime > now);
        console.log(`   📅 Tạo ${newSlots.length} slot mới khả dụng`);
      }
    }
    
    console.log('\n🎉 Update process finished!');
    console.log(`📊 Statistics:`);
    console.log(`   - Tạo mới: ${createdCount} lịch`);
    console.log(`   - Cập nhật: ${updatedCount} lịch`);
    console.log(`   - Tổng: ${workers.length} thợ`);
    
  } catch (error) {
    console.error('❌ Lỗi khi update:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Chạy script
updateAllWorkerSchedules();