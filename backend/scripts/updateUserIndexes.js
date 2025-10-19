const mongoose = require('mongoose');
const User = require('../models/User');

async function updateUserIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thohcm');
    console.log('Connected to MongoDB');

    // Get current indexes
    const indexes = await User.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));

    // Drop the old unique phone index if it exists
    try {
      await User.collection.dropIndex('phone_1');
      console.log('✅ Dropped old phone_1 index');
    } catch (err) {
      console.log('ℹ️ phone_1 index not found (already dropped or never existed)');
    }

    // Check for data conflicts before creating new indexes
    console.log('\n🔍 Checking for data conflicts...');
    
    // Check phone + role conflicts
    const phoneRoleDuplicates = await User.aggregate([
      { $group: { _id: { phone: '$phone', role: '$role' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (phoneRoleDuplicates.length > 0) {
      console.log('❌ Found phone+role duplicates:', phoneRoleDuplicates);
      console.log('Please fix these duplicates before running this script');
      return;
    }

    // Check CCCD conflicts (workers only)
    const citizenIdDuplicates = await User.aggregate([
      { $match: { role: 'worker', citizenId: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$citizenId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (citizenIdDuplicates.length > 0) {
      console.log('❌ Found CCCD duplicates in workers:', citizenIdDuplicates);
      console.log('Please fix these duplicates before running this script');
      return;
    }

    console.log('✅ No data conflicts found');

    // Create new compound indexes
    console.log('\n📝 Creating new indexes...');
    
    // Create phone+role compound unique index
    try {
      await User.collection.createIndex(
        { phone: 1, role: 1 }, 
        { unique: true, name: 'phone_role_unique' }
      );
      console.log('✅ Created phone+role compound unique index');
    } catch (err) {
      if (err.code === 85) {
        console.log('ℹ️ Phone+role index already exists, skipping...');
      } else {
        throw err;
      }
    }

    // Create CCCD unique index for workers only
    try {
      await User.collection.createIndex(
        { citizenId: 1 }, 
        { 
          unique: true, 
          partialFilterExpression: { 
            citizenId: { $exists: true },
            role: 'worker' 
          },
          name: 'citizenId_worker_unique'
        }
      );
      console.log('✅ Created CCCD unique index for workers');
    } catch (err) {
      if (err.code === 85) {
        console.log('ℹ️ CCCD worker index already exists, skipping...');
      } else {
        throw err;
      }
    }

    // Verify new indexes
    const newIndexes = await User.collection.getIndexes();
    console.log('\n📋 New indexes:', Object.keys(newIndexes));

    console.log('\n🎉 Index update completed successfully!');
    console.log('\nNew validation rules:');
    console.log('- 1 phone number can have 1 customer + 1 worker account');
    console.log('- 1 CCCD can only belong to 1 worker');
    console.log('- Customers do not need CCCD');

  } catch (error) {
    console.error('❌ Error updating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  updateUserIndexes();
}

module.exports = updateUserIndexes;