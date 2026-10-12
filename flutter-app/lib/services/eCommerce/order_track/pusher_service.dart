import 'dart:convert';

import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:ready_ecommerce/config/app_constants.dart';
import 'package:ready_ecommerce/config/app_log.dart';

class PusherService {
  static final pusher = PusherChannelsFlutter.getInstance();
  static bool _connected = false;

  static Future<void> connectToRider({
    required int riderId,
    required Function(double lat, double lng) onRiderMove,
  }) async {
    if (_connected) return;
    _connected = true;

    try {
      await pusher.init(
        apiKey: AppConstants.pusherApiKey,
        cluster: AppConstants.pusherCluster,

        onConnectionStateChange: (current, previous) {
          AppLog.kLog("🔌 Pusher: $previous → $current");
        },

        onEvent: (event) {

          AppLog.kLog("PUSHER EVENT RECEIVED → ""Channel: ${event.channelName} | ""Event: ${event.eventName} | ""Raw Data: ${event.data}");

          if (event.eventName == "rider.location.updated") {

            AppLog.kLog(" OUR EVENT MATCHED! Raw data: ${event.data}");


            try {
              final data = jsonDecode(event.data ?? '{}');

              final location = data['location'] as Map<String, dynamic>?;

              if (location != null) {
                final latStr = location['latitude']?.toString() ?? '0.0';
                final lngStr = location['longitude']?.toString() ?? '0.0';

                final lat = double.tryParse(latStr) ?? 0.0;
                final lng = double.tryParse(lngStr) ?? 0.0;

                AppLog.kLog("Successfully parsed → Lat: $lat, Lng: $lng");

                onRiderMove(lat, lng);
              } else {
                AppLog.kLog("Location key not found in data");
              }
            } catch (e) {
              AppLog.kLog("JSON parse failed: $e");
            }
          }
        },
        onError: (msg, code, err) {
          AppLog.kLog("Pusher Error: $msg | Code: $code | Err: $err");
        },
      );

      await pusher.subscribe(channelName: "rider-location.$riderId");

      await pusher.connect();
    } catch (e) {
      AppLog.kLog("Pusher connection failed: $e");
      _connected = false;
    }
  }

  static Future<void> disconnect(int riderId) async {
    try {
      await pusher.unsubscribe(channelName: "rider-location.$riderId");
      await pusher.disconnect();
      _connected = false;
      AppLog.kLog("Pusher disconnected successfully");
    } catch (e) {
      AppLog.kLog("Disconnect error: $e");
    }
  }
}