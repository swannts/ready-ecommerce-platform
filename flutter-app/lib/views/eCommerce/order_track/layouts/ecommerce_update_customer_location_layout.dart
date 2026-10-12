/*import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ready_ecommerce/controllers/eCommerce/order_track/location_controller.dart';
import 'package:ready_ecommerce/gen/assets.gen.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';

class EcommerceUpdateCustomerLocationLayout extends ConsumerStatefulWidget {


  final double? latitude;
  final double? longitude;
  const EcommerceUpdateCustomerLocationLayout({super.key, this.latitude, this.longitude});

  @override
  ConsumerState<EcommerceUpdateCustomerLocationLayout> createState() => _EcommerceTrackOrderLayoutState();
}

class _EcommerceTrackOrderLayoutState extends ConsumerState<EcommerceUpdateCustomerLocationLayout> {
  GoogleMapController? mapController;
  Marker? customerMarker;
  String? currentAddress;
  BitmapDescriptor? customerIcon;


  @override
  void initState() {
    super.initState();
    _initMarker();


  }


  Future<void> _initMarker() async {
    await _loadCustomerMarker(); // wait for icon
    _loadSavedMarker();          // now build marker
  }

  Future<void> _loadCustomerMarker() async {
    customerIcon = await BitmapDescriptor.asset(
      const ImageConfiguration(size: Size(48, 48)),
      Assets.png.markerPerson.path,
    );
    setState(() {});
  }
  void _loadSavedMarker() {
    final localStorage = ref.read(hiveServiceProvider);
    //final lat = localStorage.getLatitude();
    //final lng = localStorage.getLongitude();

    final lat = widget.latitude;
    final lng = widget.longitude;

    if (lat != null && lng != null) {
      // Load the saved marker
      setState(() {
        customerMarker = Marker(
          markerId: const MarkerId('customer_location'),
          position: LatLng(lat, lng),
          infoWindow: InfoWindow(
            title: 'Customer Location',
            snippet: currentAddress ?? 'Loading address...',
          ),
         // icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          icon: customerIcon ?? BitmapDescriptor.defaultMarker,
        );
      });

      // Load address
      getAddressFromLatLng(lat, lng).then((address) {
        setState(() {
          currentAddress = address;
          // Update marker with address
          customerMarker = customerMarker?.copyWith(
            infoWindowParam: InfoWindow(
              title: 'Customer Location',
              snippet: address,
            ),
          );
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final locationAsync = ref.watch(locationProvider);
    final localStorage = ref.watch(hiveServiceProvider);
    // log("latitude------->> ${localStorage.getLatitude()}");
    // log("latitude------->> ${localStorage.getLongitude()}");

    log("latitude------->> ${widget.latitude}");
     log("latitude------->> ${widget.longitude}");

    return Scaffold(
      appBar: AppBar(
        title: const Text('Update Delivery Location'),
      ),
      body: locationAsync.when(
        data: (position) {
          // LatLng saveLatLng = LatLng(
          //     localStorage.getLatitude() ?? position.latitude,
          //     localStorage.getLongitude() ?? position.longitude
          // );

          LatLng saveLatLng = LatLng(
              widget.latitude ?? position.latitude,
              widget.longitude ?? position.longitude
          );

          return GoogleMap(
            initialCameraPosition: CameraPosition(
              target: saveLatLng,
              zoom: 17,
            ),
            markers: customerMarker != null ? {customerMarker!} : {},
            onMapCreated: (controller) {
              mapController = controller;
            },
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            onTap: (LatLng tappedPoint) async {
              // Get address for tapped location
              final address = await getAddressFromLatLng(
                  tappedPoint.latitude,
                  tappedPoint.longitude
              );

              setState(() {
                currentAddress = address;
                customerMarker = Marker(
                  markerId: const MarkerId('customer_location'),
                  position: tappedPoint,
                  infoWindow: InfoWindow(
                    title: 'Customer Location',
                    snippet: address,
                  ),
                //  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
                  icon: customerIcon ?? BitmapDescriptor.defaultMarker,
                );
              });

              // Save the TAPPED coordinates, not device position
              localStorage.saveCustomerLocation(
                  latitude: tappedPoint.latitude,
                  longitude: tappedPoint.longitude
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text(err.toString())),
      ),
    );
  }
}*/

