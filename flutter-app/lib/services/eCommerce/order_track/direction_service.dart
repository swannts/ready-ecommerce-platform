import 'dart:developer';
import 'package:dio/dio.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class DirectionsService {
  static final Dio _dio = Dio();

  static Future<List<LatLng>> getRoutePolyline({
    required LatLng start,
    required LatLng end,
    required String apiKey,
  }) async {
    try {
      final url =
          'https://maps.googleapis.com/maps/api/directions/json'
          '?origin=${start.latitude},${start.longitude}'
          '&destination=${end.latitude},${end.longitude}'
          '&mode=driving'
          '&key=$apiKey';

      final response = await _dio.get(url);
      log("DIRECTIONS RESPONSE-->>: ${response.data}");

      final data = response.data;

      if (data['routes'] == null || data['routes'].isEmpty) {
        log("No route found!");
        return [];
      }

      final encodedPolyline = data['routes'][0]['overview_polyline']['points'];

      final decodedPoints = PolylinePoints.decodePolyline(encodedPolyline);

      return decodedPoints.map((e) => LatLng(e.latitude, e.longitude)).toList();
    } on DioException catch (e) {
      log("DioError: ${e.message}");
      return [];
    } catch (e) {
      log(" Unexpected Error: $e");
      return [];
    }
  }
}