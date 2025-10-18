/**
 * UI Messages and Constants for Web Application
 * All user-facing messages in English for consistent UX
 */

const UI_MESSAGES = {
  // Form Validation & Labels
  FORMS: {
    REQUIRED_FIELD: 'This field is required',
    SELECT_TIME_ADDRESS: 'Please select time and enter address',
    ADDRESS_MIN_LENGTH: 'Address must be at least 10 characters',
    INVALID_INPUT: 'Please fill in all required information',
    LOGIN_REQUIRED: 'Please login to book services',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
    NEW_PASSWORD_MIN_LENGTH: 'New password must be at least 6 characters',
    
    // Form Labels
    CREATE_ACCOUNT: 'Create Account',
    LOGIN_TITLE: 'Login',
    FULL_NAME: 'Full Name',
    FULL_NAME_PLACEHOLDER: 'Nguyen Van A',
    PHONE_NUMBER: 'Phone Number',
    PHONE_PLACEHOLDER: '09xxxxxxx',
    PHONE_EXAMPLE: 'e.g: 09xxxxxxx',
    PASSWORD: 'Password',
    PASSWORD_PLACEHOLDER: '••••••',
    ADDRESS_OPTIONAL: 'Address (optional)',
    ADDRESS_PLACEHOLDER: 'House number, street, district',
    REGISTER_BUTTON: 'Register',
    LOGIN_BUTTON: 'Login',
    FORGOT_PASSWORD: 'Forgot Password?',
    LOGOUT_CONFIRM: 'Are you sure you want to logout?'
  },

  // Booking Messages
  BOOKING: {
    SUCCESS: 'Booking successful!',
    CANCELLED: 'Booking cancelled successfully!',
    PAST_TIME_ERROR: 'Cannot book for past time. Please select future time.',
    TIME_SLOT_UNAVAILABLE: 'This time slot is not available',
    WORKER_NOT_FOUND: 'Worker information not found for this service',
    SCHEDULE_CONFLICT: 'Schedule conflict: {message}',
    GENERAL_ERROR: 'Error: {message}',
    UNKNOWN_ERROR: 'Unknown error: {message}',
    UNAUTHORIZED: 'You do not have permission to perform this action. Please login again.',
    VALIDATION_ERROR: 'Invalid information:\n{messages}',
    CONNECTION_ERROR: 'Server connection error'
  },

  // Service Information
  SERVICE: {
    TITLE: 'Service Information',
    SERVICE_LABEL: 'Service:',
    PRICE_LABEL: 'Price:',
    TIME_LABEL: 'Time:',
    ADDRESS_LABEL: 'Address *',
    ADDRESS_PLACEHOLDER: 'Enter service address',
    NOTE_LABEL: 'Note',
    NOTE_PLACEHOLDER: 'Enter note (optional)',
    WORKER_OFFLINE: 'Worker is currently offline. Please choose another service.'
  },

  // Review Section
  REVIEW: {
    SECTION_TITLE: 'Service Review',
    RATING_LABEL: 'Rating:',
    COMMENT_LABEL: 'Comment:',
    COMMENT_PLACEHOLDER: 'Share your experience with this service...',
    SUBMIT_BUTTON: 'Submit Review',
    SUBMITTING_BUTTON: 'Submitting...',
    LOGIN_TO_REVIEW: 'Please <a href="/login">login</a> to review this service.',
    RATING_REQUIRED: 'Please select a star rating',
    SUCCESS_MESSAGE: 'Your review has been submitted successfully!',
    ERROR_MESSAGE: 'An error occurred while submitting the review. Please try again.'
  },

  // Navigation & UI
  NAVIGATION: {
    THEME_TOGGLE: 'Theme',
    LOGOUT: 'Logout ({name})',
    BANNER_MANAGEMENT: 'Banners & Notifications',
    SERVICE_INFO: 'Service Information',
    BOOKING_DETAILS: 'Booking Details'
  },

  // Admin Dashboard
  ADMIN: {
    PENDING_WORKERS: 'Pending Workers ({count})',
    APPROVE_BUTTON: 'Approve',
    SUSPEND_BUTTON: 'Suspend',
    APPROVE_SUCCESS: 'Approved successfully',
    SUSPEND_SUCCESS: 'Account suspended successfully',
    NO_ADDRESS: 'No address provided'
  },

  // Banner Management
  BANNER: {
    LOGIN_AGAIN: 'Please login again',
    UPDATE_SUCCESS: 'Banner updated successfully!',
    CREATE_SUCCESS: 'Banner created successfully!',
    SELECT_IMAGE: 'Please select an image for the banner',
    DELETE_SUCCESS: 'Banner deleted successfully!',
    SAVE_ERROR: 'Error saving banner: {message}',
    DELETE_ERROR: 'Error deleting banner: {message}',
    STATUS_ERROR: 'Error changing status: {message}'
  },

  // User Management
  USERS: {
    BOOKING_LOAD_ERROR: 'Unable to load booking information',
    PASSWORD_RESET_SUCCESS: 'Password changed successfully! Please login again.'
  },

  // Admin Dashboard Messages
  ADMIN: {
    WALLET_LOAD_ERROR: 'Error loading wallet data',
    CONFIG_UPDATE_SUCCESS: 'Configuration updated successfully!',
    CONFIG_UPDATE_ERROR: 'Error updating configuration'
  },

  // Wallet Messages  
  WALLET: {
    LOAD_ERROR: 'Error loading wallet data',
    UPDATE_SUCCESS: 'Wallet updated successfully',
    INSUFFICIENT_BALANCE: 'Insufficient balance'
  },

  // General Actions
  ACTIONS: {
    RETRY: 'Try Again',
    CANCEL: 'Cancel',
    SAVE: 'Save',
    DELETE: 'Delete',
    EDIT: 'Edit',
    VIEW: 'View',
    BACK: 'Back',
    CLOSE: 'Close'
  },

  // Status Labels
  STATUS: {
    PENDING: 'Pending Confirmation',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress', 
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed'
  },

  // Date & Time
  DATE_FORMAT: {
    LOCALE: 'en-US',
    OPTIONS: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  },

  // Currency
  CURRENCY: {
    SYMBOL: '₫',
    FORMAT_LOCALE: 'en-US',
    FORMAT_OPTIONS: {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  }
};

// Success message templates
const SUCCESS_TEMPLATES = {
  BOOKING_DETAILS: `Booking successful!\n\nService: {serviceName}\nTime: {time}\nAddress: {address}\n\nYou will be redirected to "My Bookings" page to view order details.`,
  REDIRECT_MESSAGE: 'Your order has been created successfully!'
};

// Error handling templates  
const ERROR_TEMPLATES = {
  VALIDATION_ERRORS: 'Invalid information:\n{errors}',
  SCHEDULE_CONFLICT: 'Schedule conflict: {message}',
  GENERAL_ERROR: 'Error: {message}',
  UNKNOWN_ERROR: 'Unknown error: {message}'
};

// Utility functions for message formatting
const formatMessage = (template, params) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
};

const formatCurrency = (amount, locale = UI_MESSAGES.CURRENCY.FORMAT_LOCALE) => {
  return new Intl.NumberFormat(locale, UI_MESSAGES.CURRENCY.FORMAT_OPTIONS).format(amount);
};

const formatDate = (date, locale = UI_MESSAGES.DATE_FORMAT.LOCALE) => {
  return new Date(date).toLocaleDateString(locale, UI_MESSAGES.DATE_FORMAT.OPTIONS);
};

export {
  UI_MESSAGES,
  SUCCESS_TEMPLATES,
  ERROR_TEMPLATES,
  formatMessage,
  formatCurrency,
  formatDate
};