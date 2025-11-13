const WorkerSchedule = require('../models/WorkerSchedule');
const User = require('../models/User');
const Booking = require('../models/Booking');
const MSG = require('../constants/messages');

// Get lịch rãnh của thợ
exports.getWorkerSchedule = async (req, res) => {
  try {
    const { workerId, date } = req.query;
    
    if (!workerId) {
      return res.status(400).json({ message: MSG.SCHEDULE.WORKER_ID_REQUIRED });
    }

    let schedule = await WorkerSchedule.findOne({ worker: workerId })
      .populate('worker', 'name phone')
      .populate('availableSlots.booking', 'customer service date status');

    if (!schedule) {
      // Tự động create lịch mặc định nếu chưa có
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
      await schedule.populate('worker', 'name phone');
    }

    // Nếu có tham số date, chỉ trả về lịch của ngày đó
    if (date) {
      const targetDate = new Date(date);
      const availableSlots = schedule.getAvailableSlotsForDate(targetDate);
      return res.json({
        worker: schedule.worker,
        date: targetDate,
        availableSlots,
        currentStatus: schedule.currentStatus
      });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of tất cả thợ và lịch rãnh của họ
exports.getAllWorkersSchedule = async (req, res) => {
  try {
    const { date, status, limit = 20, page = 1 } = req.query;
    
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    // Find tất cả thợ
    const workerFilter = { role: 'worker', status: 'active' };
    const workers = await User.find(workerFilter)
      .select('name phone')
      .skip((pageNum - 1) * lim)
      .limit(lim);

    const schedules = [];

    for (const worker of workers) {
      let schedule = await WorkerSchedule.findOne({ worker: worker._id });
      
      if (!schedule) {
        // Tự động create lịch nếu chưa có
        schedule = await WorkerSchedule.createDefaultSchedule(worker._id);
      }

      if (date) {
        // Lọc theo ngày nếu có tham số date
        const targetDate = new Date(date);
        const availableSlots = schedule.getAvailableSlotsForDate(targetDate);
        
        schedules.push({
          worker: {
            _id: worker._id,
            name: worker.name,
            phone: worker.phone
          },
          availableSlots,
          currentStatus: schedule.currentStatus,
          lastUpdated: schedule.lastUpdated
        });
      } else {
        schedules.push({
          worker: {
            _id: worker._id,
            name: worker.name,
            phone: worker.phone
          },
          availableSlots: schedule.availableSlots.filter(slot => !slot.isBooked),
          currentStatus: schedule.currentStatus,
          lastUpdated: schedule.lastUpdated
        });
      }
    }

    // Lọc theo trạng thái nếu có
    let filteredSchedules = schedules;
    if (status) {
      filteredSchedules = schedules.filter(s => s.currentStatus === status);
    }

    const total = await User.countDocuments(workerFilter);

    res.json({
      schedules: filteredSchedules,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ update lịch rãnh của mình
exports.updateWorkerSchedule = async (req, res) => {
  try {
    const workerId = req.user.id; // Get từ JWT token
    const { availableSlots, workingDays, defaultWorkingHours, currentStatus } = req.body;

    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
    }

    // Update các khung giờ rãnh
    if (availableSlots) {
      // Validate thời gian
      for (const slot of availableSlots) {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);
        
        if (startTime >= endTime) {
          return res.status(400).json({ 
            message: MSG.SCHEDULE.END_TIME_AFTER_START 
          });
        }
        
        if (startTime < new Date()) {
          return res.status(400).json({ 
            message: MSG.SCHEDULE.CANNOT_CREATE_PAST 
          });
        }
      }
      
      schedule.availableSlots = availableSlots;
    }

    // Update ngày làm việc
    if (workingDays) {
      schedule.workingDays = workingDays;
    }

    // Update giờ làm việc mặc định
    if (defaultWorkingHours) {
      schedule.defaultWorkingHours = defaultWorkingHours;
    }

    // Update trạng thái hiện tại
    if (currentStatus) {
      schedule.currentStatus = currentStatus;
    }

    schedule.lastUpdated = new Date();
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.SCHEDULE_UPDATED_SUCCESS,
      schedule 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ thêm khung giờ rãnh mới
exports.addAvailableSlot = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { startTime, endTime, note } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: MSG.SCHEDULE.TIME_REQUIRED });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: MSG.SCHEDULE.END_TIME_AFTER_START });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: MSG.SCHEDULE.CANNOT_CREATE_PAST });
    }

    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
    }

    // Check trùng lịch
    const isConflict = schedule.availableSlots.some(slot => 
      (start < slot.endTime && end > slot.startTime)
    );

    if (isConflict) {
      return res.status(409).json({ message: MSG.SCHEDULE.TIME_CONFLICT });
    }

    schedule.availableSlots.push({
      startTime: start,
      endTime: end,
      note: note || '',
      isBooked: false
    });

    schedule.lastUpdated = new Date();
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.SLOT_ADDED_SUCCESS,
      newSlot: schedule.availableSlots[schedule.availableSlots.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ delete khung giờ rãnh
exports.removeAvailableSlot = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { slotId } = req.params;

    const schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      return res.status(404).json({ message: MSG.SCHEDULE.SCHEDULE_NOT_FOUND });
    }

    const slotIndex = schedule.availableSlots.findIndex(
      slot => slot._id.toString() === slotId
    );

    if (slotIndex === -1) {
      return res.status(404).json({ message: MSG.SCHEDULE.SLOT_NOT_FOUND });
    }

    const slot = schedule.availableSlots[slotIndex];

    // Không cho phép xóa slot đã được đặt
    if (slot.isBooked) {
      return res.status(400).json({ message: MSG.SCHEDULE.CANNOT_DELETE_BOOKED });
    }

    schedule.availableSlots.splice(slotIndex, 1);
    schedule.lastUpdated = new Date();
    await schedule.save();

    res.json({ message: MSG.SCHEDULE.SLOT_DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đặt lịch cho một khung giờ rãnh
exports.bookTimeSlot = async (req, res) => {
  try {
    const { workerId, slotId } = req.params;
    const customerId = req.user.id;

    const schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      return res.status(404).json({ message: MSG.SCHEDULE.SCHEDULE_NOT_FOUND });
    }

    const slot = schedule.availableSlots.id(slotId);
    
    if (!slot) {
      return res.status(404).json({ message: MSG.SCHEDULE.SLOT_NOT_FOUND });
    }

    if (slot.isBooked) {
      return res.status(409).json({ message: MSG.SCHEDULE.SLOT_ALREADY_BOOKED });
    }

    if (slot.startTime < new Date()) {
      return res.status(400).json({ message: MSG.SCHEDULE.CANNOT_BOOK_PAST });
    }

    // Create booking mới
    const booking = new Booking({
      customer: customerId,
      worker: workerId,
      service: req.body.service, // Service ID từ request
      date: slot.startTime,
      address: req.body.address,
      note: req.body.note,
      status: 'pending'
    });

    await booking.save();

    // Update slot
    slot.isBooked = true;
    slot.booking = booking._id;
    schedule.lastUpdated = new Date();
    
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.BOOKING_CREATED_SUCCESS,
      booking: booking._id,
      slot: {
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ update trạng thái sau khi hoàn thành việc
exports.updateStatusAfterCompletion = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { bookingId, nextAvailableSlots } = req.body;

    // Verify booking belongs to this worker and is completed
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      worker: workerId,
      status: 'done' 
    });

    if (!booking) {
      return res.status(404).json({ 
        message: MSG.SCHEDULE.COMPLETED_BOOKING_NOT_FOUND 
      });
    }

    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
    }

    // Add các khung giờ rãnh mới sau khi hoàn thành việc
    if (nextAvailableSlots && nextAvailableSlots.length > 0) {
      for (const newSlot of nextAvailableSlots) {
        const start = new Date(newSlot.startTime);
        const end = new Date(newSlot.endTime);

        // Validate thời gian
        if (start >= end) {
          continue; // Skip invalid slots
        }

        if (start < new Date()) {
          continue; // Skip past slots
        }

        // Check trùng lịch
        const isConflict = schedule.availableSlots.some(slot => 
          (start < slot.endTime && end > slot.startTime)
        );

        if (!isConflict) {
          schedule.availableSlots.push({
            startTime: start,
            endTime: end,
            note: newSlot.note || 'Rãnh sau khi hoàn thành việc',
            isBooked: false
          });
        }
      }
    }

    // Update trạng thái về available
    schedule.currentStatus = 'available';
    schedule.lastUpdated = new Date();
    
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.SCHEDULE_UPDATED_AFTER_JOB,
      newSlotsAdded: nextAvailableSlots ? nextAvailableSlots.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ update thời gian dự kiến hoàn thành khi nhận đơn
exports.updateEstimatedCompletion = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { bookingId, estimatedCompletionTime, actualStartTime } = req.body;

    if (!bookingId || !estimatedCompletionTime) {
      return res.status(400).json({ 
        message: MSG.SCHEDULE.BOOKING_ID_ESTIMATED_TIME_REQUIRED 
      });
    }

    // Verify booking belongs to this worker
    const Booking = require('../models/Booking');
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      worker: workerId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!booking) {
      return res.status(404).json({ 
        message: MSG.SCHEDULE.BOOKING_NOT_FOUND_OR_NOT_YOURS 
      });
    }

    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
    }

    // Update công việc hiện tại và tạo lịch rãnh
    schedule.updateCurrentJob(
      bookingId, 
      estimatedCompletionTime, 
      actualStartTime || new Date()
    );
    
    schedule.lastUpdated = new Date();
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.ESTIMATED_TIME_UPDATED,
      estimatedCompletion: estimatedCompletionTime,
      newAvailableSlots: schedule.availableSlots.filter(slot => 
        !slot.isBooked && slot.startTime > new Date(estimatedCompletionTime)
      ).length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ update lại thời gian dự kiến nếu có thay đổi
