/*---------- Floating moving marker on map---------*/

import 'package:app_settings/app_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ready_ecommerce/config/app_color.dart';
import 'package:ready_ecommerce/controllers/eCommerce/order_track/location_controller.dart';
import 'package:ready_ecommerce/gen/assets.gen.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';

class EcommercePinCustomerLocationLayout extends ConsumerStatefulWidget {
  const EcommercePinCustomerLocationLayout({super.key});

  @override
  ConsumerState<EcommercePinCustomerLocationLayout> createState() =>
      _EcommerceTrackOrderLayoutState();
}

class _EcommerceTrackOrderLayoutState extends ConsumerState<EcommercePinCustomerLocationLayout> {
  GoogleMapController? mapController;
  String? currentAddress;
  LatLng? centerPosition;
  bool isMapMoving = false;

  @override
  void initState() {
    super.initState();
  }

  Future<void> _updateAddress(LatLng position) async {

    final address = await getAddressFromLatLng(
      position.latitude,
      position.longitude,
    );

    setState(() {
      currentAddress = address;

    });
  }

  void _confirmLocation() {
    if (centerPosition != null) {
      final localStorage = ref.read(hiveServiceProvider);
      localStorage.saveCustomerLocation(
        latitude: centerPosition!.latitude,
        longitude: centerPosition!.longitude,
      );


      // ScaffoldMessenger.of(context).showSnackBar(
      //   const SnackBar(
      //     content: Text('Delivery location saved!'),
      //     duration: Duration(seconds: 2),
      //   ),
      // );

      Future.delayed(Duration(milliseconds: 1500),(){
        Navigator.pop(context);
      });

    }
  }

