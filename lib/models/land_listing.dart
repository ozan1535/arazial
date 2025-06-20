class LandListing {
  final String id;
  final String title;
  final String? description;
  final String location;
  final double areaSize;
  final String areaUnit;
  final List<String> images;
  final String ownerId;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  LandListing({
    required this.id,
    required this.title,
    this.description,
    required this.location,
    required this.areaSize,
    required this.areaUnit,
    required this.images,
    required this.ownerId,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LandListing.fromJson(Map<String, dynamic> json) {
    return LandListing(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      location: json['location'] as String,
      areaSize: (json['area_size'] as num).toDouble(),
      areaUnit: json['area_unit'] as String,
      images: (json['images'] as List<dynamic>?)?.cast<String>() ?? [],
      ownerId: json['owner_id'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'location': location,
      'area_size': areaSize,
      'area_unit': areaUnit,
      'images': images,
      'owner_id': ownerId,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class Point {
  final double x;
  final double y;

  Point(this.x, this.y);
} 