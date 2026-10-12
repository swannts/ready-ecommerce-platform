// import UIKit
// import Flutter
// import flutter_downloader
// import flutter_local_notifications

// @main
// @objc class AppDelegate: FlutterAppDelegate {
//   override func application(
//     _ application: UIApplication,
//     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
//   ) -> Bool {
//     GeneratedPluginRegistrant.register(with: self)
//     FlutterDownloaderPlugin.setPluginRegistrantCallback(registerPlugins)
//     FlutterLocalNotificationsPlugin.setPluginRegistrantCallback { (registry) in
//     GeneratedPluginRegistrant.register(with: registry)
//     }
//     return super.application(application, didFinishLaunchingWithOptions: launchOptions)
//   }
// }

// private func registerPlugins(registry: FlutterPluginRegistry) {
//     if (!registry.hasPlugin("FlutterDownloaderPlugin")) {
//        FlutterDownloaderPlugin.register(with: registry.registrar(forPlugin: "FlutterDownloaderPlugin")!)
//     }
// }

import UIKit
import Flutter
import Firebase
import flutter_downloader
import flutter_local_notifications
import UserNotifications

@main
@objc class AppDelegate: FlutterAppDelegate {

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {

    FirebaseApp.configure()

    GeneratedPluginRegistrant.register(with: self)

    FlutterDownloaderPlugin.setPluginRegistrantCallback(registerPlugins)

    FlutterLocalNotificationsPlugin.setPluginRegistrantCallback { registry in
      GeneratedPluginRegistrant.register(with: registry)
    }

    UNUserNotificationCenter.current().delegate = self

    application.registerForRemoteNotifications()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken
    super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
  }
}

private func registerPlugins(registry: FlutterPluginRegistry) {
  if !registry.hasPlugin("FlutterDownloaderPlugin") {
    FlutterDownloaderPlugin.register(
      with: registry.registrar(forPlugin: "FlutterDownloaderPlugin")!
    )
  }
}
