// import 'dart:developer';
// import 'dart:async';
// import 'dart:math' as math;
//
// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:geolocator/geolocator.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:ready_ecommerce/config/app_constants.dart';
// import 'package:ready_ecommerce/controllers/eCommerce/order_track/location_controller.dart';
// import 'package:ready_ecommerce/gen/assets.gen.dart';
// import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/direction_service.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/pusher_service.dart';
//
// import '../../../../controllers/eCommerce/order/order_controller.dart';
//
// class EcommerceOrderTrackLayout extends ConsumerStatefulWidget {
//   final double? customerLatitude;
//   final double? customerLongitude;
//   final double? riderLatitude;
//   final double? riderLongitude;
//   final int riderId;
//
//   const EcommerceOrderTrackLayout({
//     super.key,
//     this.customerLatitude,
//     this.customerLongitude,
//     this.riderLatitude,
//     this.riderLongitude,
//     required this.riderId,
//   });
//
//   @override
//   ConsumerState<EcommerceOrderTrackLayout> createState() =>
//       _EcommerceTrackOrderLayoutState();
// }
//
// class _EcommerceTrackOrderLayoutState
//     extends ConsumerState<EcommerceOrderTrackLayout>
//     with SingleTickerProviderStateMixin {
//   GoogleMapController? mapController;
//   Marker? customerMarker;
//   Marker? riderMarker;
//   String? currentAddress;
//   BitmapDescriptor? customerIcon;
//   BitmapDescriptor? riderIcon;
//   Set<Polyline> polylines = {};
//   LatLng? lastRiderPosition;
//   bool _isCameraFittedOnce = false;
//   bool _isInitialPolylineDrawn = false;
//
//   double? liveRiderLat;
//   double? liveRiderLng;
//
//   // ✅ Animation এর জন্য নতুন variables
//   AnimationController? _animationController;
//   Animation<double>? _animation;
//   LatLng? _startPosition;
//   LatLng? _endPosition;
//   double? _startRotation;
//   double? _endRotation;
//
//   static String googleApiKey = AppConstants.googleApiKey;
//
//   @override
//   void initState() {
//     super.initState();
//     _initMarker();
//
//     // ✅ Animation controller setup
//     _animationController = AnimationController(
//       vsync: this,
//       duration: const Duration(milliseconds: 3000), // 3 সেকেন্ড - আরো slow movement
//     );
//
//     _animation = CurvedAnimation(
//       parent: _animationController!,
//       curve: Curves.linear, // More consistent speed throughout
//     );
//
//     _animation!.addListener(() {
//       if (_startPosition != null && _endPosition != null) {
//         _interpolateMarkerPosition();
//       }
//     });
//
//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       _connectPusher();
//     });
//   }
//
//   Future<void> _connectPusher() async {
//     final token = await ref.read(hiveServiceProvider).getAuthToken();
//     log("PUSHER TOKEN------->> : $token");
//     PusherService.connectToRider(
//       riderId: widget.riderId,
//       onRiderMove: (lat, lng) {
//         log("RIDER LIVE UPDATE---------->> : $lat, $lng");
//
//         setState(() {
//           liveRiderLat = lat;
//           liveRiderLng = lng;
//         });
//         _updateRiderLocation(lat, lng);
//       },
//     );
//   }
//
//   Future<void> _initMarker() async {
//     await _loadCustomerIcon();
//     await _loadRiderIcon();
//
//     _loadCustomerMarkerOnMap();
//     _loadRiderMarkerOnMap();
//   }
//
//   Future<void> _loadCustomerIcon() async {
//     customerIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(40, 40)),
//       Assets.png.markerPerson.path,
//     );
//     setState(() {});
//   }
//
//   Future<void> _loadRiderIcon() async {
//     riderIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(40, 40)),
//       Assets.png.riderPerson.path,
//     );
//     setState(() {});
//   }
//
//   void _loadCustomerMarkerOnMap() {
//     final lat = widget.customerLatitude;
//     final lng = widget.customerLongitude;
//
//     if (lat != null && lng != null) {
//       customerMarker = Marker(
//         markerId: const MarkerId('customer_location'),
//         position: LatLng(lat, lng),
//         infoWindow: const InfoWindow(
//           title: 'Delivery Location',
//           snippet: 'Loading address...',
//         ),
//         icon: customerIcon ?? BitmapDescriptor.defaultMarker,
//         onTap: () async {
//           final address = await getAddressFromLatLng(lat, lng);
//
//           setState(() {
//             currentAddress = address;
//             customerMarker = customerMarker!.copyWith(
//               infoWindowParam: InfoWindow(
//                 title: 'Delivery Location',
//                 snippet: address,
//               ),
//             );
//           });
//
//           Future.delayed(const Duration(seconds: 3), () {
//             mapController?.hideMarkerInfoWindow(
//               const MarkerId('customer_location'),
//             );
//           });
//         },
//       );
//
//       setState(() {});
//     }
//   }
//
//   void _loadRiderMarkerOnMap() {
//     final lat = widget.riderLatitude;
//     final lng = widget.riderLongitude;
//
//     if (lat != null && lng != null) {
//       final position = LatLng(lat, lng);
//
//       riderMarker = Marker(
//         markerId: const MarkerId('rider_location'),
//         position: position,
//         infoWindow: const InfoWindow(
//           title: 'Rider Location',
//           snippet: 'Loading address...',
//         ),
//         icon: riderIcon ?? BitmapDescriptor.defaultMarker,
//         anchor: const Offset(0.5, 0.5), // ✅ Center anchor for smooth rotation
//         rotation: 0,
//         onTap: () async {
//           final address = await getAddressFromLatLng(lat, lng);
//
//           setState(() {
//             currentAddress = address;
//             riderMarker = riderMarker!.copyWith(
//               infoWindowParam: InfoWindow(
//                 title: 'Rider Location',
//                 snippet: address,
//               ),
//             );
//           });
//
//           Future.delayed(const Duration(seconds: 3), () {
//             mapController?.hideMarkerInfoWindow(
//               const MarkerId('rider_location'),
//             );
//           });
//         },
//       );
//
//       // ✅ Set initial position
//       _startPosition = position;
//       _endPosition = position;
//
//       setState(() {});
//     }
//   }
//
//   // ✅ নতুন smooth update method
//   void _updateRiderLocation(double lat, double lng) {
//     final newPos = LatLng(lat, lng);
//
//     // যদি পুরানো position না থাকে, তাহলে সরাসরি set করো
//     if (_endPosition == null) {
//       setState(() {
//         riderMarker = Marker(
//           markerId: const MarkerId('rider_location'),
//           position: newPos,
//           icon: riderIcon ?? BitmapDescriptor.defaultMarker,
//           anchor: const Offset(0.5, 0.5),
//         );
//         _startPosition = newPos;
//         _endPosition = newPos;
//       });
//       return;
//     }
//
//     // ✅ Animation চালু করো
//     _startPosition = _endPosition;
//     _endPosition = newPos;
//
//     // ✅ Rotation calculate করো (bearing/heading)
//     _startRotation = riderMarker?.rotation ?? 0;
//     _endRotation = _calculateBearing(_startPosition!, _endPosition!);
//
//     _animationController?.reset();
//     _animationController?.forward();
//
//     // ✅ Polyline আপডেট করো
//     if (widget.customerLatitude != null && widget.customerLongitude != null) {
//       _drawPolyline(
//         newPos,
//         LatLng(widget.customerLatitude!, widget.customerLongitude!),
//       );
//     }
//   }
//
//   // ✅ Interpolation method - এটা smooth movement তৈরি করে
//   void _interpolateMarkerPosition() {
//     if (_startPosition == null || _endPosition == null) return;
//
//     final t = _animation!.value;
//
//     // ✅ Lat/Lng interpolate করো
//     final lat = _startPosition!.latitude +
//         ((_endPosition!.latitude - _startPosition!.latitude) * t);
//     final lng = _startPosition!.longitude +
//         ((_endPosition!.longitude - _startPosition!.longitude) * t);
//
//     // ✅ Rotation interpolate করো
//     double rotation = _startRotation ?? 0;
//     if (_endRotation != null) {
//       double diff = _endRotation! - _startRotation!;
//
//       // ✅ Shortest rotation path নাও
//       if (diff > 180) diff -= 360;
//       if (diff < -180) diff += 360;
//
//       rotation = _startRotation! + (diff * t);
//     }
//
//     setState(() {
//       riderMarker = Marker(
//         markerId: const MarkerId('rider_location'),
//         position: LatLng(lat, lng),
//         icon: riderIcon ?? BitmapDescriptor.defaultMarker,
//         anchor: const Offset(0.5, 0.5),
//         rotation: rotation, // ✅ Smooth rotation
//       );
//     });
//   }
//
//   // ✅ Bearing/Heading calculate করার method
//   double _calculateBearing(LatLng start, LatLng end) {
//     final lat1 = start.latitude * math.pi / 180;
//     final lat2 = end.latitude * math.pi / 180;
//     final dLng = (end.longitude - start.longitude) * math.pi / 180;
//
//     final y = math.sin(dLng) * math.cos(lat2);
//     final x = math.cos(lat1) * math.sin(lat2) -
//         math.sin(lat1) * math.cos(lat2) * math.cos(dLng);
//
//     final bearing = math.atan2(y, x) * 180 / math.pi;
//
//     return (bearing + 360) % 360; // 0-360 range এ রাখো
//   }
//
//   Future<void> _drawPolyline(LatLng start, LatLng end) async {
//     final routePoints = await DirectionsService.getRoutePolyline(
//       start: start,
//       end: end,
//       apiKey: googleApiKey,
//     );
//
//     if (routePoints.isEmpty) return;
//
//     setState(() {
//       polylines.clear();
//       polylines.add(
//         Polyline(
//           polylineId: const PolylineId('route'),
//           points: routePoints,
//           color: Colors.black,
//           width: 2,
//           startCap: Cap.roundCap,
//           endCap: Cap.roundCap,
//           jointType: JointType.round,
//         ),
//       );
//     });
//
//     if (!_isCameraFittedOnce) {
//       _fitCameraToPolyline(routePoints);
//       _isCameraFittedOnce = true;
//     }
//   }
//
//   void _fitCameraToPolyline(List<LatLng> points) {
//     if (mapController == null || points.isEmpty) return;
//
//     double minLat = points.first.latitude;
//     double maxLat = points.first.latitude;
//     double minLng = points.first.longitude;
//     double maxLng = points.first.longitude;
//
//     for (final p in points) {
//       if (p.latitude < minLat) minLat = p.latitude;
//       if (p.latitude > maxLat) maxLat = p.latitude;
//       if (p.longitude < minLng) minLng = p.longitude;
//       if (p.longitude > maxLng) maxLng = p.longitude;
//     }
//
//     final bounds = LatLngBounds(
//       southwest: LatLng(minLat, minLng),
//       northeast: LatLng(maxLat, maxLng),
//     );
//
//     mapController!.animateCamera(
//       CameraUpdate.newLatLngBounds(bounds, 80),
//     );
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final locationAsync = ref.watch(locationProvider);
//
//     log("latitude------->> ${widget.customerLatitude}");
//     log("latitude------->> ${widget.customerLongitude}");
//     log("latitude------->> ${widget.riderLatitude}");
//     log("latitude------->> ${widget.riderLongitude}");
//
//     return Scaffold(
//       body: locationAsync.when(
//         data: (position) {
//           LatLng saveLatLng = LatLng(
//             widget.customerLatitude ?? position.latitude,
//             widget.customerLongitude ?? position.longitude,
//           );
//
//           final riderLat = liveRiderLat ?? widget.riderLatitude;
//           final riderLng = liveRiderLng ?? widget.riderLongitude;
//
//           if (riderLat != null && riderLng != null) {
//             final currentRiderPos = LatLng(riderLat, riderLng);
//
//             if (!_isInitialPolylineDrawn) {
//               _drawPolyline(
//                 currentRiderPos,
//                 LatLng(widget.customerLatitude!, widget.customerLongitude!),
//               );
//               lastRiderPosition = currentRiderPos;
//               _isInitialPolylineDrawn = true;
//             } else if (lastRiderPosition != null &&
//                 Geolocator.distanceBetween(
//                   lastRiderPosition!.latitude,
//                   lastRiderPosition!.longitude,
//                   currentRiderPos.latitude,
//                   currentRiderPos.longitude,
//                 ) > 5) {
//               _drawPolyline(
//                 currentRiderPos,
//                 LatLng(widget.customerLatitude!, widget.customerLongitude!),
//               );
//               lastRiderPosition = currentRiderPos;
//             }
//           }
//
//           return GoogleMap(
//             initialCameraPosition: CameraPosition(
//               target: saveLatLng,
//               zoom: 14,
//             ),
//             markers: {
//               if (customerMarker != null) customerMarker!,
//               if (riderMarker != null) riderMarker!,
//             },
//             polylines: polylines,
//             onMapCreated: (controller) {
//               mapController = controller;
//             },
//             myLocationEnabled: false,
//             myLocationButtonEnabled: false,
//           );
//         },
//         loading: () => const Center(child: CircularProgressIndicator()),
//         error: (err, stack) => Center(child: Text(err.toString())),
//       ),
//     );
//   }
//
//   @override
//   void dispose() {
//     _animationController?.dispose();
//     mapController?.dispose();
//     PusherService.disconnect(widget.riderId);
//     super.dispose();
//   }
// }

