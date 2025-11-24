import 'dart:io';
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

  Future<Map<String, dynamic>> get(String path,
      {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await dio.get(path, queryParameters: queryParameters);
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

  Future<bool> uploadFile(
    String path,
    File file, {
    String fieldName = 'file',
    Map<String, String>? additionalFields,
  }) async {
    try {
      print('📤 API Client: Starting upload to $path');
      print('📤 API Client: File path: ${file.path}');
      print('📤 API Client: Field name: $fieldName');
      print('📤 API Client: Additional fields: $additionalFields');

      final formData = FormData();

      // Add the file
      formData.files.add(
        MapEntry(
          fieldName,
          await MultipartFile.fromFile(
            file.path,
            filename: file.path.split('/').last,
          ),
        ),
      );

      // Add additional fields
      if (additionalFields != null) {
        for (final entry in additionalFields.entries) {
          formData.fields.add(MapEntry(entry.key, entry.value));
        }
      }

      print('📤 API Client: Sending POST request...');
      final response = await dio.post(path, data: formData);

      print('📤 API Client: Response status: ${response.statusCode}');
      print('📤 API Client: Response data: ${response.data}');

      final responseData = response.data as Map<String, dynamic>;
      final success = responseData['success'] == true;
      print('📤 API Client: Upload success: $success');
      return success;
    } on DioException catch (e) {
      print('❌ API Client: DioException - Status: ${e.response?.statusCode}');
      print('❌ API Client: DioException - Data: ${e.response?.data}');

      final errorData = e.response?.data;
      String errorMessage = AppStrings.generalError;

      if (errorData is Map<String, dynamic>) {
        errorMessage = errorData['message'] ?? errorMessage;
      } else if (errorData is String) {
        errorMessage = errorData;
      }

      throw Exception(errorMessage);
    } catch (e) {
      print('❌ API Client: General exception: $e');
      throw Exception('Upload failed: ${e.toString()}');
    }
  }
}
