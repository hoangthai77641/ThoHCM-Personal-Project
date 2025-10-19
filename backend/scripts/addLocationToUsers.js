const mongoose = require('mongoose');
require('dotenv').config();

// Use the regular User model to update data
const User = require('../models/User');
const UserEnhanced = require('../models/UserEnhanced');

const sampleLocations = [
  // Ho Chi Minh City coordinates
  { coordinates: [106.6297, 10.8231], district: 'Quận 1', fullAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
  { coordinates: [106.6947, 10.7769], district: 'Quận 2', fullAddress: '456 Đ. Mai Chí Thọ, Quận 2, TP.HCM' },
  { coordinates: [106.6637, 10.7893], district: 'Quận 3', fullAddress: '789 Võ Văn Tần, Quận 3, TP.HCM' },
  { coordinates: [106.7019, 10.7546], district: 'Quận 4', fullAddress: '321 Khánh Hội, Quận 4, TP.HCM' },
  { coordinates: [106.6753, 10.7626], district: 'Quận 5', fullAddress: '654 An Dương Vương, Quận 5, TP.HCM' },
  { coordinates: [106.6293, 10.8055], district: 'Quận 10', fullAddress: '147 3 Tháng 2, Quận 10, TP.HCM' },
  { coordinates: [106.6509, 10.7546], district: 'Quận 6', fullAddress: '258 Hậu Giang, Quận 6, TP.HCM' },
  { coordinates: [106.6816, 10.7373], district: 'Quận 7', fullAddress: '369 Nguyễn Thị Thập, Quận 7, TP.HCM' },
  { coordinates: [106.6270, 10.7379], district: 'Quận 8', fullAddress: '741 Phạm Thế Hiển, Quận 8, TP.HCM' },
  { coordinates: [106.6509, 10.7881], district: 'Quận Tân Bình', fullAddress: '852 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM' }
];

const specializations = [
  ['air_conditioning'],
  ['refrigerator'],
  ['washing_machine'], 
  ['water_heater'],
  ['electrical'],
  ['air_conditioning', 'refrigerator'],
  ['washing_machine', 'water_heater'],
  ['electrical', 'air_conditioning'],
  ['all']
];

async function migrateUsersToEnhanced() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thohcm');
    console.log('Connected to MongoDB');

    // Get all users from regular User collection
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Check if user already exists in UserEnhanced
      const existingEnhanced = await UserEnhanced.findOne({ phone: user.phone });
      if (existingEnhanced) {
        console.log(`User ${user.name} already exists in UserEnhanced, skipping...`);
        continue;
      }

      // Create enhanced user data
      const enhancedData = {
        name: user.name,
        phone: user.phone,
        password: user.password,
        role: user.role,
        address: user.address,
        usageCount: user.usageCount || 0,
        loyaltyLevel: user.loyaltyLevel || 'normal',
        resetOTP: user.resetOTP,
        resetOTPExpires: user.resetOTPExpiry,
        status: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      // Add location data (random from samples)
      const locationIndex = i % sampleLocations.length;
      enhancedData.location = sampleLocations[locationIndex];

      // Add worker-specific data if user is a worker
      if (user.role === 'worker') {
        const specIndex = i % specializations.length;
        enhancedData.specializations = specializations[specIndex];
        enhancedData.serviceArea = {
          maxRadius: 10 + (i % 15), // 10-25 km
          districts: [sampleLocations[locationIndex].district],
          isActive: true
        };
        enhancedData.performance = {
          totalJobs: Math.floor(Math.random() * 50) + 5, // 5-55 jobs
          completedJobs: Math.floor(Math.random() * 45) + 5, // 5-50 completed
          averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
          responseTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
          certifications: i % 3 === 0 ? ['samsung_certified'] : [],
          isOnline: Math.random() > 0.3, // 70% online
          lastOnline: new Date()
        };
      }

      // Create enhanced user
      const enhancedUser = new UserEnhanced(enhancedData);
      await enhancedUser.save();
      
      console.log(`✅ Migrated user: ${user.name} (${user.role}) to ${enhancedData.location.district}`);
    }

    console.log('Migration completed successfully!');
    
    // Show summary
    const stats = await UserEnhanced.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('\nUser Enhanced Collection Stats:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} users`);
    });

    const onlineWorkers = await UserEnhanced.countDocuments({ 
      role: 'worker', 
      'performance.isOnline': true 
    });
    console.log(`Online workers: ${onlineWorkers}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateUsersToEnhanced();