/**
 * Standardized Vietnamese Messages for API Responses
 * 
 * Usage:
 * const MSG = require('../constants/messages');
 * return res.status(400).json({ message: MSG.USER.NAME_REQUIRED });
 */

const MESSAGES = {
  // USER MESSAGES
  USER: {
    // Registration & Login
    NAME_REQUIRED: 'Tên là bắt buộc',
    PHONE_REQUIRED: 'Số điện thoại là bắt buộc',
    PASSWORD_REQUIRED: 'Mật khẩu là bắt buộc',
    PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự',
    PASSWORD_MIN_LENGTH_6: 'Mật khẩu phải có ít nhất 6 ký tự',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    REGISTER_FAILED: 'Đăng ký thất bại',
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    
    // User Status
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    PHONE_NOT_FOUND: 'Số điện thoại không tồn tại',
    PHONE_ALREADY_REGISTERED: 'Số điện thoại này đã được đăng ký',
    PHONE_ALREADY_USED_ROLE: 'Số điện thoại này đã được sử dụng cho vai trò này',
    CCCD_ALREADY_REGISTERED: 'CCCD này đã được đăng ký',
    CCCD_ALREADY_USED: 'CCCD này đã được sử dụng bởi thợ/tài xế khác',
    WRONG_PASSWORD: 'Mật khẩu không đúng',
    CURRENT_PASSWORD_INCORRECT: 'Mật khẩu hiện tại không đúng',
    
    // Account Status
    ACCOUNT_NOT_ACTIVATED: 'Tài khoản chưa được kích hoạt',
    ACCOUNT_SUSPENDED: 'Tài khoản đã bị tạm ngưng',
    ACCOUNT_PENDING: 'Tài khoản đang chờ phê duyệt',
    INVALID_STATUS: 'Trạng thái không hợp lệ',
    
    // Authorization
    NOT_ALLOWED: 'Không được phép',
    ACCESS_DENIED: 'Từ chối truy cập',
    ADMIN_ONLY: 'Chỉ quản trị viên mới có quyền',
    UNAUTHORIZED: 'Chưa xác thực',
    
    // Update
    UPDATE_SUCCESS: 'Cập nhật thành công',
    UPDATE_FAILED: 'Cập nhật thất bại',
    DELETE_SUCCESS: 'Xóa thành công',
    DELETE_FAILED: 'Xóa thất bại',
    
    // Worker specific
    WORKER_NOT_FOUND: 'Không tìm thấy thợ',
    WORKER_DELETED: 'Đã xóa thợ thành công',
    WORKER_CANNOT_UPDATE_NAME: 'Thợ không thể tự cập nhật họ tên. Vui lòng liên hệ quản trị viên.',
    WORKER_CANNOT_CHANGE_PASSWORD: 'Thợ không thể tự đổi mật khẩu. Vui lòng liên hệ quản trị viên.',
    WORKER_AVATAR_ADMIN_ONLY: 'Ảnh đại diện của thợ/tài xế sẽ do quản trị viên cập nhật.',
    
    // Driver specific
    DRIVER_NOT_FOUND: 'Không tìm thấy tài xế',
  },

  // BOOKING MESSAGES
  BOOKING: {
    BOOKING_CREATED: 'Đã tạo đơn hàng',
    BOOKING_UPDATED: 'Đã cập nhật đơn hàng',
    BOOKING_CANCELLED: 'Đã hủy đơn hàng',
    BOOKING_NOT_FOUND: 'Không tìm thấy đơn hàng',
    STATUS_UPDATED: 'Đã cập nhật trạng thái',
    CANNOT_CANCEL: 'Không thể hủy đơn hàng này',
    ADDRESS_REQUIRED: 'Địa chỉ là bắt buộc',
    SERVICE_NOT_FOUND: 'Không tìm thấy dịch vụ',
    CUSTOMER_NOT_FOUND: 'Không tìm thấy khách hàng',
    CANNOT_BOOK_PAST: 'Không thể đặt lịch trong quá khứ. Vui lòng chọn thời gian trong tương lai.',
    CANNOT_BOOK_TOO_FAR: 'Không thể đặt lịch quá xa trong tương lai. Tối đa 90 ngày.',
    TIME_CONFLICT: 'Thời gian này đã được đặt hoặc quá gần với lịch hẹn khác. Vui lòng chọn thời gian cách xa ít nhất 30 phút.',
    UNAUTHORIZED: 'Không có quyền truy cập',
    INVALID_STATUS: 'Trạng thái không hợp lệ',
    CANNOT_COMPLETE_UNCONFIRMED: 'Không thể hoàn thành đơn hàng chưa được xác nhận',
    WORKER_ID_REQUIRED: 'workerId là bắt buộc',
    BOOKING_NOT_AUTHORIZED: 'Không tìm thấy đơn hàng hoặc không có quyền',
    CANNOT_CANCEL_STATUS: 'Không thể hủy đơn hàng với trạng thái hiện tại',
    CANNOT_CANCEL_WITHIN_24H: 'Không thể hủy đơn hàng trong vòng 24 giờ trước giờ hẹn',
    BOOKING_CANCELLED_SUCCESS: 'Hủy đơn hàng thành công',
    SERVICE_DATE_REQUIRED: 'serviceId và date là bắt buộc',
    SERVICE_NOT_EXISTS: 'Dịch vụ không tồn tại',
    WORKERS_AVAILABLE: 'Có {count} thợ khả dụng trong thời gian này',
    NO_WORKERS_AVAILABLE: 'Không có thợ nào khả dụng trong thời gian này. Vui lòng chọn thời gian khác.',
    ONLY_CANCEL_OWN: 'Bạn chỉ có thể hủy đơn hàng của mình',
    WORKER_ALREADY_ACCEPTED: 'Không thể hủy đơn hàng. Thợ đã chấp nhận đơn hàng này.',
    BOOKING_CONFIRMED: 'Đã xác nhận đơn hàng',
    BOOKING_COMPLETED: 'Đơn hàng đã hoàn thành',
    
    // Validation
    INVALID_STATUS: 'Trạng thái không hợp lệ',
    CANNOT_BOOK_PAST: 'Không thể đặt lịch trong quá khứ. Vui lòng chọn thời gian trong tương lai.',
    CANNOT_BOOK_FAR_FUTURE: 'Không thể đặt lịch quá xa trong tương lai. Tối đa 90 ngày.',
    TIME_SLOT_CONFLICT: 'Thời gian này đã được đặt hoặc quá gần với lịch hẹn khác. Vui lòng chọn thời gian cách xa ít nhất 30 phút.',
    WORKER_NOT_AVAILABLE: 'Thợ không khả dụng',
    CANNOT_COMPLETE_NOT_CONFIRMED: 'Không thể hoàn thành đơn hàng chưa được xác nhận',
    CANNOT_CANCEL_CURRENT_STATUS: 'Không thể hủy đơn hàng với trạng thái hiện tại',
    CANNOT_CANCEL_WITHIN_24H: 'Không thể hủy đơn hàng trong vòng 24 giờ trước giờ hẹn',
    WORKER_ALREADY_ACCEPTED: 'Không thể hủy đơn hàng. Thợ đã chấp nhận đơn hàng này.',
    ONLY_CANCEL_OWN_BOOKING: 'Bạn chỉ có thể hủy đơn hàng của chính mình',
  },

  // SERVICE MESSAGES
  SERVICE: {
    SERVICE_NOT_FOUND: 'Không tìm thấy dịch vụ',
    SERVICE_CREATED: 'Tạo dịch vụ thành công',
    SERVICE_UPDATED: 'Cập nhật dịch vụ thành công',
    SERVICE_DELETED: 'Đã xóa dịch vụ',
    NO_SERVICE_AVAILABLE: 'Không tìm thấy dịch vụ nào',
    AUTHENTICATION_REQUIRED: 'Yêu cầu xác thực',
  },

  // BANNER MESSAGES
  BANNER: {
    IMAGE_REQUIRED: 'Ảnh banner là bắt buộc',
    BANNER_NOT_FOUND: 'Không tìm thấy banner',
    BANNER_CREATED: 'Tạo banner thành công',
    BANNER_UPDATED: 'Cập nhật banner thành công',
    BANNER_DELETED: 'Đã xóa banner thành công',
    VIEW_COUNT_UPDATED: 'Đã cập nhật lượt xem',
    CLICK_COUNT_UPDATED: 'Đã cập nhật lượt click',
    BANNER_ACTIVATED: 'Đã kích hoạt banner',
    BANNER_DEACTIVATED: 'Đã tắt banner',
  },

  // SCHEDULE MESSAGES
  SCHEDULE: {
    WORKER_ID_REQUIRED: 'ID thợ là bắt buộc',
    SCHEDULE_NOT_FOUND: 'Không tìm thấy lịch làm việc',
    SLOT_NOT_FOUND: 'Không tìm thấy khung giờ',
    TIME_REQUIRED: 'Thời gian bắt đầu và kết thúc là bắt buộc',
    END_TIME_AFTER_START: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    CANNOT_CREATE_PAST: 'Không thể tạo lịch cho thời gian đã qua',
    CANNOT_BOOK_PAST: 'Không thể đặt lịch cho thời gian đã qua',
    TIME_CONFLICT: 'Khung giờ này đã trùng với lịch hiện có',
    SLOT_ALREADY_BOOKED: 'Khung giờ này đã được đặt',
    CANNOT_DELETE_BOOKED: 'Không thể xóa khung giờ đã được đặt',
    SLOT_DELETED: 'Đã xóa khung giờ thành công',
    SLOT_CREATED: 'Đã tạo khung giờ thành công',
    SCHEDULE_UPDATED_SUCCESS: 'Cập nhật lịch rãnh thành công',
    SLOT_ADDED_SUCCESS: 'Thêm khung giờ rãnh thành công',
    BOOKING_CREATED_SUCCESS: 'Đặt lịch thành công',
    SCHEDULE_UPDATED_AFTER_JOB: 'Cập nhật lịch rãnh sau khi hoàn thành việc thành công',
    NO_CURRENT_JOB: 'Không tìm thấy công việc hiện tại',
    NO_CURRENT_JOB_MESSAGE: 'Hiện tại không có công việc nào',
    JOB_STARTED: 'Đã bắt đầu công việc',
    JOB_COMPLETED: 'Đã hoàn thành công việc',
    JOB_COMPLETED_SUCCESS: 'Hoàn thành việc thành công. Trạng thái đã chuyển về sẵn sàng',
    BOOKING_ID_MISMATCH: 'Booking ID không khớp với công việc hiện tại',
    BOOKING_ID_ESTIMATED_TIME_REQUIRED: 'Booking ID và thời gian dự kiến hoàn thành là bắt buộc',
    ESTIMATED_TIME_REQUIRED: 'Thời gian dự kiến hoàn thành là bắt buộc',
    ESTIMATED_TIME_UPDATED: 'Cập nhật thời gian dự kiến hoàn thành thành công',
    NEW_ESTIMATED_TIME_REQUIRED: 'Thời gian dự kiến hoàn thành mới là bắt buộc',
    NEW_ESTIMATED_TIME_UPDATED: 'Cập nhật thời gian dự kiến thành công',
    BOOKING_NOT_FOUND_OR_NOT_YOURS: 'Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn',
    COMPLETED_BOOKING_NOT_FOUND: 'Không tìm thấy đơn hàng hoàn thành của bạn',
    INVALID_AVAILABILITY_DATA: 'Thiếu thông tin ngày hoặc khung giờ khả dụng',
    INVALID_EXTENSION_DATA: 'Booking ID và số giờ gia hạn (1-8 giờ) là bắt buộc',
    BOOKING_NOT_FOUND: 'Không tìm thấy booking',
    NOT_YOUR_BOOKING: 'Bạn không có quyền với booking này',
    CANNOT_EXTEND_BOOKING: 'Chỉ có thể gia hạn booking đang được xác nhận hoặc đang thực hiện',
  },

  // WALLET MESSAGES
  WALLET: {
    WALLET_NOT_FOUND: 'Không tìm thấy ví',
    INSUFFICIENT_BALANCE: 'Số dư không đủ',
    DEPOSIT_SUCCESS: 'Nạp tiền thành công',
    WITHDRAW_SUCCESS: 'Rút tiền thành công',
    TRANSACTION_CREATED: 'Đã tạo giao dịch',
    TRANSACTION_NOT_FOUND: 'Không tìm thấy giao dịch',
    AMOUNT_REQUIRED: 'Số tiền là bắt buộc',
    AMOUNT_INVALID: 'Số tiền không hợp lệ',
    PAYMENT_METHOD_REQUIRED: 'Phương thức thanh toán là bắt buộc',
    PAYMENT_SUCCESS: 'Thanh toán thành công',
    PAYMENT_FAILED: 'Thanh toán thất bại',
  },

  // NOTIFICATION MESSAGES
  NOTIFICATION: {
    NOTIFICATION_NOT_FOUND: 'Không tìm thấy thông báo',
    NOTIFICATION_SENT: 'Đã gửi thông báo',
    NOTIFICATION_SENT_SUCCESS: 'Đã gửi thông báo thành công',
    NOTIFICATION_SENT_TO_CUSTOMERS: 'Đã gửi thông báo đến khách hàng',
    NOTIFICATION_SENT_TO_WORKERS: 'Đã gửi thông báo đến thợ',
    NOTIFICATION_READ: 'Đã đánh dấu đã đọc',
    TITLE_REQUIRED: 'Tiêu đề là bắt buộc',
    MESSAGE_REQUIRED: 'Nội dung thông báo là bắt buộc',
    USER_ID_REQUIRED: 'ID người dùng là bắt buộc',
    MISSING_REQUIRED_FIELDS: 'Thiếu thông tin bắt buộc: userId, title, message',
    MISSING_TITLE_MESSAGE: 'Thiếu thông tin bắt buộc: title, message',
    NO_CUSTOMERS_FOUND: 'Không tìm thấy khách hàng nào',
    NO_WORKERS_FOUND: 'Không tìm thấy thợ nào',
    
    // Push notification titles (for consistency)
    PUSH_NEW_ORDER: 'Đơn hàng mới!',
    PUSH_ORDER_CANCELLED: 'Đơn hàng đã bị hủy',
    PUSH_WORKER_FOUND: 'Đã tìm thấy thợ!',
    PUSH_NEW_JOB: 'Có việc mới!',
    PUSH_EMERGENCY: 'KHẨN CẤP',
    PUSH_JOB_TIMEOUT: 'Hết thời gian nhận việc',
  },

  // OTP MESSAGES
  OTP: {
    OTP_SENT: 'Mã OTP đã được gửi đến số điện thoại của bạn',
    OTP_GENERATED: 'Đã tạo mã OTP (mock)',
    OTP_INVALID: 'Mã OTP không đúng',
    OTP_EXPIRED: 'Mã OTP đã hết hạn',
    OTP_NOT_REQUESTED: 'Chưa yêu cầu OTP',
    OTP_VERIFIED: 'Xác thực OTP thành công',
  },

  // PASSWORD MESSAGES
  PASSWORD: {
    RESET_SUCCESS: 'Đổi mật khẩu thành công',
    RESET_TOKEN_REQUIRED: 'Token và mật khẩu mới là bắt buộc',
    TOKEN_INVALID: 'Token không hợp lệ',
    TOKEN_EXPIRED: 'Token không hợp lệ hoặc đã hết hạn',
  },

  // BANKING MESSAGES
  BANKING: {
    ADMIN_ONLY: 'Chỉ admin mới có thể truy cập',
    ADMIN_UPDATE_ONLY: 'Chỉ admin mới có thể cập nhật',
    INFO_INCOMPLETE: 'Thông tin ngân hàng không đầy đủ',
    ACCOUNT_NUMBER_INVALID: 'Số tài khoản không hợp lệ (10-20 chữ số)',
    BANK_NOT_SUPPORTED: 'Tên ngân hàng không được hỗ trợ',
    UPDATE_SUCCESS: 'Cập nhật thông tin ngân hàng thành công',
    SAVED_WITH_QR_ERROR: 'Thông tin ngân hàng đã lưu, nhưng có lỗi tạo QR',
    NOT_CONFIGURED: 'Chưa cấu hình thông tin ngân hàng',
    QR_TEST_SUCCESS: 'Test QR thành công',
    QR_CREATED: 'QR code tạo thành công',
  },

  // REVIEW MESSAGES
  REVIEW: {
    REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá',
    REVIEW_CREATED: 'Tạo đánh giá thành công',
    REVIEW_UPDATED: 'Cập nhật đánh giá thành công',
    REVIEW_DELETED: 'Đã xóa đánh giá',
    RATING_REQUIRED: 'Đánh giá sao là bắt buộc',
    SERVICE_REQUIRED: 'Dịch vụ là bắt buộc',
  },

  // MIDDLEWARE MESSAGES
  MIDDLEWARE: {
    // Auth
    NO_TOKEN: 'Không có token xác thực',
    TOKEN_INVALID: 'Token không hợp lệ',
    TOKEN_EXPIRED: 'Token đã hết hạn',
    ACCESS_DENIED: 'Từ chối truy cập',
    ADMIN_ONLY: 'Chỉ quản trị viên mới có quyền',
    WORKER_ONLY: 'Chỉ thợ mới có quyền',
    CUSTOMER_ONLY: 'Chỉ khách hàng mới có quyền',
    
    // Upload
    FILE_TOO_LARGE: 'File quá lớn. Kích thước tối đa là 2MB.',
    FILE_TOO_LARGE_5MB: 'File quá lớn. Kích thước tối đa là 5MB.',
    UNEXPECTED_FIELD: 'Trường không mong đợi. Sử dụng "avatar" làm tên trường.',
    UPLOAD_ERROR: 'Lỗi upload',
    UPLOAD_FAILED: 'Upload thất bại',
    CLOUD_STORAGE_FAILED: 'Không thể upload file lên cloud storage',
    
    // Ownership
    BOOKING_NOT_FOUND: 'Không tìm thấy đơn hàng',
    NOT_YOUR_BOOKING: 'Từ chối truy cập: không phải đơn hàng của bạn',
    NOT_ASSIGNED_TO_YOU: 'Từ chối truy cập: đơn hàng không được giao cho bạn',
    SERVICE_NOT_FOUND: 'Không tìm thấy dịch vụ',
    NOT_YOUR_SERVICE: 'Từ chối truy cập: không phải dịch vụ của bạn',
  },

  // COMMON MESSAGES
  COMMON: {
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
    ERROR: 'Có lỗi xảy ra',
    INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ',
    INTERNAL_ERROR: 'Lỗi hệ thống',
    NOT_FOUND: 'Không tìm thấy',
    ALREADY_EXISTS: 'Đã tồn tại',
    CREATED: 'Đã tạo thành công',
    UPDATED: 'Đã cập nhật thành công',
    DELETED: 'Đã xóa thành công',
    NO_PERMISSION: 'Không có quyền',
  },
};

module.exports = MESSAGES;
