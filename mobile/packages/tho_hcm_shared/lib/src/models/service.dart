class Service {
  final String id;
  final String name;
  final String description;
  final double basePrice;
  final double price;
  final double? promoPercent;
  final List<String> images;
  final List<String> videos;
  final bool isActive;
  final String? category;
  final String? workerId;
  final Map<String, dynamic>? worker;
  final double? rating;
  final int? reviewCount;

  Service({
    required this.id,
    required this.name,
    required this.description,
    required this.basePrice,
    required this.price,
    this.promoPercent,
    this.images = const [],
    this.videos = const [],
    this.isActive = true,
    this.category,
    this.workerId,
    this.worker,
    this.rating,
    this.reviewCount,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      price: (json['price'] ?? 0).toDouble(),
      promoPercent: json['promoPercent']?.toDouble(),
      images: json['images'] != null 
          ? List<String>.from(json['images']) 
          : [],
      videos: json['videos'] != null 
          ? List<String>.from(json['videos']) 
          : [],
      isActive: json['isActive'] ?? true,
      category: json['category'],
      workerId: json['worker'] is String 
          ? json['worker'] 
          : json['worker']?['_id'],
      worker: json['worker'] is Map<String, dynamic> 
          ? json['worker'] 
          : null,
      rating: json['rating']?.toDouble(),
      reviewCount: json['reviewCount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'description': description,
      'basePrice': basePrice,
      'price': price,
      'promoPercent': promoPercent,
      'images': images,
      'videos': videos,
      'isActive': isActive,
      'category': category,
      'worker': workerId,
      'rating': rating,
      'reviewCount': reviewCount,
    };
  }

  Service copyWith({
    String? id,
    String? name,
    String? description,
    double? basePrice,
    double? price,
    double? promoPercent,
    List<String>? images,
    List<String>? videos,
    bool? isActive,
    String? category,
    String? workerId,
    Map<String, dynamic>? worker,
    double? rating,
    int? reviewCount,
  }) {
    return Service(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      basePrice: basePrice ?? this.basePrice,
      price: price ?? this.price,
      promoPercent: promoPercent ?? this.promoPercent,
      images: images ?? this.images,
      videos: videos ?? this.videos,
      isActive: isActive ?? this.isActive,
      category: category ?? this.category,
      workerId: workerId ?? this.workerId,
      worker: worker ?? this.worker,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
    );
  }

  bool get hasPromo => promoPercent != null && promoPercent! > 0;
  double get discount => hasPromo ? basePrice * (promoPercent! / 100) : 0;
  String? get workerName => worker?['name'];
  String? get workerPhone => worker?['phone'];
  String? get workerAvatar => worker?['avatar'];
}
