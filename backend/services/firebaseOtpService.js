const admin = require('firebase-admin');

/**
 * Firebase Phone Authentication Service
 * Miễn phí 10,000 verifications/tháng
 * 
 * Setup:
 * 1. Firebase Console → Authentication → Sign-in method
 * 2. Enable "Phone" provider
 * 3. Add authorized domain (your backend domain)
 */

class FirebaseOTPService {
  constructor() {
    // Firebase Admin SDK should be initialized in server.js
    this.initialized = false;
    
    try {
      // Check if Firebase Admin is already initialized
      this.auth = admin.auth();
      this.initialized = true;
      console.log('[Firebase OTP] Service initialized');
    } catch (error) {
      console.error('[Firebase OTP] Initialization error:', error.message);
    }
  }

  /**
   * Generate custom token for phone verification
   * Client will use this to authenticate and get OTP
   */
  async generateVerificationToken(phone) {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Normalize phone to E.164 format (+84xxxxxxxxx)
      const formattedPhone = this.formatPhoneE164(phone);
      
      // Create custom token with phone claim
      const customToken = await this.auth.createCustomToken(formattedPhone, {
        phone: formattedPhone,
        purpose: 'phone-verification'
      });

      return {
        success: true,
        token: customToken,
        phone: formattedPhone
      };
    } catch (error) {
      console.error('[Firebase OTP] Token generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify phone number using Firebase
   * Note: Actual SMS sending happens on client-side via Firebase SDK
   */
  async initiatePhoneVerification(phone) {
    try {
      const formattedPhone = this.formatPhoneE164(phone);
      
      // Firebase Phone Auth happens client-side
      // Backend just needs to verify the result
      return {
        success: true,
        message: 'Use Firebase client SDK to send OTP',
        phone: formattedPhone
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify ID token from client after OTP verification
   */
  async verifyIdToken(idToken) {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return {
        success: true,
        uid: decodedToken.uid,
        phone: decodedToken.phone_number
      };
    } catch (error) {
      console.error('[Firebase OTP] Token verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneE164(phone) {
    if (!phone) return null;

    // Remove spaces and dashes
    phone = phone.toString().replace(/[\s\-]/g, '');

    // Already in E.164 format
    if (phone.startsWith('+84')) {
      return phone;
    }

    // Convert 84xxxxxxxxx to +84xxxxxxxxx
    if (phone.startsWith('84')) {
      return '+' + phone;
    }

    // Convert 0xxxxxxxxx to +84xxxxxxxxx
    if (phone.startsWith('0')) {
      return '+84' + phone.substring(1);
    }

    return phone;
  }
}

module.exports = FirebaseOTPService;
