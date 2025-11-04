class Validators {
  // Phone validation (Vietnamese format)
  static String? phone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập số điện thoại';
    }
    
    // Remove spaces and special characters
    final cleanPhone = value.replaceAll(RegExp(r'[^\d]'), '');
    
    // Check if it's a valid Vietnamese phone number (10 digits, starts with 0)
    if (!RegExp(r'^0\d{9}$').hasMatch(cleanPhone)) {
      return 'Số điện thoại không hợp lệ';
    }
    
    return null;
  }

  // Password validation
  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập mật khẩu';
    }
    
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    return null;
  }

  // Confirm password validation
  static String? confirmPassword(String? value, String? password) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    
    if (value != password) {
      return 'Mật khẩu không khớp';
    }
    
    return null;
  }

  // Name validation
  static String? name(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập họ tên';
    }
    
    if (value.length < 2) {
      return 'Tên phải có ít nhất 2 ký tự';
    }
    
    return null;
  }

  // Address validation
  static String? address(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập địa chỉ';
    }
    
    if (value.length < 5) {
      return 'Địa chỉ phải có ít nhất 5 ký tự';
    }
    
    return null;
  }

  // Required field validation
  static String? required(String? value, {String? fieldName}) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập ${fieldName ?? 'thông tin'}';
    }
    return null;
  }

  // OTP validation
  static String? otp(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập mã OTP';
    }
    
    if (value.length != 6) {
      return 'Mã OTP phải có 6 chữ số';
    }
    
    if (!RegExp(r'^\d{6}$').hasMatch(value)) {
      return 'Mã OTP chỉ chứa số';
    }
    
    return null;
  }

  // Rating validation
  static String? rating(int? value) {
    if (value == null || value < 1 || value > 5) {
      return 'Vui lòng chọn đánh giá từ 1 đến 5 sao';
    }
    return null;
  }
}
