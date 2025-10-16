const mongoose = require('mongoose');
require('dotenv').config();

/**


 * TODO: Add function description


 */


async function createTestBooking() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Booking = require('./models/Booking');
    const User = require('./models/User');
    const Service = require('./models/Service');
    
    // Get user và service có sẵn
    const user = await User.findOne({name: 'Nguyễn Hoàng Thái'});
    const service = await Service.findOne({name: 'Vệ sinh máy lạnh'});
    
    if (!user || !service) {
      console.log('User or Service not found');
      return;
    }
    
    console.log('Found user:', user.name);
    console.log('Found service:', service.name);
    console.log('Service worker:', service.worker);
    
    const testBooking = new Booking({
      customer: user._id,
      service: service._id,
      worker: service.worker,
      date: new Date('2025-10-07'),
      preferredTime: new Date('2025-10-07T10:00:00Z'),
      address: '123 Test Street, HCM',
      status: 'pending',
      basePrice: service.basePrice,
      finalPrice: service.basePrice
    });
    
    await testBooking.save();
    console.log('Test booking created:');
    console.log('ID:', testBooking._id);
    console.log('Status:', testBooking.status);
    console.log('Date:', testBooking.date);
    console.log('Time:', testBooking.preferredTime);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createTestBooking();