// import 'dart:async';
// import 'dart:developer';
// import 'dart:math' as math;
//
// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:geolocator/geolocator.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:ready_ecommerce/config/app_constants.dart';
// import 'package:ready_ecommerce/gen/assets.gen.dart';
// import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/direction_service.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/pusher_service.dart';
//
// import '../../../../controllers/eCommerce/order_track/location_controller.dart';
//
// class EcommerceOrderTrackLayout extends ConsumerStatefulWidget {
//   final double? customerLatitude;
//   final double? customerLongitude;
//   final double? riderLatitude;
//   final double? riderLongitude;
//   final int riderId;
//
//   const EcommerceOrderTrackLayout({
//     super.key,
//     this.customerLatitude,
//     this.customerLongitude,
//     this.riderLatitude,
//     this.riderLongitude,
//     required this.riderId,
//   });
//
//   @override
//   ConsumerState<EcommerceOrderTrackLayout> createState() =>
//       _EcommerceOrderTrackLayoutState();
// }
//
// class _EcommerceOrderTrackLayoutState
//     extends ConsumerState<EcommerceOrderTrackLayout>
//     with SingleTickerProviderStateMixin {
//   GoogleMapController? mapController;
//
//   Marker? customerMarker;
//   Marker? riderMarker;
//
//   BitmapDescriptor? customerIcon;
//   BitmapDescriptor? riderIcon;
//
//   Set<Polyline> polylines = {};
//
//   static String googleApiKey = AppConstants.googleApiKey;
//
//   // 🔥 Uber style animation variables
//   late AnimationController _animationController;
//   late Animation<double> _animation;
//
//   LatLng? _startPosition;
//   LatLng? _endPosition;
//
//   double _startRotation = 0;
//   double _endRotation = 0;
//
//   final List<LatLng> _locationQueue = [];
//   bool _isAnimating = false;
//
//   bool _isCameraFittedOnce = false;
//
//   @override
//   void initState() {
//     super.initState();
//
//     _animationController = AnimationController(vsync: this);
//     _animation = CurvedAnimation(
//       parent: _animationController,
//       curve: Curves.linear,
//     );
//
//     _animation.addListener(_interpolateMarker);
//
//     _animationController.addStatusListener((status) {
//       if (status == AnimationStatus.completed) {
//         _moveToNextPoint();
//       }
//     });
//
//     _initMarkers();
//
//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       _connectPusher();
//     });
//   }
//
//   Future<void> _connectPusher() async {
//     final token = await ref.read(hiveServiceProvider).getAuthToken();
//     log("PUSHER TOKEN: $token");
//
//     PusherService.connectToRider(
//       riderId: widget.riderId,
//       onRiderMove: (lat, lng) {
//         _enqueueLocation(LatLng(lat, lng));
//       },
//     );
//   }
//
//   void _enqueueLocation(LatLng pos) {
//     _locationQueue.add(pos);
//
//     if (!_isAnimating) {
//       _moveToNextPoint();
//     }
//   }
//
//   void _moveToNextPoint() {
//     if (_locationQueue.isEmpty) {
//       _isAnimating = false;
//       return;
//     }
//
//     _isAnimating = true;
//
//     _startPosition = riderMarker?.position ?? _locationQueue.first;
//     _endPosition = _locationQueue.removeAt(0);
//
//     final distance = Geolocator.distanceBetween(
//       _startPosition!.latitude,
//       _startPosition!.longitude,
//       _endPosition!.latitude,
//       _endPosition!.longitude,
//     );
//
//     // 🚗 Constant speed (Uber feel)
//     _animationController.duration = Duration(
//       milliseconds: (distance * 12).clamp(800, 2500).toInt(),
//     );
//
//     _startRotation = riderMarker?.rotation ?? 0;
//     _endRotation = _calculateBearing(_startPosition!, _endPosition!);
//
//     _animationController
//       ..reset()
//       ..forward();
//
//     _drawPolyline(
//       _endPosition!,
//       LatLng(widget.customerLatitude!, widget.customerLongitude!),
//     );
//   }
//
//   void _interpolateMarker() {
//     if (_startPosition == null || _endPosition == null) return;
//
//     final t = _animation.value;
//
//     final lat = _startPosition!.latitude +
//         ((_endPosition!.latitude - _startPosition!.latitude) * t);
//     final lng = _startPosition!.longitude +
//         ((_endPosition!.longitude - _startPosition!.longitude) * t);
//
//     double diff = _endRotation - _startRotation;
//     if (diff > 180) diff -= 360;
//     if (diff < -180) diff += 360;
//
//     final rotation = _startRotation + diff * t;
//
//     setState(() {
//       riderMarker = riderMarker!.copyWith(
//         positionParam: LatLng(lat, lng),
//         rotationParam: rotation,
//       );
//     });
//   }
//
//   double _calculateBearing(LatLng start, LatLng end) {
//     final lat1 = start.latitude * math.pi / 180;
//     final lat2 = end.latitude * math.pi / 180;
//     final dLng = (end.longitude - start.longitude) * math.pi / 180;
//
//     final y = math.sin(dLng) * math.cos(lat2);
//     final x = math.cos(lat1) * math.sin(lat2) -
//         math.sin(lat1) * math.cos(lat2) * math.cos(dLng);
//
//     return (math.atan2(y, x) * 180 / math.pi + 360) % 360;
//   }
//
//   Future<void> _initMarkers() async {
//     customerIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(40, 40)),
//       Assets.png.markerPerson.path,
//     );
//
//     riderIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(40, 40)),
//       Assets.png.riderPerson.path,
//     );
//
//     customerMarker = Marker(
//       markerId: const MarkerId('customer'),
//       position: LatLng(widget.customerLatitude!, widget.customerLongitude!),
//       icon: customerIcon!,
//     );
//
//     final riderPos = LatLng(widget.riderLatitude!, widget.riderLongitude!);
//
//     riderMarker = Marker(
//       markerId: const MarkerId('rider'),
//       position: riderPos,
//       icon: riderIcon!,
//       anchor: const Offset(0.5, 0.5),
//       rotation: 0,
//     );
//
//     _startPosition = riderPos;
//     _endPosition = riderPos;
//
//     setState(() {});
//   }
//
//   Future<void> _drawPolyline(LatLng start, LatLng end) async {
//     final points = await DirectionsService.getRoutePolyline(
//       start: start,
//       end: end,
//       apiKey: googleApiKey,
//     );
//
//     if (points.isEmpty) return;
//
//     setState(() {
//       polylines = {
//         Polyline(
//           polylineId: const PolylineId('route'),
//           points: points,
//           width: 3,
//           color: Colors.black,
//         ),
//       };
//     });
//
//     if (!_isCameraFittedOnce && mapController != null) {
//       _fitCamera(points);
//       _isCameraFittedOnce = true;
//     }
//   }
//
//   void _fitCamera(List<LatLng> points) {
//     final bounds = LatLngBounds(
//       southwest: LatLng(
//         points.map((e) => e.latitude).reduce(math.min),
//         points.map((e) => e.longitude).reduce(math.min),
//       ),
//       northeast: LatLng(
//         points.map((e) => e.latitude).reduce(math.max),
//         points.map((e) => e.longitude).reduce(math.max),
//       ),
//     );
//
//     mapController!.animateCamera(
//       CameraUpdate.newLatLngBounds(bounds, 80),
//     );
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final locationAsync = ref.watch(locationProvider);
//
//     return Scaffold(
//       body: locationAsync.when(
//         data: (_) => GoogleMap(
//           initialCameraPosition: CameraPosition(
//             target: LatLng(
//               widget.customerLatitude!,
//               widget.customerLongitude!,
//             ),
//             zoom: 14,
//           ),
//           markers: {
//             if (customerMarker != null) customerMarker!,
//             if (riderMarker != null) riderMarker!,
//           },
//           polylines: polylines,
//           onMapCreated: (c) => mapController = c,
//           myLocationEnabled: false,
//         ),
//         loading: () => const Center(child: CircularProgressIndicator()),
//         error: (e, _) => Center(child: Text(e.toString())),
//       ),
//     );
//   }
//
//   @override
//   void dispose() {
//     _animationController.dispose();
//     mapController?.dispose();
//     PusherService.disconnect(widget.riderId);
//     super.dispose();
//   }
// }


