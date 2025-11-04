class Booking {
  final String id;
  final String? customerId;
  final String? workerId;
  final String? serviceId;
  final Map<String, dynamic>? customer;
  final Map<String, dynamic>? worker;
  final Map<String, dynamic>? service;
  final String date;
  final String preferredTime;
  final String address;
  final String status;
  final String? note;
  final double basePrice;
  final double vipDiscount;
  final double finalPrice;
  final String? appliedVipStatus;
  final int? estimatedDuration;
  final String? priority;
  final DateTime? extendedEndTime;
  final int? additionalHours;
  final DateTime createdAt;
  final DateTime updatedAt;

  Booking({
    required this.id,
    this.customerId,
    this.workerId,
    this.serviceId,
    this.customer,
    this.worker,
    this.service,
    required this.date,
    required this.preferredTime,
    required this.address,
    required this.status,
    this.note,
    required this.basePrice,
    this.vipDiscount = 0,
    required this.finalPrice,
    this.appliedVipStatus,
    this.estimatedDuration,
    this.priority,
    this.extendedEndTime,
    this.additionalHours,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['_id'] ?? json['id'] ?? '',
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
      date: json['date'] ?? '',
      preferredTime: json['preferredTime'] ?? '',
      address: json['address'] ?? '',
      status: json['status'] ?? 'pending',
      note: json['note'],
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      vipDiscount: (json['vipDiscount'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      appliedVipStatus: json['appliedVipStatus'],
      estimatedDuration: json['estimatedDuration'],
      priority: json['priority'],
      extendedEndTime: json['extendedEndTime'] != null 
          ? DateTime.parse(json['extendedEndTime']) 
          : null,
      additionalHours: json['additionalHours'],
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
      'customer': customerId,
      'worker': workerId,
      'service': serviceId,
      'date': date,
      'preferredTime': preferredTime,
      'address': address,
      'status': status,
      'note': note,
      'basePrice': basePrice,
      'vipDiscount': vipDiscount,
      'finalPrice': finalPrice,
      'appliedVipStatus': appliedVipStatus,
      'estimatedDuration': estimatedDuration,
      'priority': priority,
      'extendedEndTime': extendedEndTime?.toIso8601String(),
      'additionalHours': additionalHours,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Booking copyWith({
    String? id,
    String? customerId,
    String? workerId,
    String? serviceId,
    Map<String, dynamic>? customer,
    Map<String, dynamic>? worker,
    Map<String, dynamic>? service,
    String? date,
    String? preferredTime,
    String? address,
    String? status,
    String? note,
    double? basePrice,
    double? vipDiscount,
    double? finalPrice,
    String? appliedVipStatus,
    int? estimatedDuration,
    String? priority,
    DateTime? extendedEndTime,
    int? additionalHours,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Booking(
      id: id ?? this.id,
      customerId: customerId ?? this.customerId,
      workerId: workerId ?? this.workerId,
      serviceId: serviceId ?? this.serviceId,
      customer: customer ?? this.customer,
      worker: worker ?? this.worker,
      service: service ?? this.service,
      date: date ?? this.date,
      preferredTime: preferredTime ?? this.preferredTime,
      address: address ?? this.address,
      status: status ?? this.status,
      note: note ?? this.note,
      basePrice: basePrice ?? this.basePrice,
      vipDiscount: vipDiscount ?? this.vipDiscount,
      finalPrice: finalPrice ?? this.finalPrice,
      appliedVipStatus: appliedVipStatus ?? this.appliedVipStatus,
      estimatedDuration: estimatedDuration ?? this.estimatedDuration,
      priority: priority ?? this.priority,
      extendedEndTime: extendedEndTime ?? this.extendedEndTime,
      additionalHours: additionalHours ?? this.additionalHours,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Helper getters
  String? get customerName => customer?['name'];
  String? get customerPhone => customer?['phone'];
  String? get workerName => worker?['name'];
  String? get workerPhone => worker?['phone'];
  String? get serviceName => service?['name'];
  double? get servicePrice => service?['price']?.toDouble();
  
  bool get isPending => status == 'pending';
  bool get isConfirmed => status == 'confirmed';
  bool get isInProgress => status == 'in_progress';
  bool get isDone => status == 'done';
  bool get isCancelled => status == 'cancelled';
  bool get hasVipDiscount => vipDiscount > 0;
}
