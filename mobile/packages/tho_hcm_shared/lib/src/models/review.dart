class Review {
  final String id;
  final String? bookingId;
  final String? customerId;
  final String? workerId;
  final String? serviceId;
  final Map<String, dynamic>? customer;
  final Map<String, dynamic>? worker;
  final Map<String, dynamic>? service;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final DateTime updatedAt;

  Review({
    required this.id,
    this.bookingId,
    this.customerId,
    this.workerId,
    this.serviceId,
    this.customer,
    this.worker,
    this.service,
    required this.rating,
    this.comment,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['_id'] ?? json['id'] ?? '',
      bookingId: json['booking'] is String 
          ? json['booking'] 
          : json['booking']?['_id'],
      customerId: json['customer'] is String 
          ? json['customer'] 
          : json['customer']?['_id'],
      workerId: json['worker'] is String 
          ? json['worker'] 
          : json['worker']?['_id'],
      serviceId: json['service'] is String 
          ? json['service'] 
          : json['service']?['_id'],
      customer: json['customer'] is Map<String, dynamic> 
          ? json['customer'] 
          : null,
      worker: json['worker'] is Map<String, dynamic> 
          ? json['worker'] 
          : null,
      service: json['service'] is Map<String, dynamic> 
          ? json['service'] 
          : null,
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'booking': bookingId,
      'customer': customerId,
      'worker': workerId,
      'service': serviceId,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Review copyWith({
    String? id,
    String? bookingId,
    String? customerId,
    String? workerId,
    String? serviceId,
    Map<String, dynamic>? customer,
    Map<String, dynamic>? worker,
    Map<String, dynamic>? service,
    int? rating,
    String? comment,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Review(
      id: id ?? this.id,
      bookingId: bookingId ?? this.bookingId,
      customerId: customerId ?? this.customerId,
      workerId: workerId ?? this.workerId,
      serviceId: serviceId ?? this.serviceId,
      customer: customer ?? this.customer,
      worker: worker ?? this.worker,
      service: service ?? this.service,
      rating: rating ?? this.rating,
      comment: comment ?? this.comment,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Helper getters
  String? get customerName => customer?['name'];
  String? get customerAvatar => customer?['avatar'];
  String? get workerName => worker?['name'];
  String? get serviceName => service?['name'];
}
