const axios = require('axios');

/**
 * SMS Service - Hỗ trợ nhiều nhà cung cấp SMS
 * 
 * Providers được hỗ trợ:
 * - eSMS.vn (Khuyến nghị cho VN)
 * - Twilio (International)
 * - Mock (Development/Testing)
 */
class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'mock'; // 'esms', 'twilio', 'mock'
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // eSMS configuration
    this.esms = {
      apiKey: process.env.ESMS_API_KEY,
      secretKey: process.env.ESMS_SECRET_KEY,
      brandName: process.env.ESMS_BRAND_NAME || 'ThoHCM',
      baseUrl: 'http://rest.esms.vn/MainService.svc/json'
    };
    
    // Twilio configuration
    this.twilio = {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      verifySid: process.env.TWILIO_VERIFY_SID,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    };
    
    // Initialize Twilio client if configured
    if (this.provider === 'twilio' && this.twilio.accountSid) {
      const twilio = require('twilio');
      this.twilioClient = twilio(this.twilio.accountSid, this.twilio.authToken);
    }
    
    this.validateConfiguration();
  }

  /**
   * Validate configuration based on provider
   */
  validateConfiguration() {
    if (!this.isProduction || this.provider === 'mock') {
      console.log('[SMS Service] Running in MOCK mode (development)');
      return;
    }

    if (this.provider === 'esms') {
      if (!this.esms.apiKey || !this.esms.secretKey) {
        throw new Error('eSMS credentials not configured. Set ESMS_API_KEY and ESMS_SECRET_KEY in .env');
      }
      console.log('[SMS Service] Initialized with eSMS.vn');
    } else if (this.provider === 'twilio') {
      if (!this.twilio.accountSid || !this.twilio.authToken) {
        throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
      }
      console.log('[SMS Service] Initialized with Twilio');
    }
  }

  /**
   * Send OTP SMS
   * @param {string} phone - Phone number (format: 0xxxxxxxxx or +84xxxxxxxxx)
   * @param {string} otp - OTP code (6 digits)
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendOTP(phone, otp) {
    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phone);
    
    if (!normalizedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    // Message template
    const message = `Ma OTP cua ban la: ${otp}. Ma co hieu luc trong 5 phut. Khong chia se ma nay voi bat ky ai.`;

    try {
      switch (this.provider) {
        case 'esms':
          return await this.sendViaSMS(normalizedPhone, message);
        
        case 'twilio':
          return await this.sendViaTwilio(normalizedPhone, otp);
        
        case 'mock':
        default:
          return this.sendViaMock(normalizedPhone, otp, message);
      }
    } catch (error) {
      console.error('[SMS Service] Error sending OTP:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send SMS via eSMS.vn
   */
  async sendViaSMS(phone, message) {
    try {
      const response = await axios.get(`${this.esms.baseUrl}/SendMultipleMessage_V4_get`, {
        params: {
          ApiKey: this.esms.apiKey,
          SecretKey: this.esms.secretKey,
          Phone: phone,
          Content: message,
          Brandname: this.esms.brandName,
          SmsType: 2, // 2 = OTP message type
          Sandbox: this.isProduction ? 0 : 1 // Use sandbox in non-production
        },
        timeout: 10000
      });

      const data = response.data;
      
      if (data.CodeResult === '100') {
        console.log(`[SMS Service] eSMS sent successfully to ${phone}`);
        return {
          success: true,
          messageId: data.SMSID || 'esms-' + Date.now(),
          provider: 'esms'
        };
      } else {
        console.error('[SMS Service] eSMS error:', data.ErrorMessage);
        return {
          success: false,
          error: data.ErrorMessage || 'Failed to send SMS'
        };
      }
    } catch (error) {
      console.error('[SMS Service] eSMS request failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send SMS via Twilio
   */
  async sendViaTwilio(phone, otp) {
    try {
      // Option 1: Using Twilio Verify API (recommended for OTP)
      if (this.twilio.verifySid) {
        const verification = await this.twilioClient.verify.v2
          .services(this.twilio.verifySid)
          .verifications
          .create({ 
            to: this.formatPhoneForTwilio(phone), 
            channel: 'sms' 
          });

        console.log(`[SMS Service] Twilio Verify sent to ${phone}`);
        return {
          success: true,
          messageId: verification.sid,
          provider: 'twilio-verify'
        };
      } 
      
      // Option 2: Using Twilio SMS API directly
      else if (this.twilio.fromNumber) {
        const message = `Ma OTP cua ban la: ${otp}. Ma co hieu luc trong 5 phut.`;
        
        const msg = await this.twilioClient.messages.create({
          body: message,
          from: this.twilio.fromNumber,
          to: this.formatPhoneForTwilio(phone)
        });

        console.log(`[SMS Service] Twilio SMS sent to ${phone}`);
        return {
          success: true,
          messageId: msg.sid,
          provider: 'twilio-sms'
        };
      } else {
        throw new Error('Twilio not properly configured. Need TWILIO_VERIFY_SID or TWILIO_FROM_NUMBER');
      }
    } catch (error) {
      console.error('[SMS Service] Twilio error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify Twilio OTP (if using Verify API)
   */
  async verifyTwilioOTP(phone, otp) {
    if (this.provider !== 'twilio' || !this.twilio.verifySid) {
      throw new Error('Twilio Verify not configured');
    }

    try {
      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.twilio.verifySid)
        .verificationChecks
        .create({ 
          to: this.formatPhoneForTwilio(phone), 
          code: otp 
        });

      return verificationCheck.status === 'approved';
    } catch (error) {
      console.error('[SMS Service] Twilio verification error:', error.message);
      return false;
    }
  }

  /**
   * Mock SMS for development/testing
   */
  sendViaMock(phone, otp, message) {
    console.log('\n' + '='.repeat(60));
    console.log('[SMS Service] MOCK MODE - SMS NOT ACTUALLY SENT');
    console.log('='.repeat(60));
    console.log(`📱 To: ${phone}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`💬 Message: ${message}`);
    console.log('='.repeat(60) + '\n');

    // Simulate delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          messageId: 'mock-' + Date.now(),
          provider: 'mock',
          otp: otp // Only return in mock mode for testing
        });
      }, 500);
    });
  }

  /**
   * Normalize phone number to Vietnamese format
   * Converts: +84xxxxxxxxx or 84xxxxxxxxx to 0xxxxxxxxx
   */
  normalizePhoneNumber(phone) {
    if (!phone) return null;

    // Remove spaces and dashes
    phone = phone.toString().replace(/[\s\-]/g, '');

    // Convert +84 or 84 to 0
    if (phone.startsWith('+84')) {
      phone = '0' + phone.substring(3);
    } else if (phone.startsWith('84')) {
      phone = '0' + phone.substring(2);
    }

    // Validate Vietnamese phone number (10-11 digits starting with 0)
    if (!/^0[0-9]{9,10}$/.test(phone)) {
      return null;
    }

    return phone;
  }

  /**
   * Format phone for Twilio (international format)
   */
  formatPhoneForTwilio(phone) {
    const normalized = this.normalizePhoneNumber(phone);
    if (!normalized) return phone;

    // Convert 0xxxxxxxxx to +84xxxxxxxxx
    return '+84' + normalized.substring(1);
  }

  /**
   * Check if phone number is in test mode
   * Test phone numbers always receive OTP: 123456
   */
  isTestPhone(phone) {
    const testPhones = (process.env.SMS_TEST_PHONES || '').split(',').map(p => p.trim());
    const normalized = this.normalizePhoneNumber(phone);
    return testPhones.includes(normalized) || testPhones.includes(phone);
  }

  /**
   * Send custom SMS message (not OTP)
   * @param {string} phone 
   * @param {string} message 
   */
  async sendMessage(phone, message) {
    const normalizedPhone = this.normalizePhoneNumber(phone);
    
    if (!normalizedPhone) {
      return { success: false, error: 'Invalid phone number' };
    }

    if (this.provider === 'esms') {
      return await this.sendViaSMS(normalizedPhone, message);
    } else if (this.provider === 'twilio' && this.twilio.fromNumber) {
      try {
        const msg = await this.twilioClient.messages.create({
          body: message,
          from: this.twilio.fromNumber,
          to: this.formatPhoneForTwilio(normalizedPhone)
        });
        return { success: true, messageId: msg.sid };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Mock
      console.log(`[SMS Mock] To: ${normalizedPhone}, Message: ${message}`);
      return { success: true, messageId: 'mock-' + Date.now() };
    }
  }
}

// Singleton instance
let smsServiceInstance = null;

/**
 * Get SMS Service instance
 */
function getSMSService() {
  if (!smsServiceInstance) {
    smsServiceInstance = new SMSService();
  }
  return smsServiceInstance;
}

module.exports = SMSService;
module.exports.getSMSService = getSMSService;
