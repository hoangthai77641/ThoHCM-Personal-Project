const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Booking = require('./models/Booking');

/**


 * TODO: Add function description


 */


async function checkVipStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thohcm');
    console.log('Connected to MongoDB');

    // Find user Nguyễn Hoàng Thái
    const user = await User.findOne({name: 'Nguyễn Hoàng Thái'});
    
    if (user) {
      console.log('\n=== USER INFO ===');
      console.log('Name:', user.name);
      console.log('Phone:', user.phone);
      console.log('User ID:', user._id);
      
      // Check số booking đã hoàn thành
      const completedBookings = await Booking.find({
        customerId: user._id,
        status: 'completed'
      }).populate('serviceId');
      
      console.log(`\n=== COMPLETED BOOKINGS (${completedBookings.length}) ===`);
      
      // Nhóm booking theo worker
      const workerBookings = {};
      completedBookings.forEach(booking => {
        const workerId = booking.workerId?.toString();
        if (!workerBookings[workerId]) {
          workerBookings[workerId] = [];
        }
        workerBookings[workerId].push(booking);
      });
      
      console.log('\n=== BOOKINGS BY WORKER ===');
      for (const [workerId, bookings] of Object.entries(workerBookings)) {
        console.log(`Worker ${workerId}: ${bookings.length} bookings`);
        bookings.forEach(b => {
          console.log(`  - ${b.serviceId?.name || 'Unknown Service'} (${b.totalPrice}đ)`);
        });
        
        if (bookings.length >= 3) {
          console.log(`  ✅ VIP STATUS with this worker! (${bookings.length} ≥ 3)`);
        }
      }
      
    } else {
      console.log('User "Nguyễn Hoàng Thái" not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkVipStatus();