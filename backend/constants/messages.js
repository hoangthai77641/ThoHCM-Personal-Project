/**
 * Application Messages and Constants
 * All user-facing messages, error codes, and system messages in English
 */

const MESSAGES = {
  // Error Messages
  ERRORS: {
    CONNECTION_ERROR: 'Connection error',
    VALIDATION_FAILED: 'Validation failed',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    AUTHENTICATION_FAILED: 'Authentication failed',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    INVALID_INPUT: 'Invalid input data',
    DATABASE_ERROR: 'Database operation failed',
    NETWORK_ERROR: 'Network connection error',
    SERVER_ERROR: 'Internal server error'
  },

  // Success Messages  
  SUCCESS: {
    BOOKING_CREATED: 'Booking created successfully',
    BOOKING_UPDATED: 'Booking updated successfully',
    BOOKING_CANCELLED: 'Booking cancelled successfully',
    UPDATE_SUCCESS: 'Updated successfully',
    DELETE_SUCCESS: 'Deleted successfully',
    OPERATION_COMPLETED: 'Operation completed successfully',
    DATA_SAVED: 'Data saved successfully',
    LOGIN_SUCCESS: 'Login successful',
    REGISTRATION_SUCCESS: 'Registration completed successfully',
    PROFILE_UPDATED: 'Profile updated successfully'
  },

  // Validation Messages
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PHONE: 'Invalid phone number',
    MIN_LENGTH: 'Minimum length required',
    MAX_LENGTH: 'Maximum length exceeded',
    INVALID_FORMAT: 'Invalid format',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    PASSWORDS_NOT_MATCH: 'Passwords do not match'
  },

  // Business Logic Messages
  BUSINESS: {
    WORKER_NOT_AVAILABLE: 'Worker is currently not available',
    SERVICE_NOT_FOUND: 'Service not found',
    SCHEDULE_CONFLICT: 'Schedule conflict detected',
    INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
    PAYMENT_FAILED: 'Payment processing failed',
    BOOKING_EXPIRED: 'Booking has expired',
    ALREADY_BOOKED: 'Time slot already booked',
    PAST_TIME_BOOKING: 'Cannot book for past time',
    WORKER_OFFLINE: 'Worker is currently offline'
  },

  // System Messages
  SYSTEM: {
    STARTING_UPDATE: 'Starting update process for all workers...',
    FOUND_WORKERS: 'Found {count} workers',
    PROCESSING_WORKER: 'Processing worker: {name} ({id})',
    CREATING_SCHEDULE: 'Creating new work schedule...',
    SCHEDULE_CREATED: 'Schedule created successfully',
    UPDATING_SLOTS: 'Updating default time slots...',
    UPDATE_COMPLETED: 'Update completed successfully',
    CREATED_SLOTS: 'Created {count} new available slots',
    UPDATE_FINISHED: 'Update process finished!',
    STATISTICS: 'Statistics:',
    CREATED_COUNT: 'Created: {count} schedules',
    UPDATED_COUNT: 'Updated: {count} schedules',
    TOTAL_WORKERS: 'Total: {count} workers',
    DATABASE_CONNECTED: 'Database connection established',
    DATABASE_DISCONNECTED: 'Database connection closed'
  }
};

// VNPay Response Messages (English translations)
const VNPAY_MESSAGES = {
  '00': 'Transaction successful',
  '07': 'Money deducted successfully. Transaction suspected (related to fraud, unusual transaction)',
  '09': 'Transaction failed: Card/Account not registered for InternetBanking service at the bank',
  '10': 'Transaction failed: Customer authentication failed more than 3 times',
  '11': 'Transaction failed: Payment timeout expired. Please try again',
  '12': 'Transaction failed: Card/Customer account is locked',
  '13': 'Transaction failed: Incorrect OTP authentication password',
  '24': 'Transaction failed: Customer cancelled transaction',
  '51': 'Transaction failed: Insufficient account balance',
  '65': 'Transaction failed: Account exceeded daily transaction limit',
  '75': 'Payment bank is under maintenance',
  '79': 'Transaction failed: Customer entered wrong payment password too many times',
  '99': 'Other errors (remaining errors not listed in the error code list)'
};

// Service Search Keywords (English mappings)
const SEARCH_KEYWORDS = {
  // Repair/Maintenance
  'repair': ['repair', 'fix', 'maintenance', 'service'],
  'fix': ['repair', 'fix', 'troubleshoot', 'restore'],
  'maintenance': ['maintenance', 'service', 'check', 'tune-up'],
  
  // Appliances
  'air_conditioner': ['air conditioner', 'ac', 'cooling', 'hvac'],
  'washing_machine': ['washing machine', 'washer', 'laundry'],
  'refrigerator': ['refrigerator', 'fridge', 'cooling'],
  'tv': ['television', 'tv', 'display', 'screen'],
  
  // Services
  'electrical': ['electrical', 'electric', 'wiring', 'power'],
  'plumbing': ['plumbing', 'water', 'pipe', 'drain'],
  'cleaning': ['cleaning', 'wash', 'service', 'maintenance'],
  'installation': ['installation', 'setup', 'install', 'mount']
};

// Status Labels
const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed', 
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  EXPIRED: 'Expired'
};

// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  WORKER: 'worker', 
  ADMIN: 'admin'
};

// Currency and Formatting
const CURRENCY = {
  SYMBOL: '₫',
  CODE: 'VND',
  FORMAT_OPTIONS: {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
};

// Wallet Messages
const WALLET_MESSAGES = {
  ACCESS_DENIED: 'Only workers can access wallet',
  TOPUP_ACCESS_DENIED: 'Only workers can top up wallet',
  INVALID_AMOUNT_RANGE: 'Top up amount must be between {min} and {max}',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_SUCCESS: 'Transaction completed successfully',
  WALLET_CREATED: 'Wallet created successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal completed successfully',
  TOPUP_SUCCESS: 'Top up completed successfully',
  TOPUP_DESCRIPTION: 'Wallet top-up - {method}',
  ZALOPAY_CREATE_ERROR: 'Unable to create ZaloPay order: {message}',
  PAYMENT_GATEWAY_ERROR: 'Payment gateway connection error: {message}'
};

module.exports = {
  MESSAGES,
  VNPAY_MESSAGES,
  SEARCH_KEYWORDS,
  STATUS_LABELS,
  USER_ROLES,
  CURRENCY,
  WALLET_MESSAGES
};