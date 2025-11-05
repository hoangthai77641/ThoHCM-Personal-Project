import 'package:flutter/material.dart';
import 'services_repository.dart';
import 'media_picker_new.dart';
import 'dart:io';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ServiceEditScreen extends StatefulWidget {
  final Map<String, dynamic>? service;

  const ServiceEditScreen({super.key, this.service});

  @override
  State<ServiceEditScreen> createState() => _ServiceEditScreenState();
}

class _ServiceEditScreenState extends State<ServiceEditScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _promoController = TextEditingController();
  
  // Vehicle specs controllers
  final _loadCapacityController = TextEditingController();
  final _lengthController = TextEditingController();
  final _widthController = TextEditingController();
  final _heightController = TextEditingController();
  final _pricePerKmController = TextEditingController();
  
  final _repo = ServicesRepository();

  final GlobalKey<MediaPickerWidgetState> _mediaPickerKey = GlobalKey();

  bool _loading = false;
  List<String> _existingImages = [];
  List<String> _existingVideos = [];
  
  String? _selectedCategory;
  Map<String, dynamic>? _currentUser;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  void _initializeData() async {
    // Get current user from storage
    try {
      final prefs = await SharedPreferences.getInstance();
      final meStr = prefs.getString('me');
      if (meStr != null) {
        setState(() {
          _currentUser = Map<String, dynamic>.from(jsonDecode(meStr));
        });
      }
    } catch (_) {}
    
    if (widget.service != null) {
      final service = widget.service!;

      _nameController.text = service['name'] ?? '';
      _descController.text = service['description'] ?? '';
      _priceController.text = service['basePrice']?.toString() ?? '';
      _promoController.text = service['promoPercent']?.toString() ?? '';
      
      setState(() {
        _selectedCategory = service['category'];
      });
      
      // Load vehicle specs if exists
      final vehicleSpecs = service['vehicleSpecs'];
      if (vehicleSpecs != null) {
        _loadCapacityController.text = vehicleSpecs['loadCapacity']?.toString() ?? '';
        _pricePerKmController.text = vehicleSpecs['pricePerKm']?.toString() ?? '5000';
        final dimensions = vehicleSpecs['truckBedDimensions'];
        if (dimensions != null) {
          _lengthController.text = dimensions['length']?.toString() ?? '';
          _widthController.text = dimensions['width']?.toString() ?? '';
          _heightController.text = dimensions['height']?.toString() ?? '';
        }
      } else if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
        // Set default price per km for new transport services
        _pricePerKmController.text = '5000';
      }

      _existingImages = List<String>.from(service['images'] ?? []);
      _existingVideos = List<String>.from(service['videos'] ?? []);
    } else {
      // New service - set default category for driver
      if (_currentUser?['role'] == 'driver') {
        setState(() {
          _selectedCategory = 'Dịch Vụ Vận Chuyển';
        });
        // Set default price per km
        _pricePerKmController.text = '5000';
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _promoController.dispose();
    _loadCapacityController.dispose();
    _lengthController.dispose();
    _widthController.dispose();
    _heightController.dispose();
    _pricePerKmController.dispose();
    super.dispose();
  }

  Future<void> _saveService() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      final mediaPickerState = _mediaPickerKey.currentState;
      final newImages = mediaPickerState?.newImages ?? <File>[];
      final newVideos = mediaPickerState?.newVideos ?? <File>[];
      final newImageUrls = mediaPickerState?.newImageUrls ?? <String>[];
      final newVideoUrls = mediaPickerState?.newVideoUrls ?? <String>[];

      // Get the original images/videos from widget.service if editing
      final originalImages = widget.service != null
          ? List<String>.from(widget.service!['images'] ?? [])
          : <String>[];
      final originalVideos = widget.service != null
          ? List<String>.from(widget.service!['videos'] ?? [])
          : <String>[];

      final payload = {
        'name': _nameController.text.trim(),
        'description': _descController.text.trim(),
        if (_priceController.text.trim().isNotEmpty)
          'basePrice': int.tryParse(_priceController.text.trim()),
        if (_promoController.text.trim().isNotEmpty)
          'promoPercent': int.tryParse(_promoController.text.trim()),
        if (_selectedCategory != null) 'category': _selectedCategory,
        // Send existing URLs only
        'images': originalImages,
        'videos': originalVideos,
        // Send new URLs separately for backend to process
        if (newImageUrls.isNotEmpty) 'newImageUrls': newImageUrls,
        if (newVideoUrls.isNotEmpty) 'newVideoUrls': newVideoUrls,
      };
      
      // Add vehicle specs for transportation services
      if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
        if (_loadCapacityController.text.isNotEmpty &&
            _lengthController.text.isNotEmpty &&
            _widthController.text.isNotEmpty &&
            _heightController.text.isNotEmpty) {
          payload['vehicleSpecs'] = {
            'loadCapacity': double.tryParse(_loadCapacityController.text),
            'truckBedDimensions': {
              'length': double.tryParse(_lengthController.text),
              'width': double.tryParse(_widthController.text),
              'height': double.tryParse(_heightController.text),
            },
            'pricePerKm': double.tryParse(_pricePerKmController.text) ?? 5000,
          };
        }
      }

      print('💾 Save service payload:');
      print('  originalImages: $originalImages');
      print('  originalVideos: $originalVideos');
      print('  newImages: ${newImages.length}');
      print('  newVideos: ${newVideos.length}');
      print('  newImageUrls: $newImageUrls');
      print('  newVideoUrls: $newVideoUrls');

      if (widget.service == null) {
        await _repo.create(payload, images: newImages, videos: newVideos);
      } else {
        await _repo.update(
          widget.service!['_id'],
          payload,
          images: newImages,
          videos: newVideos,
        );
      }

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lưu dịch vụ thành công!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onMediaChanged(List<String> images, List<String> videos) {
    print('📝 _onMediaChanged called:');
    print('  images: $images');
    print('  videos: $videos');

    setState(() {
      _existingImages = images;
      _existingVideos = videos;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.service == null ? 'Thêm dịch vụ' : 'Sửa dịch vụ'),
        actions: [
          if (_loading)
            Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            TextButton(onPressed: _saveService, child: Text('Save')),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Basic Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Thông tin cơ bản',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Tên dịch vụ *',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Vui lòng nhập tên dịch vụ';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descController,
                      decoration: const InputDecoration(
                        labelText: 'Mô tả dịch vụ',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _priceController,
                            decoration: const InputDecoration(
                              labelText: 'Giá gốc (VNĐ)',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value != null && value.isNotEmpty) {
                                final price = int.tryParse(value);
                                if (price == null || price <= 0) {
                                  return 'Giá phải là số dương';
                                }
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            controller: _promoController,
                            decoration: const InputDecoration(
                              labelText: 'Khuyến mại (%)',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value != null && value.isNotEmpty) {
                                final promo = int.tryParse(value);
                                if (promo == null || promo < 0 || promo > 100) {
                                  return 'Phải từ 0-100%';
                                }
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Category Dropdown
                    DropdownButtonFormField<String>(
                      value: _selectedCategory,
                      decoration: const InputDecoration(
                        labelText: 'Danh mục dịch vụ',
                        border: OutlineInputBorder(),
                      ),
                      items: [
                        'Điện Lạnh',
                        'Máy Giặt',
                        'Điện Gia Dụng',
                        'Hệ Thống Điện',
                        'Sửa Xe Đạp',
                        'Sửa Xe Máy',
                        'Sửa Xe Oto',
                        'Sửa Xe Điện',
                        'Dịch Vụ Vận Chuyển',
                      ].map((cat) => DropdownMenuItem(
                        value: cat,
                        enabled: _currentUser?['role'] != 'driver' || cat == 'Dịch Vụ Vận Chuyển',
                        child: Text(cat),
                      )).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedCategory = value;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Vehicle Specs Card (only for transportation)
            if (_selectedCategory == 'Dịch Vụ Vận Chuyển') ...[
              Card(
                color: Colors.blue[50],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.local_shipping, color: Colors.blue[700]),
                          const SizedBox(width: 8),
                          Text(
                            'Thông Tin Xe',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: Colors.blue[700],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Thông tin xe là bắt buộc cho dịch vụ vận chuyển',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 16),
                      
                      // Load Capacity
                      TextFormField(
                        controller: _loadCapacityController,
                        decoration: const InputDecoration(
                          labelText: 'Tải trọng (kg) *',
                          hintText: 'Ví dụ: 1000 (cho xe 1 tấn)',
                          prefixIcon: Icon(Icons.scale),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        validator: (value) {
                          if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
                            if (value == null || value.isEmpty) {
                              return 'Tải trọng là bắt buộc';
                            }
                            if (double.tryParse(value) == null) {
                              return 'Phải là số';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      
                      // Dimensions
                      Text(
                        'Kích thước thùng xe (mét)',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _lengthController,
                              decoration: const InputDecoration(
                                labelText: 'Dài (m) *',
                                hintText: '2.5',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              validator: (value) {
                                if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
                                  if (value == null || value.isEmpty) return 'Bắt buộc';
                                  if (double.tryParse(value) == null) return 'Số';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextFormField(
                              controller: _widthController,
                              decoration: const InputDecoration(
                                labelText: 'Rộng (m) *',
                                hintText: '1.6',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              validator: (value) {
                                if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
                                  if (value == null || value.isEmpty) return 'Bắt buộc';
                                  if (double.tryParse(value) == null) return 'Số';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextFormField(
                              controller: _heightController,
                              decoration: const InputDecoration(
                                labelText: 'Cao (m) *',
                                hintText: '1.8',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              validator: (value) {
                                if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
                                  if (value == null || value.isEmpty) return 'Bắt buộc';
                                  if (double.tryParse(value) == null) return 'Số';
                                }
                                return null;
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Price per km
                      TextFormField(
                        controller: _pricePerKmController,
                        decoration: const InputDecoration(
                          labelText: 'Giá tiền trên mỗi km (VNĐ/km) *',
                          hintText: '5000',
                          prefixIcon: Icon(Icons.attach_money),
                          border: OutlineInputBorder(),
                          helperText: 'Khách hàng sẽ được tính phí dựa trên khoảng cách',
                        ),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        validator: (value) {
                          if (_selectedCategory == 'Dịch Vụ Vận Chuyển') {
                            if (value == null || value.isEmpty) {
                              return 'Giá tiền trên km là bắt buộc';
                            }
                            final price = double.tryParse(value);
                            if (price == null || price <= 0) {
                              return 'Giá phải là số dương';
                            }
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Media Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hình ảnh & Video',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Thêm ảnh và video để khách hàng có thể xem được dịch vụ của bạn',
                      style: Theme.of(
                        context,
                      ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 16),
                    MediaPickerWidget(
                      key: _mediaPickerKey,
                      initialImages: _existingImages,
                      initialVideos: _existingVideos,
                      onMediaChanged: _onMediaChanged,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
