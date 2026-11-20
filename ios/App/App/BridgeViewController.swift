import UIKit
import Capacitor

/// npm 패키지가 아닌 앱 내 로컬 플러그인을 Capacitor 브리지에 등록한다.
class BridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(KakaoAuthPlugin())
    }
}
