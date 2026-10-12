import 'dart:developer';

import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<Position> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location service disabled');
    }

    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Permission denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      permission = await Geolocator.requestPermission();
      throw Exception('Permission permanently denied');
    }

    return Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }
}




Future<String> getAddressFromLatLng(double lat, double long) async {
  try {
    List<Placemark> placemarks = await placemarkFromCoordinates(lat, long);
    Placemark place = placemarks[0];

    List<String> parts = [];

    // Add all non-empty fields
    if (place.street?.isNotEmpty == true) parts.add(place.street!);
    if (place.subLocality?.isNotEmpty == true) parts.add(place.subLocality!);
    if (place.locality?.isNotEmpty == true) parts.add(place.locality!);
   // if (place.subAdministrativeArea?.isNotEmpty == true) parts.add(place.subAdministrativeArea!);
   // if (place.administrativeArea?.isNotEmpty == true) parts.add(place.administrativeArea!);
    if (place.postalCode?.isNotEmpty == true) parts.add(place.postalCode!);
    if (place.country?.isNotEmpty == true) parts.add(place.country!);

    log(parts.join(', '));

    return parts.isNotEmpty ? parts.join(', ') : 'Unknown location';

  } catch (e) {
    return "Unable to get address";
  }
}



