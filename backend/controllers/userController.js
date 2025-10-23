const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const WorkerSchedule = require('../models/WorkerSchedule');
const Review = require('../models/Review');
const fs = require('fs');
const path = require('path');

// Đăng ký
exports.register = async (req, res) => {
  try {
    let { name, phone, password, role, address, citizenId } = req.body;
    // basic validation
    name = (name || '').toString().trim();
    phone = (phone || '').toString().trim();
    password = (password || '').toString();
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!phone) return res.status(400).json({ message: 'Phone is required' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    
    // prevent arbitrary elevation; block admin self-register
    let userRole = 'customer';
    if (role === 'worker') {
      userRole = 'worker';
    } else if (role === 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    
    // Flexible validation: 1 phone can have 1 customer + 1 worker
    const existingWithSameRole = await User.findOne({ phone, role: userRole });
    if (existingWithSameRole) {
      const roleText = userRole === 'customer' ? 'khách hàng' : 'thợ';
      return res.status(400).json({ message: `Số điện thoại này đã được đăng ký tài khoản ${roleText}` });
    }
    
    // CCCD validation: NOT required for worker registration - admin will add later
    // Skip CCCD validation during registration
    if (userRole === 'worker' && citizenId && citizenId.trim()) {
      // Optional: if user provides CCCD during registration, check for duplicates
      const existingCitizenId = await User.findOne({ citizenId: citizenId.trim(), role: 'worker' });
      if (existingCitizenId) {
        return res.status(400).json({ message: 'CCCD này đã được đăng ký bởi thợ khác' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    // default status: workers start as pending, others active
    const status = userRole === 'worker' ? 'pending' : 'active';
    
    // Only set citizenId for workers
    const userData = { 
      name, 
      phone, 
      password: hashedPassword, 
      role: userRole, 
      address, 
      status 
    };
    
    if (userRole === 'worker' && citizenId) {
      userData.citizenId = citizenId.trim();
    }
    
    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: 'Register success' });
  } catch (err) {
    // handle duplicate key errors
    if (err && err.code === 11000) {
      if (err.keyPattern && err.keyPattern.phone) {
        return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng cho role này' });
      }
      if (err.keyPattern && err.keyPattern.citizenId) {
        return res.status(400).json({ message: 'CCCD này đã được đăng ký' });
      }
    }
    res.status(400).json({ message: err.message || 'Registration failed' });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'User not found' });
    // block login if not active
    if (user.status && user.status !== 'active') {
      return res.status(403).json({
        message: 'Tài khoản thợ chưa được kích hoạt',
        code: 'WORKER_PENDING',
        instructions: 'Xin Chào Đối tác mới của Thợ HCM, Đối tác vui lòng đến văn phòng Thợ HCM tại địa chỉ: 456 Phan Văn Trị, P. An Nhơn, TP HCM vào khung giờ 8:00 - 11:00 Sáng và 13:00 - 16:00 Chiều để kích hoạt tài khoản Thợ của đối tác, vui lòng mang theo CCCD để xác minh, update thông tin, ảnh đại diện trên ứng dụng và receive nón bảo hiểm miễn phí',
        status: user.status,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

  const sanitized = user.toObject({ versionKey: false });
    delete sanitized.password;
    delete sanitized.resetOTP;
    sanitized.id = sanitized._id;

    res.json({ token, user: sanitized });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { q, role, status, page = 1, limit = 20, includeAdmins } = req.query;
    const filter = {};
    
    // Default: Không hiển thị admin trong danh sách user
    // Chỉ super-admin mới có thể xem admin bằng cách set includeAdmins=true
    if (includeAdmins !== 'true' || req.user.role !== 'admin') {
      filter.role = { $ne: 'admin' }; // Loại trừ admin
    }
    
    // Override role filter nếu có
    if (role && role !== 'admin') {
      filter.role = role;
    } else if (role === 'admin' && (req.user.role !== 'admin' || includeAdmins !== 'true')) {
      // Không cho phép filter admin nếu không có quyền
      return res.status(403).json({ message: 'Access denied to admin users' });
    }
    
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
      User.countDocuments(filter),
    ]);
    res.json({ items, total, page: pageNum, pages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get administrators (only accessible by super admin)
exports.getAdministrators = async (req, res) => {
  try {
    // Only admin can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { q, page = 1, limit = 20 } = req.query;
    const filter = { role: 'admin' }; // Only get admin users
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetOTP') // Don't send sensitive data
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'active', 'suspended'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = status;
    await user.save();
    res.json({ message: 'Updated', user: await User.findById(id).select('-password -resetOTP') });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// Admin: update user role
exports.adminCreateWorker = async (req, res) => {
  try {
    const { name, phone, password, address, citizenId, status } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!phone || !phone.trim()) return res.status(400).json({ message: 'Phone is required' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Check if phone already used for worker role
    const existingWorker = await User.findOne({ phone: phone.trim(), role: 'worker' });
    if (existingWorker) return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký tài khoản thợ' });

    // Check if CCCD already used for worker
    if (citizenId && citizenId.trim()) {
      const existingCitizenId = await User.findOne({ citizenId: citizenId.trim(), role: 'worker' });
      if (existingCitizenId) return res.status(400).json({ message: 'CCCD này đã được đăng ký bởi thợ khác' });
    }

    const worker = new User({
      name: name.trim(),
      phone: phone.trim(),
      password: await bcrypt.hash(password, 10),
      role: 'worker',
      address,
      citizenId,
      status: ['pending', 'active', 'suspended'].includes(status) ? status : 'pending',
    });

    await worker.save();
    const sanitized = worker.toObject({ versionKey: false });
    delete sanitized.password;
    delete sanitized.resetOTP;
    res.status(201).json(sanitized);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.adminUpdateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const { name, phone, address, citizenId, status, password } = req.body;

    if (name !== undefined) worker.name = name;
    if (address !== undefined) worker.address = address;
    if (citizenId !== undefined) worker.citizenId = citizenId;

    if (phone !== undefined && phone !== worker.phone) {
      // Check if phone already used by another worker
      const existsWorker = await User.findOne({ phone, role: 'worker', _id: { $ne: worker._id } });
      if (existsWorker) return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng bởi thợ khác' });
      worker.phone = phone;
    }

    if (citizenId !== undefined && citizenId !== worker.citizenId) {
      // Check if CCCD already used by another worker
      if (citizenId && citizenId.trim()) {
        const existsCitizenId = await User.findOne({ citizenId: citizenId.trim(), role: 'worker', _id: { $ne: worker._id } });
        if (existsCitizenId) return res.status(400).json({ message: 'CCCD này đã được sử dụng bởi thợ khác' });
      }
      worker.citizenId = citizenId;
    }

    if (status && ['pending', 'active', 'suspended'].includes(status)) {
      worker.status = status;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      worker.password = await bcrypt.hash(password, 10);
    }

    await worker.save();
    const sanitized = await User.findById(worker._id).select('-password -resetOTP');
    res.json(sanitized);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.adminDeleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Get all services of this worker first (for deleting reviews)
    const workerServices = await Service.find({ worker: id });
    const serviceIds = workerServices.map(service => service._id);

    // Delete all reviews for this worker's services
    const deletedReviews = await Review.deleteMany({ service: { $in: serviceIds } });
    console.log(`Deleted ${deletedReviews.deletedCount} reviews for worker ${worker.name}`);

    // Delete all services associated with this worker
    const deletedServices = await Service.deleteMany({ worker: id });
    console.log(`Deleted ${deletedServices.deletedCount} services for worker ${worker.name}`);

    // Delete all bookings associated with this worker
    const deletedBookings = await Booking.deleteMany({ worker: id });
    console.log(`Deleted ${deletedBookings.deletedCount} bookings for worker ${worker.name}`);

    // Delete all schedules associated with this worker
    const deletedSchedules = await WorkerSchedule.deleteMany({ worker: id });
    console.log(`Deleted ${deletedSchedules.deletedCount} schedules for worker ${worker.name}`);

    // Delete worker's avatar file if exists
    if (worker.avatar) {
      const avatarPath = path.join(__dirname, '..', worker.avatar);
      try {
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          console.log(`Deleted avatar file: ${avatarPath}`);
        }
      } catch (fileErr) {
        console.error('Error deleting avatar file:', fileErr);
      }
    }

    // Finally delete the worker
    await worker.deleteOne();
    
    res.json({ 
      message: 'Worker deleted successfully',
      deletedReviews: deletedReviews.deletedCount,
      deletedServices: deletedServices.deletedCount,
      deletedBookings: deletedBookings.deletedCount,
      deletedSchedules: deletedSchedules.deletedCount
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// profile
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetOTP');
    
    // If customer, add statistics
    if (user.role === 'customer') {
      const bookings = await Booking.find({ customer: user._id }).populate('service').populate('worker');
      
      // Basic stats
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'done').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      
      // Calculate total spent
      const totalSpent = bookings
        .filter(b => b.status === 'done' && b.finalPrice)
        .reduce((sum, b) => sum + b.finalPrice, 0);
      
      // Service usage statistics
      const serviceStats = {};
      bookings.forEach(booking => {
        if (booking.service) {
          const serviceName = booking.service.name;
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = { count: 0, totalSpent: 0 };
          }
          serviceStats[serviceName].count++;
          if (booking.status === 'done' && booking.finalPrice) {
            serviceStats[serviceName].totalSpent += booking.finalPrice;
          }
        }
      });
      
      // Calculate loyalty level based on same worker service usage (VIP from 3+ bookings with same worker)
      let loyaltyLevel = 'normal';
      
      // Group bookings by worker
      const workerStats = {};
      bookings.forEach(booking => {
        if (booking.worker) {
          const workerId = booking.worker.toString();
          if (!workerStats[workerId]) {
            workerStats[workerId] = 0;
          }
          workerStats[workerId]++;
        }
      });
      
      // Check if customer has booked 3+ services from any single worker
      const maxBookingsWithSameWorker = Math.max(...Object.values(workerStats), 0);
      if (maxBookingsWithSameWorker >= 3) {
        loyaltyLevel = 'vip';
      }
      
      // Recent bookings (last 5)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      user._doc.stats = {
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalSpent,
        loyaltyLevel,
        serviceStats,
        recentBookings
      };
    }
    
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// update profile (self)
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, address, phone, currentPassword, newPassword, citizenId } = req.body;
    const actorRole = req.user.role;

    if (actorRole === 'worker') {
      if (name !== undefined && name !== user.name) {
        return res.status(403).json({ message: 'Thợ không thể tự update họ tên. Vui lòng liên hệ quản trị viên.' });
      }
      if (newPassword) {
        return res.status(403).json({ message: 'Thợ không thể tự đổi mật khẩu. Vui lòng liên hệ quản trị viên.' });
      }
      if (citizenId !== undefined && citizenId !== user.citizenId) {
        return res.status(403).json({ message: 'CCCD được quản lý bởi quản trị viên.' });
      }
    } else {
      if (name !== undefined) user.name = name;
      if (citizenId !== undefined) user.citizenId = citizenId;
    }

    if (address !== undefined) user.address = address;
    // phone change requires currentPassword (unless admin), ensure uniqueness
    if (phone !== undefined && phone !== user.phone) {
      if (req.user.role !== 'admin') {
        const success = await bcrypt.compare(currentPassword || '', user.password);
        if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
      }
      const exists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: 'Phone already in use' });
      user.phone = phone;
    }
    // password change
    if (newPassword && actorRole !== 'worker') {
      if (req.user.role !== 'admin') {
        const success = await bcrypt.compare(currentPassword || '', user.password);
        if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    const sanitized = await User.findById(user._id).select('-password -resetOTP');
    res.json(sanitized);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// customers list (worker)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('name phone address usageCount loyaltyLevel createdAt');
    res.json(customers);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// bookings history for a customer (worker)
exports.getCustomerBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ customer: id }).populate('service customer');
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// request OTP for password reset (mock send)
exports.requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const code = String(Math.floor(100000 + Math.random()*900000));
    user.resetOTP = await bcrypt.hash(code, 5); // store hashed
    user.resetOTPExpires = new Date(Date.now() + 10*60*1000); // 10 minutes
    await user.save();
    console.log('OTP for', phone, 'is', code); // mock delivery
    res.json({ message: 'OTP generated (mock sent)' });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !user.resetOTP || !user.resetOTPExpires) return res.status(400).json({ message: 'OTP not requested' });
    if (user.resetOTPExpires < new Date()) return res.status(400).json({ message: 'OTP expired' });
    const match = await bcrypt.compare(otp, user.resetOTP);
    if (!match) return res.status(400).json({ message: 'Invalid OTP' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset success' });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    console.log('uploadAvatar controller called');
    console.log('req.file:', req.file);
    console.log('req.user:', req.user);
    
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    const targetUserId = (req.user.role === 'admin' && (req.body?.userId || req.query.userId))
      ? (req.body.userId || req.query.userId)
      : req.user.id;

    if (req.user.role === 'worker' && targetUserId === req.user.id) {
      return res.status(403).json({ message: 'Ảnh đại diện của thợ sẽ do quản trị viên update.' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role === 'worker' && !user._id.equals(req.user.id)) {
      return res.status(403).json({ message: 'Không thể update avatar cho tài khoản khác.' });
    }

    // Upload to Google Cloud Storage
    const { uploadToGCS, deleteFromGCS } = require('../middleware/upload-gcs');
    
    // Delete old avatar from GCS if exists
    if (user.avatar && user.avatar.includes('storage.googleapis.com')) {
      try {
        const urlParts = user.avatar.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        await deleteFromGCS(`${folder}/${filename}`);
        console.log(`Deleted old avatar from GCS: ${folder}/${filename}`);
      } catch (error) {
        console.error('Error deleting old avatar from GCS:', error);
      }
    }

    // Upload new avatar to GCS
    const { filename, publicUrl } = await uploadToGCS(req.file, 'avatars');
    
    // Save new avatar URL
    user.avatar = publicUrl;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -resetOTP');
    res.json({ 
      message: 'Avatar uploaded successfully', 
      user: updatedUser 
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
  const filePath = path.join(__dirname, '../storage/avatars', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const targetUserId = (req.user.role === 'admin' && (req.body?.userId || req.query.userId))
      ? (req.body.userId || req.query.userId)
      : req.user.id;

    if (req.user.role === 'worker' && targetUserId === req.user.id) {
      return res.status(403).json({ message: 'Ảnh đại diện của thợ sẽ do quản trị viên update.' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.avatar) {
      return res.status(400).json({ message: 'No avatar to delete' });
    }

    // Delete avatar file from GCS
    if (user.avatar.includes('storage.googleapis.com')) {
      try {
        const { deleteFromGCS } = require('../middleware/upload-gcs');
        const urlParts = user.avatar.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        await deleteFromGCS(`${folder}/${filename}`);
        console.log(`Deleted avatar from GCS: ${folder}/${filename}`);
      } catch (error) {
        console.error('Error deleting avatar from GCS:', error);
      }
    }

    // Remove avatar from user record
    user.avatar = undefined;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -resetOTP');
    res.json({ 
      message: 'Avatar deleted successfully', 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle online status for workers
exports.toggleOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;
    
    // Only workers can toggle their online status
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can toggle online status' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if worker is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Tài khoản chưa được kích hoạt, không thể bật chế độ làm việc',
        status: user.status
      });
    }

    // Toggle online status
    if (typeof isOnline === 'boolean') {
      user.isOnline = isOnline;
    } else {
      user.isOnline = !user.isOnline;
    }

    await user.save();

    // Emit socket event to notify about status change
    if (req.io) {
      req.io.emit('workerStatusChanged', {
        workerId: user._id,
        isOnline: user.isOnline,
        name: user.name
      });
    }

    const updatedUser = await User.findById(user._id).select('-password -resetOTP');
    res.json({ 
      message: user.isOnline ? 'Đã bật chế độ làm việc' : 'Đã tắt chế độ làm việc',
      user: updatedUser,
      isOnline: user.isOnline
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Số điện thoại là bắt buộc' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'Số điện thoại không tồn tại' });
    }

    // Generate OTP - use test OTP in development or for specific test phones
    let otp;
    const isTestEnvironment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const testPhones = ['0123456789', '0987654321', '0999999999']; // Test phone numbers
    
    if (isTestEnvironment || testPhones.includes(phone)) {
      // Use fixed OTP for testing
      otp = '123456';
    } else {
      // Generate random 6-digit OTP for production
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // In production, you would send SMS here
    // For development, we'll return the OTP in response
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({ 
      message: 'Mã OTP đã được send đến số điện thoại của bạn',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Số điện thoại và mã OTP là bắt buộc' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'Số điện thoại không tồn tại' });
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: 'Không có mã OTP hợp lệ' });
    }

    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    }

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ 
      message: 'Xác thực OTP successful',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Token và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear OTP
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: 'Đổi mật khẩu successful' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Find nearby workers
exports.findNearbyWorkers = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000, serviceType, limit = 20 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Vị trí (latitude, longitude) là bắt buộc' });
    }

    const UserEnhanced = require('../models/UserEnhanced');
    
    // Build query
    const query = {
      role: 'worker',
      status: 'active',
      'performance.isOnline': true,
      'location.coordinates': {
        $near: {
          $geometry: { 
            type: 'Point', 
            coordinates: [parseFloat(longitude), parseFloat(latitude)] 
          },
          $maxDistance: parseInt(maxDistance) // meters
        }
      }
    };

    // Filter by service type if provided
    if (serviceType && serviceType !== 'all') {
      query.specializations = serviceType;
    }

    const workers = await UserEnhanced.find(query)
      .select('name phone location specializations performance.averageRating performance.totalJobs performance.responseTime')
      .limit(parseInt(limit));

    // Calculate distance for each worker
    const workersWithDistance = workers.map(worker => {
      let distance = null;
      if (worker.location && worker.location.coordinates) {
        distance = calculateDistance(
          parseFloat(latitude), 
          parseFloat(longitude),
          worker.location.coordinates[1], // lat
          worker.location.coordinates[0]  // lng
        );
      }
      
      return {
        _id: worker._id,
        name: worker.name,
        phone: worker.phone,
        location: worker.location,
        specializations: worker.specializations,
        rating: worker.performance?.averageRating || 0,
        totalJobs: worker.performance?.totalJobs || 0,
        responseTime: worker.performance?.responseTime || 0,
        distance: distance ? Math.round(distance * 100) / 100 : null // round to 2 decimals
      };
    });

    res.json({
      workers: workersWithDistance,
      total: workersWithDistance.length,
      searchLocation: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      maxDistance: parseInt(maxDistance)
    });

  } catch (error) {
    console.error('Find nearby workers error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Admin: Create admin account (super admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, phone, password, email } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ phone: phone.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng' });
    }

    // Check if email already exists (if provided)
    if (email && email.trim()) {
      const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email này đã được sử dụng' });
      }
    }

    // Create admin user
    const admin = new User({
      name: name.trim(),
      phone: phone.trim(),
      password: await bcrypt.hash(password, 10),
      email: email ? email.trim().toLowerCase() : undefined,
      role: 'admin',
      status: 'active'
    });

    await admin.save();
    
    // Return admin info without password
    const sanitized = admin.toObject({ versionKey: false });
    delete sanitized.password;
    delete sanitized.resetOTP;
    
    res.status(201).json({
      message: 'Admin account created successfully',
      admin: sanitized
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Update FCM token for push notifications
exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.json({ 
      message: 'FCM token updated successfully',
      success: true 
    });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
