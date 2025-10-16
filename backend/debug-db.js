const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/thohcm');

/**


 * TODO: Add function description


 */


async function debug() {
  try {
    console.log('=== Debug Database ===');
    
    // 1. Check all users with phone 0345807906
    const users = await User.find({ phone: '0345807906' });
    console.log('Users with phone 0345807906:', users.map(u => ({
      _id: u._id,
      name: u.name,
      phone: u.phone,
      loyaltyLevel: u.loyaltyLevel
    })));
    
    // 2. Check services with similar title
    const services = await Service.find({ title: { $regex: 'vệ sinh', $options: 'i' } });
    console.log('Services with "cleaning":', services.map(s => ({
      _id: s._id,
      title: s.title,
      basePrice: s.basePrice,
      promoPercent: s.promoPercent
    })));
    
    // 3. Check if we need to update loyaltyLevel
    if (users.length > 0 && users[0].loyaltyLevel !== 'vip') {
      console.log('\n=== Updating loyaltyLevel to VIP ===');
      await User.updateOne({ phone: '0345807906' }, { loyaltyLevel: 'vip' });
      console.log('Updated user to VIP status');
    }
    
    // 4. Show all services to find correct title
    const allServices = await Service.find({}, { title: 1, basePrice: 1, promoPercent: 1 });
    console.log('\nAll services:', allServices);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

debug();