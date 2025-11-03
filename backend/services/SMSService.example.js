/**
 * Example usage of SMSService
 * 
 * Copy this code to use SMS service in your controllers
 */

const { getSMSService } = require('./SMSService');

// ==============================================================
// Example 1: Send OTP
// ==============================================================
async function sendOTPExample() {
  const smsService = getSMSService();
  
  const phone = '0987654321';
  const otp = '123456';
  
  const result = await smsService.sendOTP(phone, otp);
  
  if (result.success) {
    console.log('OTP sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Provider:', result.provider);
  } else {
    console.error('Failed to send OTP:', result.error);
  }
}

// ==============================================================
// Example 2: Integration with User Controller (Forgot Password)
// ==============================================================
async function forgotPasswordWithSMS(phone) {
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const smsService = getSMSService();
  
  // Find user
  const user = await User.findOne({ phone });
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate OTP
  let otp;
  if (smsService.isTestPhone(phone)) {
    // Test phone numbers always use OTP: 123456
    otp = '123456';
  } else {
    // Generate random 6-digit OTP for production
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Hash and save OTP
  const hashedOTP = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  user.resetOTP = hashedOTP;
  user.resetOTPExpiry = otpExpiry;
  await user.save();
  
  // Send OTP via SMS
  const result = await smsService.sendOTP(phone, otp);
  
  if (!result.success) {
    // SMS failed but OTP is saved - user can retry
    console.error('SMS sending failed:', result.error);
    // Don't throw error - allow user to request resend
  }
  
  return {
    success: true,
    message: 'OTP has been sent to your phone',
    messageId: result.messageId
  };
}

// ==============================================================
// Example 3: Send Custom Message
// ==============================================================
async function sendCustomMessageExample() {
  const smsService = getSMSService();
  
  const phone = '0987654321';
  const message = 'Chao mung ban den voi Tho HCM! Tai khoan cua ban da duoc kich hoat.';
  
  const result = await smsService.sendMessage(phone, message);
  
  if (result.success) {
    console.log('Message sent!');
  }
}

// ==============================================================
// Example 4: Verify Twilio OTP (if using Twilio Verify API)
// ==============================================================
async function verifyTwilioOTPExample() {
  const smsService = getSMSService();
  
  const phone = '0987654321';
  const otp = '123456';
  
  // Only works if SMS_PROVIDER=twilio and TWILIO_VERIFY_SID is set
  const isValid = await smsService.verifyTwilioOTP(phone, otp);
  
  console.log('OTP valid?', isValid);
}

// ==============================================================
// Example 5: Check if phone is in test mode
// ==============================================================
function testPhoneExample() {
  const smsService = getSMSService();
  
  console.log('Is test phone?', smsService.isTestPhone('0123456789')); // true
  console.log('Is test phone?', smsService.isTestPhone('0999999999')); // false
}

// ==============================================================
// Example 6: Complete Forgot Password Flow
// ==============================================================

// Step 1: Request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const smsService = getSMSService();
    
    if (!phone) {
      return res.status(400).json({ message: 'Số điện thoại là bắt buộc' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      // Security: Don't reveal if phone exists
      return res.json({ message: 'Nếu số điện thoại tồn tại, mã OTP sẽ được gửi' });
    }

    // Generate OTP
    let otp;
    if (smsService.isTestPhone(phone)) {
      otp = '123456'; // Test phones
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Hash and save OTP
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP
    const result = await smsService.sendOTP(phone, otp);
    
    if (!result.success) {
      console.error('[Forgot Password] SMS failed:', result.error);
      // Continue anyway - OTP is saved, user can retry
    }

    res.json({ 
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
      // Only in development
      ...(process.env.NODE_ENV === 'development' && result.provider === 'mock' ? { otp } : {})
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Step 2: Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
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

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.resetOTP);
    if (!isValid) {
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ 
      message: 'Xác thực OTP thành công',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Step 3: Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Token và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
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

    // Update password and clear OTP
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendOTPExample,
  forgotPasswordWithSMS,
  sendCustomMessageExample,
  verifyTwilioOTPExample,
  testPhoneExample
};
