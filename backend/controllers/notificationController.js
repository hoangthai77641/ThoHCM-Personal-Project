const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const MSG = require('../constants/messages');

class NotificationController {
  constructor() {
    this.notificationService = null;
  }

  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }

  // Send notification to specific user
  sendToUser = async (req, res) => {
    try {
      const { userId, title, message, type = 'info', data = {} } = req.body;

      if (!userId || !title || !message) {
        return res.status(400).json({
          success: false,
          message: MSG.NOTIFICATION.MISSING_REQUIRED_FIELDS
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: MSG.USER.USER_NOT_FOUND
        });
      }

      // Send notification
      await this.notificationService.sendNotificationToUser(userId, {
        title,
        message,
        type,
        data
      });

      res.json({
        success: true,
        message: MSG.NOTIFICATION.NOTIFICATION_SENT_SUCCESS,
        recipient: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Error sending notification to user:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Send notification to all customers
  sendToAllCustomers = async (req, res) => {
    try {
      const { title, message, type = 'info', data = {} } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: MSG.NOTIFICATION.MISSING_TITLE_MESSAGE
        });
      }

      // Get all customers
      const customers = await User.find({ role: 'customer' }, '_id name email');
      
      if (customers.length === 0) {
        return res.status(404).json({
          success: false,
          message: MSG.NOTIFICATION.NO_CUSTOMERS_FOUND
        });
      }

      // Send notifications
      const customerIds = customers.map(customer => customer._id);
      await this.notificationService.sendBulkNotifications(customerIds, {
        title,
        message,
        type,
        data
      });

      res.json({
        success: true,
        message: `${MSG.NOTIFICATION.NOTIFICATION_SENT_TO_CUSTOMERS}: ${customers.length}`,
        recipients: customers.length,
        recipientType: 'customers'
      });

    } catch (error) {
      console.error('Error sending notification to customers:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Send notification to all workers
  sendToAllWorkers = async (req, res) => {
    try {
      const { title, message, type = 'info', data = {} } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: MSG.NOTIFICATION.MISSING_TITLE_MESSAGE
        });
      }

      // Get all workers
      const workers = await User.find({ role: 'worker' }, '_id name email');
      
      if (workers.length === 0) {
        return res.status(404).json({
          success: false,
          message: MSG.NOTIFICATION.NO_WORKERS_FOUND
        });
      }

      // Send notifications
      const workerIds = workers.map(worker => worker._id);
      await this.notificationService.sendBulkNotifications(workerIds, {
        title,
        message,
        type,
        data
      });

      res.json({
        success: true,
        message: `${MSG.NOTIFICATION.NOTIFICATION_SENT_TO_WORKERS}: ${workers.length}`,
        recipients: workers.length,
        recipientType: 'workers'
      });

    } catch (error) {
      console.error('Error sending notification to workers:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Send notification to all users
  sendToAllUsers = async (req, res) => {
    try {
      const { title, message, type = 'info', data = {} } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: MSG.NOTIFICATION.MISSING_TITLE_MESSAGE
        });
      }

      // Get all users
      const users = await User.find({}, '_id name email role');
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: MSG.USER.USER_NOT_FOUND
        });
      }

      // Send notifications
      const userIds = users.map(user => user._id);
      await this.notificationService.sendBulkNotifications(userIds, {
        title,
        message,
        type,
        data
      });

      res.json({
        success: true,
        message: `${MSG.NOTIFICATION.NOTIFICATION_SENT}: ${users.length} người dùng`,
        recipients: users.length,
        recipientType: 'all_users',
        breakdown: {
          customers: users.filter(u => u.role === 'customer').length,
          workers: users.filter(u => u.role === 'worker').length,
          admins: users.filter(u => u.role === 'admin').length
        }
      });

    } catch (error) {
      console.error('Error sending notification to all users:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Send custom notification with advanced targeting
  sendCustomNotification = async (req, res) => {
    try {
      const { 
        title, 
        message, 
        type = 'info', 
        data = {},
        targetType = 'specific', // specific, customers, workers, all, custom
        userIds = [],
        filters = {} // Additional filters like location, active status, etc.
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: MSG.NOTIFICATION.MISSING_TITLE_MESSAGE
        });
      }

      let targetUsers = [];

      switch (targetType) {
        case 'specific':
          if (userIds.length === 0) {
            return res.status(400).json({
              success: false,
              message: MSG.NOTIFICATION.USER_ID_REQUIRED
            });
          }
          targetUsers = await User.find({ _id: { $in: userIds } }, '_id name email role');
          break;

        case 'customers':
          targetUsers = await User.find({ role: 'customer' }, '_id name email role');
          break;

        case 'workers':
          targetUsers = await User.find({ role: 'worker' }, '_id name email role');
          break;

        case 'all':
          targetUsers = await User.find({}, '_id name email role');
          break;

        case 'custom':
          // Apply custom filters
          const query = { role: { $in: ['customer', 'worker'] } };
          
          if (filters.role) {
            query.role = filters.role;
          }
          
          if (filters.location) {
            query['location.city'] =  { $regex: filters.location, $options: 'i' };
          }
          
          if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
          }

          if (filters.createdAfter) {
            query.createdAt = { $gte: new Date(filters.createdAfter) };
          }

          targetUsers = await User.find(query, '_id name email role');
          break;

        default:
          return res.status(400).json({
            success: false,
            message: MSG.COMMON.INVALID_INPUT
          });
      }

      if (targetUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: MSG.USER.USER_NOT_FOUND
        });
      }

      // Send notifications
      const targetUserIds = targetUsers.map(user => user._id);
      await this.notificationService.sendBulkNotifications(targetUserIds, {
        title,
        message,
        type,
        data
      });

      res.json({
        success: true,
        message: `${MSG.NOTIFICATION.NOTIFICATION_SENT}: ${targetUsers.length} người dùng`,
        recipients: targetUsers.length,
        targetType,
        breakdown: {
          customers: targetUsers.filter(u => u.role === 'customer').length,
          workers: targetUsers.filter(u => u.role === 'worker').length,
          admins: targetUsers.filter(u => u.role === 'admin').length
        }
      });

    } catch (error) {
      console.error('Error sending custom notification:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Get user's notifications
  getUserNotifications = async (req, res) => {
    try {
      const userId = req.params.userId || req.user?.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: MSG.NOTIFICATION.USER_ID_REQUIRED
        });
      }

      // This would typically query a Notification model
      // For now, returning placeholder structure
      const notifications = await this.getNotificationsFromDatabase(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
      });

      res.json({
        success: true,
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: notifications.total || 0
        }
      });

    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Mark notification as read
  markAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      const Notification = require('../models/Notification');
      
      const notification = await Notification.findOne({
        _id: notificationId,
        userId: userId
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: MSG.NOTIFICATION.NOTIFICATION_NOT_FOUND
        });
      }

      await notification.markAsRead();

      res.json({
        success: true,
        message: MSG.NOTIFICATION.NOTIFICATION_READ,
        notification: {
          id: notification._id,
          isRead: notification.isRead,
          readAt: notification.readAt
        }
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Mark all notifications as read
  markAllAsRead = async (req, res) => {
    try {
      const userId = req.params.userId || req.user?.id;

      const Notification = require('../models/Notification');
      
      const result = await Notification.markAllAsRead(userId);

      res.json({
        success: true,
        message: MSG.NOTIFICATION.NOTIFICATION_READ,
        modifiedCount: result.modifiedCount
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Delete notification
  deleteNotification = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      const Notification = require('../models/Notification');
      
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: userId
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: MSG.NOTIFICATION.NOTIFICATION_NOT_FOUND
        });
      }

      res.json({
        success: true,
        message: MSG.COMMON.DELETED,
        deletedNotification: {
          id: result._id,
          title: result.title
        }
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: MSG.COMMON.INTERNAL_ERROR
      });
    }
  };

  // Helper method to get notifications from database
  async getNotificationsFromDatabase(userId, options) {
    try {
      const Notification = require('../models/Notification');
      
      const notifications = await Notification.getUserNotifications(userId, options);
      const total = await Notification.countDocuments({ userId });
      const unread = await Notification.getUnreadCount(userId);
      
      return {
        data: notifications,
        total,
        unread
      };
    } catch (error) {
      console.error('Error getting notifications from database:', error);
      return {
        data: [],
        total: 0,
        unread: 0
      };
    }
  }

  // Legacy method for compatibility
  sendNotification = this.sendCustomNotification;
}

module.exports = new NotificationController();