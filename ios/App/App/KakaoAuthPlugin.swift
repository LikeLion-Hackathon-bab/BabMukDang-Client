import Foundation
import Security
import Capacitor
import KakaoSDKAuth
import KakaoSDKCommon
import KakaoSDKUser

/// 카카오 네이티브 SDK 로그인과 refresh token 보안 저장소를 제공하는 앱 내 로컬 플러그인. (ADR 0007, 0008)
@objc(KakaoAuthPlugin)
public class KakaoAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "KakaoAuthPlugin"
    public let jsName = "KakaoAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "login", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setRefreshToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getRefreshToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearRefreshToken", returnType: CAPPluginReturnPromise)
    ]

    private let refreshTokenStore = RefreshTokenKeychainStore()

    /// Info.plist `KAKAO_NATIVE_APP_KEY` (빌드 설정 `$(KAKAO_NATIVE_APP_KEY)`). 비어 있으면 미설정으로 본다.
    static var nativeAppKey: String? {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "KAKAO_NATIVE_APP_KEY") as? String,
              !key.isEmpty else {
            return nil
        }
        return key
    }

    @objc func login(_ call: CAPPluginCall) {
        guard KakaoAuthPlugin.nativeAppKey != nil else {
            call.reject("Kakao native app key is not configured", "KAKAO_NOT_CONFIGURED")
            return
        }

        DispatchQueue.main.async {
            guard UserApi.isKakaoTalkLoginAvailable() else {
                self.loginWithKakaoAccount(call)
                return
            }

            UserApi.shared.loginWithKakaoTalk { token, error in
                if let error = error {
                    if KakaoAuthPlugin.isUserCancelled(error) {
                        call.reject("User cancelled Kakao login", "USER_CANCELLED")
                    } else {
                        // 카카오톡 로그인 실패는 카카오계정 로그인으로 이어간다.
                        self.loginWithKakaoAccount(call)
                    }
                    return
                }
                self.resolveIdToken(call, token)
            }
        }
    }

    @objc func logout(_ call: CAPPluginCall) {
        guard KakaoAuthPlugin.nativeAppKey != nil else {
            call.resolve()
            return
        }

        UserApi.shared.logout { error in
            if let error = error {
                CAPLog.print("[KakaoAuth] Kakao logout failed: \(error.localizedDescription)")
            }
            call.resolve()
        }
    }

    @objc func setRefreshToken(_ call: CAPPluginCall) {
        guard let refreshToken = call.getString("refreshToken"), !refreshToken.isEmpty else {
            call.reject("refreshToken is required", "INVALID_ARGUMENT")
            return
        }

        if refreshTokenStore.save(refreshToken) {
            call.resolve()
        } else {
            call.reject("Failed to store refresh token", "SECURE_STORAGE_ERROR")
        }
    }

    @objc func getRefreshToken(_ call: CAPPluginCall) {
        if let refreshToken = refreshTokenStore.read() {
            call.resolve(["refreshToken": refreshToken])
        } else {
            call.resolve(["refreshToken": NSNull()])
        }
    }

    @objc func clearRefreshToken(_ call: CAPPluginCall) {
        refreshTokenStore.clear()
        call.resolve()
    }

    private func loginWithKakaoAccount(_ call: CAPPluginCall) {
        // loginHint 인자로 카카오싱크 전용 오버로드와 구분한다.
        UserApi.shared.loginWithKakaoAccount(loginHint: nil) { token, error in
            if let error = error {
                if KakaoAuthPlugin.isUserCancelled(error) {
                    call.reject("User cancelled Kakao login", "USER_CANCELLED")
                } else {
                    call.reject("Kakao login failed: \(error.localizedDescription)", "KAKAO_LOGIN_FAILED")
                }
                return
            }
            self.resolveIdToken(call, token)
        }
    }

    private func resolveIdToken(_ call: CAPPluginCall, _ token: OAuthToken?) {
        guard let idToken = token?.idToken, !idToken.isEmpty else {
            // 카카오 콘솔에서 OpenID Connect가 비활성화되어 있으면 id_token이 오지 않는다.
            call.reject("Kakao login did not return an id_token", "NO_ID_TOKEN")
            return
        }
        call.resolve(["idToken": idToken])
    }

    private static func isUserCancelled(_ error: Error) -> Bool {
        if let sdkError = error as? SdkError,
           case .ClientFailed(reason: .Cancelled, errorMessage: _) = sdkError {
            return true
        }
        return false
    }
}

/// refresh token만 Keychain(이 기기 전용, 첫 잠금 해제 후 접근)에 보관한다.
private struct RefreshTokenKeychainStore {
    private let service = "com.babmukdang.app.auth"
    private let account = "refresh_token"

    private var baseQuery: [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
    }

    func save(_ refreshToken: String) -> Bool {
        let data = Data(refreshToken.utf8)
        SecItemDelete(baseQuery as CFDictionary)

        var attributes = baseQuery
        attributes[kSecValueData as String] = data
        attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(attributes as CFDictionary, nil) == errSecSuccess
    }

    func read() -> String? {
        var query = baseQuery
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne

        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    func clear() {
        SecItemDelete(baseQuery as CFDictionary)
    }
}
