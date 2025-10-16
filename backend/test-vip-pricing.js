/**
 * Test script to verify VIP pricing with promoPercent
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');
const PricingEngine = require('./services/PricingEngine');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thohcm';

async function testVipPricing() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a service with promoPercent
    const serviceWithPromo = await Service.findOne({ 
      promoPercent: { $gt: 0 } 
    });

    if (!serviceWithPromo) {
      console.log('No service with promoPercent found. Creating one for testing...');
      
      // Find any service and update it
      const testService = await Service.findOne();
      if (testService) {
        testService.promoPercent = 15; // 15% discount
        await testService.save();
        console.log(`Updated service ${testService.name} with 15% promo`);
      }
    }

    // Find a VIP customer
    const vipCustomer = await User.findOne({ 
      role: 'customer', 
      loyaltyLevel: 'vip' 
    });

    const normalCustomer = await User.findOne({ 
      role: 'customer', 
      loyaltyLevel: 'normal' 
    });

    console.log('\n=== Testing VIP Pricing ===');
    
    const testService = serviceWithPromo || await Service.findOne({ promoPercent: { $gt: 0 } });
    
    if (testService) {
      console.log(`Service: ${testService.name}`);
      console.log(`Base Price: ${testService.basePrice?.toLocaleString()} VND`);
      console.log(`Promo Percent: ${testService.promoPercent}%`);

      // Test VIP pricing
      if (vipCustomer) {
        const vipPricing = await PricingEngine.calculatePrice({
          serviceDetails: { type: 'điện lạnh', action: 'repair' },
          location: { district: 'Quận 1' },
          urgency: 'normal',
          customerLoyalty: 'vip',
          serviceId: testService._id
        });

        console.log('\n--- VIP Customer Pricing ---');
        console.log('Breakdown:');
        vipPricing.breakdown.forEach(item => {
          console.log(`  ${item.item}: ${item.amount.toLocaleString()} VND`);
        });
        console.log(`Final Price: ${vipPricing.finalPrice.toLocaleString()} VND`);
      }

      // Test normal customer pricing
      if (normalCustomer) {
        const normalPricing = await PricingEngine.calculatePrice({
          serviceDetails: { type: 'điện lạnh', action: 'repair' },
          location: { district: 'Quận 1' },
          urgency: 'normal',
          customerLoyalty: 'normal',
          serviceId: testService._id
        });

        console.log('\n--- Normal Customer Pricing ---');
        console.log('Breakdown:');
        normalPricing.breakdown.forEach(item => {
          console.log(`  ${item.item}: ${item.amount.toLocaleString()} VND`);
        });
        console.log(`Final Price: ${normalPricing.finalPrice.toLocaleString()} VND`);
      }
    }

    await mongoose.disconnect();
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testVipPricing();