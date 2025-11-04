import 'package:flutter/foundation.dart';
import '../repositories/auth_repository.dart';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  final AuthRepository _repo;

  User? user;
  String? error;
  bool loading = false;

  AuthProvider({AuthRepository? repository}) : _repo = repository ?? AuthRepository();

  Future<bool> tryRestoreSession() async {
    try {
      final userData = await _repo.getMe();
      if (userData != null) {
        user = User.fromJson(userData);
      }
      notifyListeners();
      return user != null;
    } catch (e) {
      return false;
    }
  }

  Future<bool> login(String phone, String password, {String role = 'customer'}) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      final data = await _repo.login(phone: phone, password: password, role: role);
      user = User.fromJson(data['user']);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String phone,
    required String password,
    String? address,
    String role = 'customer',
  }) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      await _repo.register(
        name: name,
        phone: phone,
        password: password,
        address: address,
        role: role,
      );
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    user = null;
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> payload) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      final userData = await _repo.updateMe(payload);
      user = User.fromJson(userData);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> uploadAvatar(dynamic imageFile) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      final userData = await _repo.uploadAvatar(imageFile);
      user = User.fromJson(userData);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> forgotPassword(String phone, {String role = 'customer'}) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      await _repo.forgotPassword(phone, role);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyOTP(String phone, String otp, {String role = 'customer'}) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      await _repo.verifyOTP(phone, otp, role);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> resetPassword(
    String phone,
    String otp,
    String newPassword, {
    String role = 'customer',
  }) async {
    loading = true;
    error = null;
    notifyListeners();
    
    try {
      await _repo.resetPassword(phone, otp, newPassword, role);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }
}
