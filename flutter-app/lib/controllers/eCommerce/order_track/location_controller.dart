import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';

final locationServiceProvider = Provider((ref) {
  return LocationService();
});

final locationProvider = FutureProvider<Position>((ref) async {
  final position = await ref.read(locationServiceProvider).getCurrentLocation();
  await ref.read(hiveServiceProvider).saveCustomerLocation(
        latitude: position.latitude,
        longitude: position.longitude,
      );
  return position;
});