exports.updateEstimatedTime = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { newEstimatedCompletionTime } = req.body;

    if (!newEstimatedCompletionTime) {
      return res.status(400).json({ 
        message: MSG.SCHEDULE.NEW_ESTIMATED_TIME_REQUIRED 
      });
    }

    const schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule || !schedule.currentJob.booking) {
      return res.status(404).json({ 
        message: MSG.SCHEDULE.NO_CURRENT_JOB 
      });
    }

    // Update thời gian dự kiến mới
    schedule.currentJob.estimatedCompletionTime = new Date(newEstimatedCompletionTime);
    
    // Tạo lại lịch rãnh với thời gian mới
    schedule.generateSlotsAfterCompletion();
    schedule.lastUpdated = new Date();
    
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.NEW_ESTIMATED_TIME_UPDATED,
      newEstimatedTime: newEstimatedCompletionTime,
      updatedSlots: schedule.availableSlots.filter(slot => 
        !slot.isBooked && slot.startTime > new Date()
      ).length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ hoàn thành việc hiện tại
exports.completeCurrentJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { bookingId } = req.body;

    const schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule || !schedule.currentJob.booking) {
      return res.status(404).json({ 
        message: MSG.SCHEDULE.NO_CURRENT_JOB 
      });
    }

    if (bookingId && schedule.currentJob.booking.toString() !== bookingId) {
      return res.status(400).json({ 
        message: MSG.SCHEDULE.BOOKING_ID_MISMATCH 
      });
    }

    // Hoàn thành việc
    schedule.completeCurrentJob();
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.JOB_COMPLETED_SUCCESS,
      status: 'available'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get thông tin công việc hiện tại của thợ
