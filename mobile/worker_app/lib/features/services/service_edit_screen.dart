import 'package:flutter/material.dart';
import 'services_repository.dart';
import 'media_picker_new.dart';
import 'dart:io';

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
  final _repo = ServicesRepository();

  final GlobalKey<MediaPickerWidgetState> _mediaPickerKey = GlobalKey();

  bool _loading = false;
  List<String> _existingImages = [];
  List<String> _existingVideos = [];

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  void _initializeData() {
    if (widget.service != null) {
      final service = widget.service!;

      _nameController.text = service['name'] ?? '';
      _descController.text = service['description'] ?? '';
      _priceController.text = service['basePrice']?.toString() ?? '';
      _promoController.text = service['promoPercent']?.toString() ?? '';

      _existingImages = List<String>.from(service['images'] ?? []);
      _existingVideos = List<String>.from(service['videos'] ?? []);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _promoController.dispose();
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
        // Send existing URLs only
        'images': originalImages,
        'videos': originalVideos,
        // Send new URLs separately for backend to process
        if (newImageUrls.isNotEmpty) 'newImageUrls': newImageUrls,
        if (newVideoUrls.isNotEmpty) 'newVideoUrls': newVideoUrls,
      };

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
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

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
