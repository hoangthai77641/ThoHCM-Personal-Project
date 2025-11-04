class AppStrings {
  // Error messages
  static const String generalError = 'Đã xảy ra lỗi, vui lòng thử lại';
  static const String connectionError = 'Lỗi kết nối mạng';
  static const String success = 'Thành công';
  
  // General
  static const String cancel = 'Hủy';
  static const String close = 'Đóng';
  static const String ok = 'Đồng ý';
  static const String save = 'Lưu';
  static const String delete = 'Xóa';
  static const String edit = 'Sửa';
  static const String confirm = 'Xác nhận';
  
  // Status labels
  static const Map<String, String> statusLabels = {
    'pending': 'Đang chờ',
    'confirmed': 'Đã xác nhận',
    'done': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'in_progress': 'Đang thực hiện',
  };
  
  // Booking related
  static const String bookings = 'Đơn hàng';
  static const String newBooking = 'Đơn hàng mới';
  static const String bookingDetails = 'Chi tiết đơn hàng';
  static const String customerInfo = 'Thông tin khách hàng';
  static const String serviceInfo = 'Thông tin dịch vụ';
  static const String bookingTime = 'Thời gian đặt';
  static const String completedBookings = 'Đơn hàng hoàn thành';
  static const String cancelledBookings = 'Đơn hàng đã hủy';
  
  // Home screen
  static const String dashboard = 'Tổng quan';
  static const String statistics = 'Thống kê';
  static const String todayBookings = 'Đơn hàng hôm nay';
  static const String monthlyRevenue = 'Doanh thu tháng';
  static const String totalCompleted = 'Tổng hoàn thành';
  
  // Navigation
  static const String home = 'Trang chủ';
  static const String orders = 'Đơn hàng';
  static const String profile = 'Hồ sơ';
  static const String settings = 'Cài đặt';
  static const String notifications = 'Thông báo';
  
  // Profile
  static const String personalInfo = 'Thông tin cá nhân';
  static const String workHistory = 'Lịch sử làm việc';
  static const String reviews = 'Đánh giá';
  static const String logout = 'Đăng xuất';
  
  // Common messages
  static const String noData = 'Không có dữ liệu';
  static const String loading = 'Đang tải...';
  static const String retry = 'Thử lại';
  static const String refresh = 'Làm mới';
  
  // Auth
  static const String login = 'Đăng nhập';
  static const String register = 'Đăng ký';
  static const String phone = 'Số điện thoại';
  static const String password = 'Mật khẩu';
  static const String confirmPassword = 'Xác nhận mật khẩu';
  static const String forgotPassword = 'Quên mật khẩu?';
  static const String name = 'Họ và tên';
  static const String address = 'Địa chỉ';
  
  // Services
  static const String services = 'Dịch vụ';
  static const String allServices = 'Tất cả dịch vụ';
  static const String serviceDetail = 'Chi tiết dịch vụ';
  static const String bookService = 'Đặt dịch vụ';
  static const String selectService = 'Chọn dịch vụ';
}
