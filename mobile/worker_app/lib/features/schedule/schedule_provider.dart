import 'package:flutter/foundation.dart';
import 'schedule_model.dart';
import 'schedule_repository.dart';
import '../../core/utils/api_response.dart';

class ScheduleProvider extends ChangeNotifier {
  final ScheduleRepository _repository = ScheduleRepository();

  // State variables
  WorkerSchedule? _schedule;
  CurrentJobResponse? _currentJob;
  bool _isLoading = false;
  String? _error;

  // Getters
  WorkerSchedule? get schedule => _schedule;
  CurrentJobResponse? get currentJob => _currentJob;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasCurrentJob => _currentJob?.hasCurrentJob ?? false;
  bool get isAvailable => _currentJob?.status == 'available';

  // Get information current job
  Future<void> getCurrentJob() async {
    _setLoading(true);
    _clearError();

    final response = await _repository.getCurrentJob();

    if (response.success) {
      _currentJob = response.data;
    } else {
      _setError(response.error ?? 'Lỗi khi lấy thông tin công việc');
    }

    _setLoading(false);
  }

  // Get available schedule of worker
  Future<void> getMySchedule() async {
    _setLoading(true);
    _clearError();

    final response = await _repository.getMySchedule();

    if (response.success) {
      _schedule = response.data;
    } else {
      _setError(response.error ?? 'Lỗi khi lấy lịch rãnh');
    }

    _setLoading(false);
  }

  // Start work with estimated time
  Future<bool> startJobWithEstimatedTime({
    required String bookingId,
    required DateTime estimatedCompletionTime,
    DateTime? actualStartTime,
  }) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.startJobWithEstimatedTime(
      bookingId: bookingId,
      estimatedCompletionTime: estimatedCompletionTime,
      actualStartTime: actualStartTime,
    );

    if (response.success) {
      // Refresh current job after starting
      await getCurrentJob();
      await getMySchedule();
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi bắt đầu công việc');
      _setLoading(false);
      return false;
    }
  }

  // Update estimated time
  Future<bool> updateEstimatedTime(DateTime newEstimatedTime) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.updateEstimatedTime(
      newEstimatedCompletionTime: newEstimatedTime,
    );

    if (response.success) {
      // Refresh current job after updating
      await getCurrentJob();
      await getMySchedule();
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi cập nhật thời gian dự kiến');
      _setLoading(false);
      return false;
    }
  }

  // Complete work current
  Future<bool> completeCurrentJob({String? bookingId}) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.completeCurrentJob(bookingId: bookingId);

    if (response.success) {
      // Refresh state after completing job
      await getCurrentJob();
      await getMySchedule();
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi hoàn thành công việc');
      _setLoading(false);
      return false;
    }
  }

  // Add new available time slot
  Future<bool> addAvailableSlot({
    required DateTime startTime,
    required DateTime endTime,
    String? note,
  }) async {
    _setLoading(true);
    _clearError();

    print('ScheduleProvider: Adding slot from $startTime to $endTime');
    final response = await _repository.addAvailableSlot(
      startTime: startTime,
      endTime: endTime,
      note: note,
    );

    print(
      'ScheduleProvider: Response success: ${response.success}, error: ${response.error}',
    );
    if (response.success) {
      // Refresh schedule after adding slot
      await getMySchedule();
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi thêm khung giờ rãnh');
      _setLoading(false);
      return false;
    }
  }

  // Delete available time slot
  Future<bool> removeAvailableSlot(String slotId) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.removeAvailableSlot(slotId);

    if (response.success) {
      // Refresh schedule after removing slot
      await getMySchedule();
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi xóa khung giờ rãnh');
      _setLoading(false);
      return false;
    }
  }

  // Automatically create available schedule
  Future<bool> generateScheduleForDays(int days) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.generateScheduleForDays(days);

    if (response.success) {
      // Refresh schedule after generating
      await getMySchedule();
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi tạo lịch rãnh');
      _setLoading(false);
      return false;
    }
  }

  // Tải lại tất cả dữ liệu
  Future<void> refreshData() async {
    await Future.wait([getCurrentJob(), getMySchedule()]);
  }

  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // Tính time còn lại đến when complete (tính theo phút)
  int? get timeRemainingInMinutes {
    if (_currentJob?.estimatedCompletion == null) return null;

    final now = DateTime.now();
    final estimated = _currentJob!.estimatedCompletion!;
    final difference = estimated.difference(now).inMinutes;

    return difference > 0 ? difference : 0;
  }

  // Kiểm tra có quá time estimated không
  bool get isOverdue {
    if (_currentJob?.estimatedCompletion == null) return false;
    return DateTime.now().isAfter(_currentJob!.estimatedCompletion!);
  }

  // Lấy danh sách slot rãnh trong tương lai
  List<AvailableSlot> get upcomingAvailableSlots {
    if (_schedule == null) return [];

    final now = DateTime.now();
    return _schedule!.availableSlots
        .where((slot) => !slot.isBooked && slot.startTime.isAfter(now))
        .toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }

  // Lấy slot tiếp theo
  AvailableSlot? get nextAvailableSlot {
    final upcomingSlots = upcomingAvailableSlots;
    return upcomingSlots.isNotEmpty ? upcomingSlots.first : null;
  }

  // Get default time slots
  Future<ApiResponse<DefaultTimeSlots>> getDefaultTimeSlots() async {
    _setLoading(true);
    _clearError();

    final response = await _repository.getDefaultTimeSlots();

    if (!response.success) {
      _setError(response.error ?? 'Lỗi khi lấy khung giờ mặc định');
    }

    _setLoading(false);
    return response;
  }

  // Update schedule after completing order
  Future<ApiResponse<String>> updateAvailabilityAfterBooking({
    DateTime? completedBookingTime,
    int additionalDays = 3,
  }) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.updateAvailabilityAfterBooking(
      completedBookingTime: completedBookingTime,
      additionalDays: additionalDays,
    );

    if (response.success) {
      // Refresh schedule after updating
      await getMySchedule();
    } else {
      _setError(response.error ?? 'Lỗi khi cập nhật lịch khả dụng');
    }

    _setLoading(false);
    return response;
  }

  // Worker self-update available time slots
  Future<ApiResponse<String>> updateCustomAvailability({
    required String date,
    required List<String> availableHours,
  }) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.updateCustomAvailability(
      date: date,
      availableHours: availableHours,
    );

    if (response.success) {
      // Refresh schedule after updating
      await getMySchedule();
    } else {
      _setError(response.error ?? 'Lỗi khi cập nhật khung giờ khả dụng');
    }

    _setLoading(false);
    return response;
  }

  // Extend working time (ẩn add time slot)
  Future<bool> extendWorkTime({
    required String bookingId,
    required int additionalHours,
  }) async {
    _setLoading(true);
    _clearError();

    final response = await _repository.extendWorkTime(
      bookingId: bookingId,
      additionalHours: additionalHours,
    );

    if (response.success) {
      // Refresh current job và schedule
      await Future.wait([getCurrentJob(), getMySchedule()]);
      _setLoading(false);
      return true;
    } else {
      _setError(response.error ?? 'Lỗi khi gia hạn thời gian làm việc');
      _setLoading(false);
      return false;
    }
  }
}
