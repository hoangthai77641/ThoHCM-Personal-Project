const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');

/**


 * TODO: Add function description


 */


async function checkPromo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thohcm');
    console.log('Connected to MongoDB');

    // Find dịch vụ "Vệ sinh máy lạnh"
    const service = await Service.findOne({name: 'Vệ sinh máy lạnh'});
    
    if (service) {
      console.log('\n=== SERVICE INFO ===');
      console.log('Name:', service.name);
      console.log('Base Price:', service.basePrice);
      console.log('Promo Percent:', service.promoPercent);
      console.log('Worker ID:', service.workerId);
      
      if (service.promoPercent > 0) {
        const discountedPrice = service.basePrice * (1 - service.promoPercent / 100);
        console.log('Discounted Price (for VIP):', Math.round(discountedPrice));
      } else {
        console.log('No promo percent set for this service');
      }
    } else {
      console.log('Service "Vệ sinh máy lạnh" not found');
    }

    // Check tất cả services có promoPercent
    const servicesWithPromo = await Service.find({promoPercent: {$gt: 0}});
    console.log(`\n=== SERVICES WITH PROMO (${servicesWithPromo.length}) ===`);
    servicesWithPromo.forEach(s => {
      console.log(`${s.name}: ${s.promoPercent}% off (Base: ${s.basePrice})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkPromo();