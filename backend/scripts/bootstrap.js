const mongoose = require('mongoose');

const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Wallet = require('../models/Wallet');
const WorkerSchedule = require('../models/WorkerSchedule');
const Banner = require('../models/Banner');

async function ensureIndexes() {
  await Promise.all([
    User.syncIndexes(),
    Service.syncIndexes(),
    Booking.syncIndexes(),
    Review.syncIndexes(),
    Notification.syncIndexes(),
    Wallet.syncIndexes(),
    WorkerSchedule.syncIndexes(),
    Banner.syncIndexes(),
  ]);
}

async function ensureCollections() {
  // Touch each collection to force creation if missing
  await Promise.all([
    User.exists({}).catch(()=>null),
    Service.exists({}).catch(()=>null),
    Booking.exists({}).catch(()=>null),
    Review.exists({}).catch(()=>null),
    Notification.exists({}).catch(()=>null),
    Wallet.exists({}).catch(()=>null),
    WorkerSchedule.exists({}).catch(()=>null),
    Banner.exists({}).catch(()=>null),
  ]);
}

async function seedMinimal() {
  const users = await User.countDocuments();
  if (users === 0) {
    const bcrypt = require('bcryptjs');
    const pw = await bcrypt.hash('123456', 10);
    await User.create([
      { name: 'Admin', phone: '0909000000', password: pw, role: 'admin', address: 'HCM' },
      { name: 'Khách hàng', phone: '0909000002', password: pw, role: 'customer', address: 'HCM' },
      { name: 'Thợ', phone: '0909000001', password: pw, role: 'worker', address: 'HCM' },
    ]);
  }

  const services = await Service.countDocuments();
  if (services === 0) {
    const worker = await User.findOne({ role: 'worker' });
    await Service.create([
      { name: 'Sửa điện cơ bản', description: 'Kiểm tra & sửa chữa cơ bản', basePrice: 150000, worker: worker?._id },
    ]);
  }
}

module.exports = async function bootstrap() {
  try {
    await ensureCollections();
    await ensureIndexes();
    await seedMinimal();
    const conn = mongoose.connection;
    console.log('[bootstrap] completed for DB:', conn.name);
  } catch (err) {
    console.warn('[bootstrap] failed:', err.message);
  }
};
