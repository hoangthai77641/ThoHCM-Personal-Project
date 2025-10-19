require('dotenv').config();
const mongoose = require('mongoose');

// Import models to ensure collections + indexes are registered
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Wallet = require('../models/Wallet');
const WorkerSchedule = require('../models/WorkerSchedule');
const Banner = require('../models/Banner');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('[checkAtlas] Missing MONGODB_URI env. Example:');
  console.error('  MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/thohcm?retryWrites=true&w=majority" npm run check:atlas');
  process.exit(1);
}

async function main() {
  const started = Date.now();
  console.log('[checkAtlas] Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  const { ok } = await db.admin().ping();
  if (ok !== 1) throw new Error('Ping failed');
  console.log('[checkAtlas] Connected and ping OK');

  // Ensure indexes defined by Mongoose are created
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

  const counts = await Promise.all([
    User.countDocuments(),
    Service.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    Notification.countDocuments(),
    Wallet.countDocuments(),
    WorkerSchedule.countDocuments(),
    Banner.countDocuments(),
  ]);

  const result = {
    dbName: db.databaseName,
    counts: {
      users: counts[0],
      services: counts[1],
      bookings: counts[2],
      reviews: counts[3],
      notifications: counts[4],
      wallets: counts[5],
      workerSchedules: counts[6],
      banners: counts[7],
    }
  };

  // Validate critical indexes
  const userIndexes = await db.collection('users').indexes();
  const hasPhoneRoleUnique = userIndexes.some(ix =>
    ix.key && ix.key.phone === 1 && ix.key.role === 1 && ix.unique === true
  );
  const hasCitizenPartial = userIndexes.some(ix =>
    ix.key && ix.key.citizenId === 1 && ix.unique === true && ix.partialFilterExpression && ix.partialFilterExpression.role === 'worker'
  );

  result.indexes = {
    users: {
      phone_role_unique: hasPhoneRoleUnique,
      citizenId_worker_partial_unique: hasCitizenPartial,
    }
  };

  // Show a few sample docs (no sensitive fields)
  const sampleUsers = await User.find({}, { name: 1, phone: 1, role: 1 }).limit(3).lean();
  const sampleServices = await Service.find({}, { name: 1, basePrice: 1 }).limit(3).lean();
  result.samples = { users: sampleUsers, services: sampleServices };

  console.log('\n[checkAtlas] Summary');
  console.table(result.counts);
  console.log('[checkAtlas] Indexes:', result.indexes);
  console.log('[checkAtlas] Samples:', result.samples);

  await mongoose.disconnect();
  console.log(`[checkAtlas] Done in ${Date.now() - started}ms`);
}

main().catch(async (err) => {
  console.error('[checkAtlas] FAILED:', err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
