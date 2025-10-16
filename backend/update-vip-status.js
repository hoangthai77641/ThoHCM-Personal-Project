const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');

const dbUri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/thohcm';

/**


 * TODO: Add function description


 */


async function updateVipStatus() {
  try {
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Get all customers
    const customers = await User.find({ role: 'customer' });
    console.log(`Found ${customers.length} customers`);

    for (const customer of customers) {
      // Get all bookings for this customer
      const bookings = await Booking.find({ 
        customer: customer._id,
        status: 'done' 
      }).populate('worker');

      // Group bookings by worker
      const workerStats = {};
      bookings.forEach(booking => {
        if (booking.worker) {
          const workerId = booking.worker._id.toString();
          if (!workerStats[workerId]) {
            workerStats[workerId] = {
              count: 0,
              workerName: booking.worker.name
            };
          }
          workerStats[workerId].count++;
        }
      });

      // Check if customer has 3+ bookings with any single worker
      const maxBookingsWithSameWorker = Math.max(...Object.values(workerStats).map(w => w.count), 0);
      const shouldBeVip = maxBookingsWithSameWorker >= 3;
      
      console.log(`Customer: ${customer.name}`);
      console.log(`  Current loyalty: ${customer.loyaltyLevel}`);
      console.log(`  Max bookings with same worker: ${maxBookingsWithSameWorker}`);
      console.log(`  Should be VIP: ${shouldBeVip}`);
      console.log(`  Worker stats:`, workerStats);

      // Update loyalty level if needed
      if (shouldBeVip && customer.loyaltyLevel !== 'vip') {
        customer.loyaltyLevel = 'vip';
        await customer.save();
        console.log(`  ✅ Updated ${customer.name} to VIP status`);
      } else if (!shouldBeVip && customer.loyaltyLevel === 'vip') {
        customer.loyaltyLevel = 'normal';
        await customer.save();
        console.log(`  ✅ Updated ${customer.name} to normal status`);
      } else {
        console.log(`  ⚡ No change needed for ${customer.name}`);
      }
      console.log('---');
    }

    console.log('VIP status update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating VIP status:', error);
    process.exit(1);
  }
}

updateVipStatus();