exports.getCurrentJob = async (req, res) => {
  try {
    const workerId = req.user.id;

    const schedule = await WorkerSchedule.findOne({ worker: workerId })
      .populate('currentJob.booking', 'customer service date status address note');

    if (!schedule) {
      return res.status(404).json({ message: MSG.SCHEDULE.SCHEDULE_NOT_FOUND });
    }

    if (!schedule.currentJob.booking) {
      return res.json({ 
        hasCurrentJob: false,
        status: schedule.currentStatus,
        message: MSG.SCHEDULE.NO_CURRENT_JOB_MESSAGE
      });
    }

    res.json({
      hasCurrentJob: true,
      currentJob: schedule.currentJob,
      status: schedule.currentStatus,
      estimatedCompletion: schedule.currentJob.estimatedCompletionTime,
      timeRemaining: schedule.currentJob.estimatedCompletionTime ? 
        Math.max(0, new Date(schedule.currentJob.estimatedCompletionTime) - new Date()) : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tự động tạo lịch rãnh cho các ngày tới
exports.generateScheduleForDays = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { days = 7 } = req.body;

    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      schedule = await WorkerSchedule.createDefaultSchedule(workerId, days);
    } else {
      schedule.generateSlotsForDays(days);
      await schedule.save();
    }

    res.json({ 
      message: `Tự động tạo lịch rãnh cho ${days} ngày tới thành công`,
      schedule 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ update lịch khả dụng sau khi hoàn thành booking
exports.updateAvailabilityAfterBooking = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { completedBookingTime, additionalDays = 3 } = req.body;

    const schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      return res.status(404).json({ message: MSG.SCHEDULE.SCHEDULE_NOT_FOUND });
    }

    // Update trạng thái và tạo lịch mới
    schedule.updateAvailabilityAfterBooking(completedBookingTime, additionalDays);
    await schedule.save();

    res.json({ 
      message: MSG.SCHEDULE.SCHEDULE_UPDATED_SUCCESS,
      status: schedule.currentStatus,
      availableSlots: schedule.availableSlots.filter(slot => 
        !slot.isBooked && slot.startTime > new Date()
      ).slice(0, 20) // Get 20 slot gần nhất
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thợ tự update khung giờ khả dụng cho ngày cụ thể
exports.updateCustomAvailability = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { date, availableHours } = req.body;

    if (!date || !availableHours || !Array.isArray(availableHours)) {
      return res.status(400).json({ 
        message: MSG.SCHEDULE.INVALID_AVAILABILITY_DATA 
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const invalidTimes = availableHours.filter(time => !timeRegex.test(time));
    if (invalidTimes.length > 0) {
      return res.status(400).json({ 
        message: `Định dạng giờ không hợp lệ: ${invalidTimes.join(', ')}`
      });
    }

    const schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      return res.status(404).json({ message: MSG.SCHEDULE.SCHEDULE_NOT_FOUND });
    }

    // Update lịch tùy chỉnh
    schedule.updateCustomAvailability(date, availableHours);
    await schedule.save();

    // Get lại slot của ngày được update
    const targetDate = new Date(date);
    const updatedSlots = schedule.getAvailableSlotsForDate(targetDate);

    res.json({ 
      message: MSG.SCHEDULE.SCHEDULE_UPDATED_SUCCESS,
      date: targetDate,
      updatedSlots: updatedSlots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get khung giờ mặc định của hệ thống
exports.getDefaultTimeSlots = async (req, res) => {
  try {
    const workerId = req.user.id;
    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    
    if (!schedule) {
      // Create schedule mặc định nếu chưa có
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
    }

    res.json({
      defaultTimeSlots: schedule.defaultTimeSlots,
      workingDays: schedule.workingDays,
      defaultWorkingHours: schedule.defaultWorkingHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gia hạn thời gian làm việc (ẩn thêm khung giờ)
exports.extendWorkTime = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { bookingId, additionalHours } = req.body;

    if (!bookingId || !additionalHours || additionalHours < 1 || additionalHours > 8) {
      return res.status(400).json({ 
        message: MSG.SCHEDULE.INVALID_EXTENSION_DATA 
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate('worker');
    if (!booking) {
      return res.status(404).json({ message: MSG.SCHEDULE.BOOKING_NOT_FOUND });
    }

    // Check booking thuộc về thợ này
    if (booking.worker._id.toString() !== workerId) {
      return res.status(403).json({ message: MSG.SCHEDULE.NOT_YOUR_BOOKING });
    }

    // Check booking đang trong trạng thái có thể gia hạn
    if (!['confirmed', 'in_progress'].includes(booking.status)) {
      return res.status(400).json({ 
        message: MSG.SCHEDULE.CANNOT_EXTEND_BOOKING 
      });
    }

    // Calculate thời gian kết thúc mới
    const currentEndTime = new Date(booking.preferredTime);
    currentEndTime.setHours(currentEndTime.getHours() + 1); // Booking ban đầu là 1 giờ
    
    const newEndTime = new Date(currentEndTime);
    newEndTime.setHours(newEndTime.getHours() + additionalHours);

    // Find và update WorkerSchedule
    let schedule = await WorkerSchedule.findOne({ worker: workerId });
    if (!schedule) {
      schedule = await WorkerSchedule.createDefaultSchedule(workerId);
    }

    // Create các slot cần ẩn (từ thời gian kết thúc cũ đến thời gian kết thúc mới)
    const slotsToBlock = [];
    const currentTime = new Date(currentEndTime);
    
    while (currentTime < newEndTime) {
      const slotEnd = new Date(currentTime);
      slotEnd.setHours(slotEnd.getHours() + 1);
      
      slotsToBlock.push({
        startTime: new Date(currentTime),
        endTime: slotEnd,
        isBooked: true, // Đánh dấu là đã đặt để ẩn khỏi web
        booking: bookingId,
        note: `Gia hạn từ booking ${bookingId}`
      });
      
      currentTime.setHours(currentTime.getHours() + 1);
    }

    // Add các slot bị ẩn vào lịch
    schedule.availableSlots.push(...slotsToBlock);
    
    // Update thời gian
    schedule.lastUpdated = new Date();
    await schedule.save();

    // Update booking với thời gian gia hạn
    booking.extendedEndTime = newEndTime;
    booking.additionalHours = (booking.additionalHours || 0) + additionalHours;
    await booking.save();

    res.json({ 
      message: `Đã gia hạn thêm ${additionalHours} giờ`,
      newEndTime: newEndTime,
      blockedSlots: slotsToBlock.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkerSchedule: exports.getWorkerSchedule,
  getAllWorkersSchedule: exports.getAllWorkersSchedule,
  updateWorkerSchedule: exports.updateWorkerSchedule,
  addAvailableSlot: exports.addAvailableSlot,
  removeAvailableSlot: exports.removeAvailableSlot,
  bookTimeSlot: exports.bookTimeSlot,
  updateStatusAfterCompletion: exports.updateStatusAfterCompletion,
  updateEstimatedCompletion: exports.updateEstimatedCompletion,
  updateEstimatedTime: exports.updateEstimatedTime,
  completeCurrentJob: exports.completeCurrentJob,
  getCurrentJob: exports.getCurrentJob,
  generateScheduleForDays: exports.generateScheduleForDays,
  updateAvailabilityAfterBooking: exports.updateAvailabilityAfterBooking,
  updateCustomAvailability: exports.updateCustomAvailability,
  getDefaultTimeSlots: exports.getDefaultTimeSlots,
  extendWorkTime: exports.extendWorkTime
};