// class _EcommerceTrackOrderLayoutState extends ConsumerState<EcommerceUpdateCustomerLocationLayout> {
//   GoogleMapController? mapController;
//   Marker? customerMarker;
//   String? currentAddress;
//   BitmapDescriptor? customerIcon;
//   bool isInitialized = false;
//
//   @override
//   void initState() {
//     super.initState();
//     _initMarker();
//   }
//
//   Future<void> _initMarker() async {
//     await _loadCustomerMarker(); // Load icon first
//     await _loadSavedMarker();    // Then load marker
//     setState(() {
//       isInitialized = true;
//     });
//   }
//
//   Future<void> _loadCustomerMarker() async {
//     customerIcon = await BitmapDescriptor.asset(
//       const ImageConfiguration(size: Size(48, 48)),
//       Assets.png.markerPerson.path,
//     );
//   }
//
//   Future<void> _loadSavedMarker() async {
//     final localStorage = ref.read(hiveServiceProvider);
//     final lat = localStorage.getLatitude();
//     final lng = localStorage.getLongitude();
//
//     log("Loading saved marker at: $lat, $lng");
//
//     if (lat != null && lng != null) {
//       // Get address first
//       try {
//         final address = await getAddressFromLatLng(lat, lng);
//         currentAddress = address;
//       } catch (e) {
//         log("Error getting address: $e");
//         currentAddress = "Location saved";
//       }
//
//       // Create marker with saved coordinates
//       customerMarker = Marker(
//         markerId: const MarkerId('customer_location'),
//         position: LatLng(lat, lng), // Use saved coordinates
//         infoWindow: InfoWindow(
//           title: 'Customer Location',
//           snippet: currentAddress ?? 'Loading address...',
//         ),
//         icon: customerIcon ?? BitmapDescriptor.defaultMarker,
//       );
//
//       log("Marker created at: ${customerMarker!.position.latitude}, ${customerMarker!.position.longitude}");
//     }
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final locationAsync = ref.watch(locationProvider);
//     final localStorage = ref.watch(hiveServiceProvider);
//
//     log("Building with saved latitude: ${localStorage.getLatitude()}");
//     log("Building with saved longitude: ${localStorage.getLongitude()}");
//
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Update Delivery Location'),
//       ),
//       body: locationAsync.when(
//         data: (position) {
//           // Get saved coordinates or fall back to current position
//           final savedLat = localStorage.getLatitude();
//           final savedLng = localStorage.getLongitude();
//
//           LatLng targetLatLng = LatLng(
//             savedLat ?? position.latitude,
//             savedLng ?? position.longitude,
//           );
//
//           log("Map center: ${targetLatLng.latitude}, ${targetLatLng.longitude}");
//           if (customerMarker != null) {
//             log("Marker position: ${customerMarker!.position.latitude}, ${customerMarker!.position.longitude}");
//           }
//
//           return GoogleMap(
//             initialCameraPosition: CameraPosition(
//               target: targetLatLng,
//               zoom: 17,
//             ),
//             markers: customerMarker != null ? {customerMarker!} : {},
//             onMapCreated: (controller) {
//               mapController = controller;
//               // Optionally move camera to marker after map is created
//               if (customerMarker != null) {
//                 controller.animateCamera(
//                   CameraUpdate.newLatLng(customerMarker!.position),
//                 );
//               }
//             },
//             myLocationEnabled: true,
//             myLocationButtonEnabled: true,
//             onTap: (LatLng tappedPoint) async {
//               log("Tapped at: ${tappedPoint.latitude}, ${tappedPoint.longitude}");
//
//               // Get address for tapped location
//               String address = 'Loading address...';
//               try {
//                 address = await getAddressFromLatLng(
//                   tappedPoint.latitude,
//                   tappedPoint.longitude,
//                 );
//               } catch (e) {
//                 log("Error getting address: $e");
//                 address = "Location selected";
//               }
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
//               log("Marker updated to: ${tappedPoint.latitude}, ${tappedPoint.longitude}");
//
//               // Save the TAPPED coordinates
//               localStorage.saveCustomerLocation(
//                 latitude: tappedPoint.latitude,
//                 longitude: tappedPoint.longitude,
//               );
//
//               log("Saved to Hive: ${tappedPoint.latitude}, ${tappedPoint.longitude}");
//             },
//           );
//         },
//         loading: () => const Center(child: CircularProgressIndicator()),
//         error: (err, stack) => Center(child: Text(err.toString())),
//       ),
//     );
//   }
// }

