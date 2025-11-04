class User {
  final String id;
  final String name;
  final String phone;
  final String role;
  final String? address;
  final String? avatar;
  final String? citizenId;
  final int usageCount;
  final String loyaltyLevel;
  final String status;
  final bool isOnline;
  final String? walletStatus;
  final String? fcmToken;

  User({
    required this.id,
    required this.name,
    required this.phone,
    required this.role,
    this.address,
    this.avatar,
    this.citizenId,
    this.usageCount = 0,
    this.loyaltyLevel = 'normal',
    this.status = 'active',
    this.isOnline = false,
    this.walletStatus,
    this.fcmToken,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'customer',
      address: json['address'],
      avatar: json['avatar'],
      citizenId: json['citizenId'],
      usageCount: json['usageCount'] ?? 0,
      loyaltyLevel: json['loyaltyLevel'] ?? 'normal',
      status: json['status'] ?? 'active',
      isOnline: json['isOnline'] ?? false,
      walletStatus: json['walletStatus'],
      fcmToken: json['fcmToken'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'phone': phone,
      'role': role,
      'address': address,
      'avatar': avatar,
      'citizenId': citizenId,
      'usageCount': usageCount,
      'loyaltyLevel': loyaltyLevel,
      'status': status,
      'isOnline': isOnline,
      'walletStatus': walletStatus,
      'fcmToken': fcmToken,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? phone,
    String? role,
    String? address,
    String? avatar,
    String? citizenId,
    int? usageCount,
    String? loyaltyLevel,
    String? status,
    bool? isOnline,
    String? walletStatus,
    String? fcmToken,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      address: address ?? this.address,
      avatar: avatar ?? this.avatar,
      citizenId: citizenId ?? this.citizenId,
      usageCount: usageCount ?? this.usageCount,
      loyaltyLevel: loyaltyLevel ?? this.loyaltyLevel,
      status: status ?? this.status,
      isOnline: isOnline ?? this.isOnline,
      walletStatus: walletStatus ?? this.walletStatus,
      fcmToken: fcmToken ?? this.fcmToken,
    );
  }

  bool get isVip => loyaltyLevel == 'vip';
  bool get isWorker => role == 'worker';
  bool get isCustomer => role == 'customer';
  bool get isAdmin => role == 'admin';
}