  @override
  void dispose() {
    mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locationAsync = ref.watch(locationProvider);

    return Scaffold(

      body: SafeArea(
        child: locationAsync.isLoading ? const Center(child: CircularProgressIndicator()) : locationAsync.when(
          data: (position) {
            LatLng initialLatLng = LatLng(position.latitude, position.longitude);

            // Set initial center position
            if (centerPosition == null) {
              centerPosition = initialLatLng;
              _updateAddress(initialLatLng);
            }

            return Stack(
              children: [
                GoogleMap(
                  key: const ValueKey('google_map'),
                  initialCameraPosition: CameraPosition(
                    target: initialLatLng,
                    zoom: 17,
                  ),
                  onMapCreated: (controller) {
                    mapController = controller;
                  },
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  onCameraMove: (CameraPosition position) {
                    setState(() {
                      centerPosition = position.target;
                      isMapMoving = true;
                    });
                  },
                  onCameraIdle: () {
                    setState(() {
                      isMapMoving = false;
                    });
                    if (centerPosition != null) {
                      _updateAddress(centerPosition!);
                    }
                  },
                ),

                // Center floating marker
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Marker image
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        transform: Matrix4.translationValues(0, isMapMoving ? -20 : 0, 0,
                        ),
                        child: Image.asset(
                          Assets.png.markerPerson.path,
                          width: 48,
                          height: 48,
                        ),
                      ),
                      // Shadow/dot
                      if (isMapMoving)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.3),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                ),


                Positioned(
                  top: 10,
                  left: 10,
                  //  right: 0,
                  child: GestureDetector(
                    onTap: (){
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      height: 40,
                      width: 40,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20)
                      ),
                      child: Center(child: Icon(Icons.arrow_back)),
                    ),
                  ),
                ),

                if(!isMapMoving)
                   Positioned(
                  top: 60.h,
                  left: 16.w,
                  right: 16.h,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text(
                            'Delivery Address:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),

                           if (currentAddress != null)
                            Text(
                              currentAddress!,
                              style: const TextStyle(fontSize: 12),
                            )
                          else
                            const Text(
                              'Move map to select location',
                              style: TextStyle(
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),


                if(!isMapMoving)
                  Positioned(
                  bottom: 32.h,
                  left: 16.w,
                  right: 80.w,
                  child:  ElevatedButton(
                    onPressed: centerPosition != null
                        ? _confirmLocation
                        : null,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Confirm Delivery Location',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
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
      ),
    );
  }
}









/*------ Simple pin location of map------*/

// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:ready_ecommerce/controllers/eCommerce/order_track/location_controller.dart';
// import 'package:ready_ecommerce/gen/assets.gen.dart';
// import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';
//
// class EcommercePinCustomerLocationLayout extends ConsumerStatefulWidget {
//   const EcommercePinCustomerLocationLayout({super.key});
//
//   @override
//   ConsumerState<EcommercePinCustomerLocationLayout> createState() => _EcommerceTrackOrderLayoutState();
// }
//
// class _EcommerceTrackOrderLayoutState extends ConsumerState<EcommercePinCustomerLocationLayout> {
//   GoogleMapController? mapController;
//   Marker? customerMarker;
//   String? currentAddress;
//   BitmapDescriptor? customerIcon;
//
//   @override
//   void initState() {
//     super.initState();
//     _loadCustomerMarker();
//   }
//
//   Future<void> _loadCustomerMarker() async {
//     customerIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(48, 48)),
//       Assets.png.markerPerson.path,
//     );
//     setState(() {});
//   }
//
//   @override
//   void dispose() {
//     mapController?.dispose();
//     super.dispose();
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final locationAsync = ref.watch(locationProvider);
//     final localStorage = ref.watch(hiveServiceProvider);
//
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Pin Delivery Location'),
//       ),
//       body: locationAsync.when(
//         data: (position) {
//           LatLng initialLatLng = LatLng(position.latitude, position.longitude);
//
//           if (currentAddress == null) {
//             getAddressFromLatLng(position.latitude, position.longitude).then((address) {
//               setState(() {
//                 currentAddress = address;
//                 localStorage.saveCustomerLocation(
//                     latitude: position.latitude,
//                     longitude: position.longitude
//                 );
//               });
//             });
//           }
//
//           return GoogleMap(
//             key: const ValueKey('google_map'),
//             initialCameraPosition: CameraPosition(
//               target: initialLatLng,
//               zoom: 17,
//             ),
//             markers: customerMarker != null ? {customerMarker!} : {},
//             onMapCreated: (controller) {
//               mapController = controller;
//             },
//             myLocationEnabled: true,
//             myLocationButtonEnabled: true,
//             onTap: (LatLng tappedPoint) async {
//               // Get address for the tapped location
//               final address = await getAddressFromLatLng(
//                   tappedPoint.latitude,
//                   tappedPoint.longitude
//               );
//
//               setState(() {
//                 currentAddress = address;
//                 customerMarker = Marker(
//                   markerId: const MarkerId('customer_location'),
//                   position: tappedPoint,
//                   infoWindow: InfoWindow(
//                     title: 'Customer Location',
//                     snippet: address,
//                   ),
//                   icon: customerIcon ?? BitmapDescriptor.defaultMarker,
//                 );
//               });
//
//               // Save the TAPPED coordinates, not device position ✅
//               localStorage.saveCustomerLocation(
//                   latitude: tappedPoint.latitude,   // Changed from position.latitude
//                   longitude: tappedPoint.longitude  // Changed from position.longitude
//               );
//             },
//           );
//         },
//         loading: () => const Center(child: CircularProgressIndicator()),
//         error: (err, stack) => Center(child: Text(err.toString())),
//       ),
//     );
//   }
// }




/* ------------Show current location and marker -------------*/
// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:ready_ecommerce/controllers/eCommerce/order_track/location_controller.dart';
// import 'package:ready_ecommerce/gen/assets.gen.dart';
// import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
// import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';
//
// class EcommercePinCustomerLocationLayout extends ConsumerStatefulWidget {
//   const EcommercePinCustomerLocationLayout({super.key});
//
//   @override
//   ConsumerState<EcommercePinCustomerLocationLayout> createState() =>
//       _EcommerceTrackOrderLayoutState();
// }
//
// class _EcommerceTrackOrderLayoutState
//     extends ConsumerState<EcommercePinCustomerLocationLayout> {
//   GoogleMapController? mapController;
//   Marker? customerMarker;
//   String? currentAddress;
//   BitmapDescriptor? customerIcon;
//
//   @override
//   void initState() {
//     super.initState();
//     _loadCustomMarkers();
//   }
//
//   Future<void> _loadCustomMarkers() async {
//     // Load custom marker for customer location only
//     customerIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(48, 48)),
//       Assets.png.markerPerson.path,
//     );
//
//     setState(() {});
//   }
//
//   Future<void> _setInitialMarker(double latitude, double longitude) async {
//     final address = await getAddressFromLatLng(latitude, longitude);
//
//     setState(() {
//       currentAddress = address;
//
//       // Set customer marker at initial location
//       customerMarker = Marker(
//         markerId: const MarkerId('customer_location'),
//         position: LatLng(latitude, longitude),
//         infoWindow: InfoWindow(
//           title: 'Delivery Location',
//           snippet: address,
//         ),
//         icon: customerIcon ?? BitmapDescriptor.defaultMarker,
//       );
//     });
//
//     // Save initial location
//     final localStorage = ref.read(hiveServiceProvider);
//     localStorage.saveCustomerLocation(
//       latitude: latitude,
//       longitude: longitude,
//     );
//   }
//
//   @override
//   void dispose() {
//     mapController?.dispose();
//     super.dispose();
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final locationAsync = ref.watch(locationProvider);
//     final localStorage = ref.watch(hiveServiceProvider);
//
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Pin Delivery Location'),
//       ),
//       body: locationAsync.when(
//         data: (position) {
//           LatLng initialLatLng = LatLng(position.latitude, position.longitude);
//
//           // Set initial marker only once
//           if (customerMarker == null && customerIcon != null) {
//             _setInitialMarker(position.latitude, position.longitude);
//           }
//
//           return Stack(
//             children: [
//               GoogleMap(
//                 key: const ValueKey('google_map'),
//                 initialCameraPosition: CameraPosition(
//                   target: initialLatLng,
//                   zoom: 17,
//                 ),
//                 markers: {
//                   if (customerMarker != null) customerMarker!,
//                 },
//                 onMapCreated: (controller) {
//                   mapController = controller;
//                 },
//                 myLocationEnabled: true, // Enable default location indicator
//                 myLocationButtonEnabled: true,
//                 onTap: (LatLng tappedPoint) async {
//                   // Get address for the tapped location
//                   final address = await getAddressFromLatLng(
//                     tappedPoint.latitude,
//                     tappedPoint.longitude,
//                   );
//
//                   setState(() {
//                     currentAddress = address;
//                     customerMarker = Marker(
//                       markerId: const MarkerId('customer_location'),
//                       position: tappedPoint,
//                       infoWindow: InfoWindow(
//                         title: 'Delivery Location',
//                         snippet: address,
//                       ),
//                       icon: customerIcon ?? BitmapDescriptor.defaultMarker,
//                     );
//                   });
//
//                   // Save the tapped coordinates
//                   localStorage.saveCustomerLocation(
//                     latitude: tappedPoint.latitude,
//                     longitude: tappedPoint.longitude,
//                   );
//                 },
//               ),
//
//               // Address display card
//               if (currentAddress != null)
//                 Positioned(
//                   top: 16,
//                   left: 16,
//                   right: 16,
//                   child: Card(
//                     child: Padding(
//                       padding: const EdgeInsets.all(12.0),
//                       child: Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         mainAxisSize: MainAxisSize.min,
//                         children: [
//                           const Text(
//                             'Delivery Address:',
//                             style: TextStyle(
//                               fontWeight: FontWeight.bold,
//                               fontSize: 14,
//                             ),
//                           ),
//                           const SizedBox(height: 4),
//                           Text(
//                             currentAddress!,
//                             style: const TextStyle(fontSize: 12),
//                           ),
//                         ],
//                       ),
//                     ),
//                   ),
//                 ),
//             ],
//           );
//         },
//         loading: () => const Center(child: CircularProgressIndicator()),
//         error: (err, stack) => Center(
//           child: Column(
//             mainAxisAlignment: MainAxisAlignment.center,
//             children: [
//               const Icon(Icons.error_outline, size: 48, color: Colors.red),
//               const SizedBox(height: 16),
//               Text('Error: ${err.toString()}'),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }









