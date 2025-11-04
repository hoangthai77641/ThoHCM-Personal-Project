import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';

class AuthException implements Exception {
  final String message;
  final String? code;
  final Map<String, dynamic>? details;

  AuthException(this.message, {this.code, this.details});

  @override
  String toString() => message;
}

class AuthRepository {
  final _api = ApiClient();

  Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
    String role = 'customer',
  }) async {
    try {
      final response = await _api.post('/api/users/login', {
        'phone': phone,
        'password': password,
        'role': role,
      });
      final token = response['token'];
      if (token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
      }
      return response;
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<void> register({
    required String name,
    required String phone,
    required String password,
    String? address,
    String role = 'customer',
  }) async {
    try {
      await _api.post('/api/users/register', {
        'name': name,
        'phone': phone,
        'password': password,
        'address': address,
        'role': role,
      });
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<Map<String, dynamic>?> getMe() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) return null;

      final response = await _api.get('/api/users/me');
      return response['user'];
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> updateMe(Map<String, dynamic> payload) async {
    try {
      final response = await _api.put('/api/users/profile', payload);
      return response['user'];
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<Map<String, dynamic>> uploadAvatar(File imageFile) async {
    try {
      await _api.uploadFile('/api/users/upload-avatar', imageFile, fieldName: 'avatar');
      final user = await getMe();
      if (user == null) throw AuthException('Failed to get updated user');
      return user;
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<void> forgotPassword(String phone, String role) async {
    try {
      await _api.post('/api/users/forgot-password', {
        'phone': phone,
        'role': role,
      });
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<void> verifyOTP(String phone, String otp, String role) async {
    try {
      await _api.post('/api/users/verify-otp', {
        'phone': phone,
        'otp': otp,
        'role': role,
      });
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<void> resetPassword(String phone, String otp, String newPassword, String role) async {
    try {
      await _api.post('/api/users/reset-password', {
        'phone': phone,
        'otp': otp,
        'newPassword': newPassword,
        'role': role,
      });
    } catch (e) {
      throw AuthException(e.toString());
    }
  }
}