import 'dart:async';
import 'dart:developer';
import 'dart:math' as math;

import 'package:app_settings/app_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ready_ecommerce/config/app_constants.dart';
import 'package:ready_ecommerce/gen/assets.gen.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/services/eCommerce/order_track/direction_service.dart';
import 'package:ready_ecommerce/services/eCommerce/order_track/pusher_service.dart';

import '../../../../controllers/eCommerce/order_track/location_controller.dart';

class EcommerceOrderTrackLayout extends ConsumerStatefulWidget {
  final double? customerLatitude;
  final double? customerLongitude;
  final double? riderLatitude;
  final double? riderLongitude;
  final int riderId;

  const EcommerceOrderTrackLayout({
    super.key,
    this.customerLatitude,
    this.customerLongitude,
    this.riderLatitude,
    this.riderLongitude,
    required this.riderId,
  });

  @override
  ConsumerState<EcommerceOrderTrackLayout> createState() => _EcommerceOrderTrackLayoutState();
}

class _EcommerceOrderTrackLayoutState
    extends ConsumerState<EcommerceOrderTrackLayout>
    with SingleTickerProviderStateMixin {
  GoogleMapController? mapController;

  Marker? customerMarker;
  Marker? riderMarker;

  BitmapDescriptor? customerIcon;
  BitmapDescriptor? riderIcon;

  Set<Polyline> polylines = {};

  static String googleApiKey = AppConstants.googleApiKey;

  late AnimationController _animationController;
  late Animation<double> _animation;

  LatLng? _startPosition;
  LatLng? _endPosition;

  double _startRotation = 0;
  double _endRotation = 0;

  final List<LatLng> _locationQueue = [];
  bool _isAnimating = false;

  bool _isCameraFittedOnce = false;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(vsync: this);
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );

    _animation.addListener(_interpolateMarker);

    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _moveToNextPoint();
      }
    });

    _initMarkers();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _connectPusher();
    });
  }

  Future<void> _connectPusher() async {
    final token = await ref.read(hiveServiceProvider).getAuthToken();
    log("PUSHER TOKEN: $token");

    PusherService.connectToRider(
      riderId: widget.riderId,
      onRiderMove: (lat, lng) {
        _enqueueLocation(LatLng(lat, lng));
      },
    );
  }

  void _enqueueLocation(LatLng pos) {
    _locationQueue.add(pos);

    if (!_isAnimating) {
      _moveToNextPoint();
    }
  }

  void _moveToNextPoint() {
    if (_locationQueue.isEmpty) {
      _isAnimating = false;
      return;
    }

    _isAnimating = true;

    _startPosition = riderMarker!.position;
    _endPosition = _locationQueue.removeAt(0);

    final distance = Geolocator.distanceBetween(
      _startPosition!.latitude,
      _startPosition!.longitude,
      _endPosition!.latitude,
      _endPosition!.longitude,
    );


    _animationController.duration = Duration(
      milliseconds: (distance * 60).clamp(2000, 6000).toInt(),
    );


    _startRotation = riderMarker!.rotation;
    _endRotation = _calculateBearing(_startPosition!, _endPosition!);

    _animationController
      ..reset()
      ..forward();

    //  Update polyline (not too frequently)
    _drawPolyline(
      _endPosition!,
      LatLng(widget.customerLatitude!, widget.customerLongitude!),
    );
  }

  void _interpolateMarker() {
    final t = _animation.value;

    final lat = _startPosition!.latitude + ((_endPosition!.latitude - _startPosition!.latitude) * t);
    final lng = _startPosition!.longitude + ((_endPosition!.longitude - _startPosition!.longitude) * t);

    double diff = _endRotation - _startRotation;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    //final rotation = _startRotation + diff * t;

    setState(() {
      riderMarker = riderMarker!.copyWith(
        positionParam: LatLng(lat, lng),
        //rotationParam: rotation,
      );
    });
  }

  // ---------------- BEARING ----------------
  double _calculateBearing(LatLng start, LatLng end) {
    final lat1 = start.latitude * math.pi / 180;
    final lat2 = end.latitude * math.pi / 180;
    final dLng = (end.longitude - start.longitude) * math.pi / 180;

    final y = math.sin(dLng) * math.cos(lat2);
    final x = math.cos(lat1) * math.sin(lat2) -
        math.sin(lat1) * math.cos(lat2) * math.cos(dLng);

    return (math.atan2(y, x) * 180 / math.pi + 360) % 360;
  }

  // ---------------- INIT MARKERS ----------------
  Future<void> _initMarkers() async {
    customerIcon = await BitmapDescriptor.asset(
      const ImageConfiguration(size: Size(40, 40)),
      Assets.png.markerPerson.path,
    );

    riderIcon = await BitmapDescriptor.asset(
      const ImageConfiguration(size: Size(40, 40)),
      Assets.png.riderPerson.path,
    );

    customerMarker = Marker(
      markerId: const MarkerId('customer'),
      position:
      LatLng(widget.customerLatitude!, widget.customerLongitude!),
      icon: customerIcon!,
    );

    final riderPos =
    LatLng(widget.riderLatitude!, widget.riderLongitude!);

    riderMarker = Marker(
      markerId: const MarkerId('rider'),
      position: riderPos,
      icon: riderIcon!,
      anchor: const Offset(0.5, 0.5),
      rotation: 0,
    );

    _startPosition = riderPos;
    _endPosition = riderPos;

    setState(() {});

    //  INITIAL POLYLINE (VERY IMPORTANT)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _drawPolyline(
        riderPos,
        LatLng(widget.customerLatitude!, widget.customerLongitude!),
      );
    });
  }

  // ---------------- POLYLINE ----------------
  Future<void> _drawPolyline(LatLng start, LatLng end) async {
    if (mapController == null) return;

    final points = await DirectionsService.getRoutePolyline(
      start: start,
      end: end,
      apiKey: googleApiKey,
    );

    if (points.isEmpty) return;

    setState(() {
      polylines = {
        Polyline(
          polylineId: const PolylineId('route'),
          points: points,
          width: 2,
          color: Colors.black,
          startCap: Cap.roundCap,
          endCap: Cap.roundCap,
          jointType: JointType.round,
        ),
      };
    });

    if (!_isCameraFittedOnce) {
      _fitCamera(points);
      _isCameraFittedOnce = true;
    }
  }

  void _fitCamera(List<LatLng> points) {
    final bounds = LatLngBounds(
      southwest: LatLng(
        points.map((e) => e.latitude).reduce(math.min),
        points.map((e) => e.longitude).reduce(math.min),
      ),
      northeast: LatLng(
        points.map((e) => e.latitude).reduce(math.max),
        points.map((e) => e.longitude).reduce(math.max),
      ),
    );

    mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 80),
    );
  }

  // ---------------- UI ----------------
  @override
  Widget build(BuildContext context) {
    final locationAsync = ref.watch(locationProvider);

    return Scaffold(
      body:locationAsync.isLoading ? Center(child: CircularProgressIndicator(),) : locationAsync.when(
        data: (_) => GoogleMap(
          initialCameraPosition: CameraPosition(
            target: LatLng(
              widget.customerLatitude!,
              widget.customerLongitude!,
            ),
            zoom: 14,
          ),
          markers: {
            if (customerMarker != null) customerMarker!,
            if (riderMarker != null) riderMarker!,
          },
          polylines: polylines,
          onMapCreated: (c) {
            mapController = c;

            // Ensure polyline after map ready
            if (riderMarker != null) {
              _drawPolyline(
                riderMarker!.position,
                LatLng(
                  widget.customerLatitude!,
                  widget.customerLongitude!,
                ),
              );
            }
          },
          myLocationEnabled: false,
          myLocationButtonEnabled: false,
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              // Text('Error: ${err.toString()}'),
              Text("You have to allow location permission",
                style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 16.sp
                ),


              ),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: (){
                AppSettings.openAppSettings();
              }, child: Text("1. Open Setting",style: TextStyle(color: Colors.red),)),

              ElevatedButton(onPressed: (){
                ref.refresh(locationProvider);
              }, child: Text("2. Allow Location Permission",style: TextStyle(color: Colors.red),))
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    mapController?.dispose();
    PusherService.disconnect(widget.riderId);
    super.dispose();
  }
}

