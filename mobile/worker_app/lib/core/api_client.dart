import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'env.dart';
import 'app_strings.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  late Dio dio;
  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: Env.apiBase,
        headers: {'Content-Type': 'application/json'},
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 20),
        sendTimeout: const Duration(seconds: 20),
      ),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('token');
          if (token != null) options.headers['Authorization'] = 'Bearer $token';
          handler.next(options);
        },
      ),
    );
  }

  Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await dio.post(path, data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = AppStrings.generalError;

      if (errorData is Map<String, dynamic>) {
        errorMessage = errorData['message'] ?? errorMessage;
      } else if (errorData is String) {
        errorMessage = errorData;
      }

      throw Exception(errorMessage);
    } catch (e) {
      throw Exception(AppStrings.connectionError);
    }
  }

  Future<Map<String, dynamic>> get(String path) async {
    try {
      final response = await dio.get(path);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = AppStrings.generalError;

      if (errorData is Map<String, dynamic>) {
        errorMessage = errorData['message'] ?? errorMessage;
      } else if (errorData is String) {
        errorMessage = errorData;
      }

      throw Exception(errorMessage);
    } catch (e) {
      throw Exception(AppStrings.connectionError);
    }
  }

  Future<Map<String, dynamic>> put(
    String path,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await dio.put(path, data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = AppStrings.generalError;

      if (errorData is Map<String, dynamic>) {
        errorMessage = errorData['message'] ?? errorMessage;
      } else if (errorData is String) {
        errorMessage = errorData;
      }

      throw Exception(errorMessage);
    } catch (e) {
      throw Exception(AppStrings.connectionError);
    }
  }
}