/*-----------Floating moving on update-----------*/

import 'dart:developer';
import 'package:app_settings/app_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:ready_ecommerce/controllers/eCommerce/order_track/location_controller.dart';
import 'package:ready_ecommerce/gen/assets.gen.dart';
import 'package:ready_ecommerce/services/common/hive_service_provider.dart';
import 'package:ready_ecommerce/services/eCommerce/order_track/location_services.dart';

class EcommerceUpdateCustomerLocationLayout extends ConsumerStatefulWidget {
  final double? latitude;
  final double? longitude;

  const EcommerceUpdateCustomerLocationLayout({
    super.key,
    this.latitude,
    this.longitude
  });

  @override
  ConsumerState<EcommerceUpdateCustomerLocationLayout> createState() =>
      _EcommerceTrackOrderLayoutState();
}

class _EcommerceTrackOrderLayoutState
    extends ConsumerState<EcommerceUpdateCustomerLocationLayout> {
  GoogleMapController? mapController;
  String? currentAddress;
  LatLng? centerPosition;
  bool isMapMoving = false;

  @override
  void initState() {
    super.initState();
    _loadInitialAddress();
  }

  Future<void> _loadInitialAddress() async {
    final locationAsync = ref.read(locationProvider);

    locationAsync.whenData((position) {
      final lat = widget.latitude ?? position.latitude;
      final lng = widget.longitude ?? position.longitude;

      centerPosition = LatLng(lat, lng);
      _updateAddress(centerPosition!);
    });
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

      Future.delayed(const Duration(milliseconds: 1500), () {
        if (mounted) {
          Navigator.pop(context);
        }
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
    final localStorage = ref.watch(hiveServiceProvider);

    log("latitude------->> ${widget.latitude}");
    log("longitude------->> ${widget.longitude}");

    return Scaffold(
      body: SafeArea(
        child: locationAsync.isLoading
            ? const Center(child: CircularProgressIndicator()) :locationAsync.when(
          data: (position) {
            LatLng saveLatLng = LatLng(
              widget.latitude ?? position.latitude,
              widget.longitude ?? position.longitude,
            );

            // Set initial center position
            if (centerPosition == null) {
              centerPosition = saveLatLng;
              _updateAddress(saveLatLng);
            }

            return Stack(
              children: [
                GoogleMap(
                  key: const ValueKey('google_map_update'),
                  initialCameraPosition: CameraPosition(
                    target: saveLatLng,
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
                        transform: Matrix4.translationValues(
                          0,
                          isMapMoving ? -20 : 0,
                          0,
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
                            color: Colors.black.withOpacity(0.3),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                ),

                // Back button
                Positioned(
                  top: 10,
                  left: 10,
                  child: GestureDetector(
                    onTap: () {
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      height: 40,
                      width: 40,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Center(
                        child: Icon(Icons.arrow_back),
                      ),
                    ),
                  ),
                ),


             if(!isMapMoving)
               Positioned(
                 top: 60.h,
                 left: 16.w,
                 right: 16.w,
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

                // Confirm button at bottom
               if(!isMapMoving)
                 Positioned(
                   bottom: 32.h,
                   left: 16.w,
                   right: 80.w,
                   child: ElevatedButton(
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
                       'Update Delivery Location',
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