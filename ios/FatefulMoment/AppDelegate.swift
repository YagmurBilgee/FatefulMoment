import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = UIColor.brandBackground

    factory.startReactNative(
      withModuleName: "FatefulMoment",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  // React Native gives the root view the system background (white in
  // light mode) until the first JS frame; keep it dark like the launch screen.
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    rootView.backgroundColor = UIColor.brandBackground
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

extension UIColor {
  /// #020618, matching LaunchScreen.storyboard and colors.background.
  static let brandBackground = UIColor(
    red: 2 / 255, green: 6 / 255, blue: 24 / 255, alpha: 1
  )
}
