const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://127.0.0.1:27017/thohcm');

/**


 * TODO: Add function description


 */


async function testVipBooking() {
  try {
    console.log('=== Test VIP Booking Logic ===');
    
    // 1. Find VIP customer
    const vipCustomer = await User.findOne({ phone: '0345807906' });
    console.log('VIP Customer:', {
      name: vipCustomer?.name,
      loyaltyLevel: vipCustomer?.loyaltyLevel,
      phone: vipCustomer?.phone
    });
    
    // 2. Find service with promoPercent
    const service = await Service.findOne({ title: 'Vệ sinh máy lạnh' });
    console.log('Service:', {
      title: service?.title,
      basePrice: service?.basePrice,
      promoPercent: service?.promoPercent
    });
    
    // 3. Test pricing logic
    if (vipCustomer && service) {
      const isVip = vipCustomer.loyaltyLevel === 'vip';
      const basePrice = service.basePrice;
      
      // Use service's promoPercent if available, otherwise default 10% VIP discount
      const vipDiscountPercent = (isVip && service.promoPercent && service.promoPercent > 0) 
        ? service.promoPercent / 100 
        : (isVip ? 0.1 : 0);
        
      const vipDiscount = basePrice * vipDiscountPercent;
      const finalPrice = Math.round(basePrice - vipDiscount);
      
      console.log('Pricing Calculation:');
      console.log('- Base Price:', basePrice);
      console.log('- Is VIP:', isVip);
      console.log('- VIP Discount Percent:', vipDiscountPercent * 100 + '%');
      console.log('- VIP Discount Amount:', vipDiscount);
      console.log('- Final Price:', finalPrice);
      
      // Expected: 200,000 - (200,000 * 0.1) = 180,000 VND
      console.log('Expected VIP Price: 180,000 VND');
      console.log('Calculated VIP Price:', finalPrice, 'VND');
      console.log('Match Expected?', finalPrice === 180000 ? '✅ YES' : '❌ NO');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testVipBooking();