import 'dart:developer';

import 'package:flutter/foundation.dart';

class AppLog {
  AppLog._();

  static void kLog(String message) {
    if (kDebugMode) {
      log(message);
    }
  }
}
