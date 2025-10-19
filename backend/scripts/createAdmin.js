/**
 * Script to create admin account directly in database
 * Usage: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thohcm_admin:thohcmadmin@thohcm-cluster.bxqkpw6.mongodb.net/thohcm';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin details
    const adminData = {
      name: 'Super Admin',
      phone: '0123456789',
      password: 'admin123456',
      email: 'admin@thohcm.com',
      role: 'admin',
      status: 'active'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { phone: adminData.phone },
        { email: adminData.email }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin with this phone or email already exists:');
      console.log(`   Phone: ${existingAdmin.phone}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = new User({
      name: adminData.name,
      phone: adminData.phone,
      password: hashedPassword,
      email: adminData.email,
      role: adminData.role,
      status: adminData.status
    });

    await admin.save();

    console.log('✅ Admin account created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Phone: ${adminData.phone}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   Status: ${adminData.status}`);
    console.log('');
    console.log('🔐 You can now login to the web interface with these credentials');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
createAdmin();