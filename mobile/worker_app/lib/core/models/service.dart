class TruckBedDimensions {
  final double length;
  final double width;
  final double height;

  TruckBedDimensions({
    required this.length,
    required this.width,
    required this.height,
  });

  factory TruckBedDimensions.fromJson(Map<String, dynamic> json) {
    return TruckBedDimensions(
      length: (json['length'] as num).toDouble(),
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'length': length,
      'width': width,
      'height': height,
    };
  }
}

class VehicleSpecs {
  final double loadCapacity;
  final TruckBedDimensions truckBedDimensions;
  final double pricePerKm; // Giá tiền trên mỗi km (VND/km)

  VehicleSpecs({
    required this.loadCapacity,
    required this.truckBedDimensions,
    this.pricePerKm = 5000, // Giá mặc định 5000 VND/km
  });

  factory VehicleSpecs.fromJson(Map<String, dynamic> json) {
    return VehicleSpecs(
      loadCapacity: (json['loadCapacity'] as num).toDouble(),
      truckBedDimensions: TruckBedDimensions.fromJson(
        json['truckBedDimensions'] as Map<String, dynamic>,
      ),
      pricePerKm: json['pricePerKm'] != null 
          ? (json['pricePerKm'] as num).toDouble() 
          : 5000,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'loadCapacity': loadCapacity,
      'truckBedDimensions': truckBedDimensions.toJson(),
      'pricePerKm': pricePerKm,
    };
  }
}

class Service {
  final String id;
  final String name;
  final String description;
  final double basePrice;
  final String category;
  final VehicleSpecs? vehicleSpecs;
  final List<String> images;
  final List<String> videos;
  final bool isActive;
  final double? promoPercent;
  final Map<String, dynamic>? worker;

  Service({
    required this.id,
    required this.name,
    required this.description,
    required this.basePrice,
    required this.category,
    this.vehicleSpecs,
    this.images = const [],
    this.videos = const [],
    this.isActive = true,
    this.promoPercent,
    this.worker,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] ?? 'Điện Lạnh',
      vehicleSpecs: json['vehicleSpecs'] != null
          ? VehicleSpecs.fromJson(json['vehicleSpecs'] as Map<String, dynamic>)
          : null,
      images: (json['images'] as List?)?.cast<String>() ?? [],
      videos: (json['videos'] as List?)?.cast<String>() ?? [],
      isActive: json['isActive'] ?? true,
      promoPercent: (json['promoPercent'] as num?)?.toDouble(),
      worker: json['worker'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    final data = {
      'name': name,
      'description': description,
      'basePrice': basePrice,
      'category': category,
      'images': images,
      'videos': videos,
      'isActive': isActive,
    };

    if (promoPercent != null) {
      data['promoPercent'] = promoPercent!;
    }

    if (vehicleSpecs != null) {
      data['vehicleSpecs'] = vehicleSpecs!.toJson();
    }

    return data;
  }

  Service copyWith({
    String? id,
    String? name,
    String? description,
    double? basePrice,
    String? category,
    VehicleSpecs? vehicleSpecs,
    List<String>? images,
    List<String>? videos,
    bool? isActive,
    double? promoPercent,
    Map<String, dynamic>? worker,
  }) {
    return Service(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      basePrice: basePrice ?? this.basePrice,
      category: category ?? this.category,
      vehicleSpecs: vehicleSpecs ?? this.vehicleSpecs,
      images: images ?? this.images,
      videos: videos ?? this.videos,
      isActive: isActive ?? this.isActive,
      promoPercent: promoPercent ?? this.promoPercent,
      worker: worker ?? this.worker,
    );
  }
}
