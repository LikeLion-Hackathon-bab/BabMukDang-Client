package com.babmukdang.app.kakaoauth;

import android.app.Activity;
import android.util.Log;

import com.babmukdang.app.BuildConfig;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;
import com.kakao.sdk.auth.model.OAuthToken;
import com.kakao.sdk.common.model.ClientError;
import com.kakao.sdk.common.model.ClientErrorCause;
import com.kakao.sdk.user.UserApiClient;

import org.json.JSONObject;

import kotlin.Unit;

/**
 * 카카오 네이티브 SDK 로그인과 refresh token 보안 저장소를 제공하는 앱 내 로컬 플러그인. (ADR 0007, 0008)
 */
@CapacitorPlugin(name = "KakaoAuth")
public class KakaoAuthPlugin extends Plugin {
    private static final String TAG = "KakaoAuthPlugin";

    private RefreshTokenStore refreshTokenStore;

    @Override
    public void load() {
        refreshTokenStore = new RefreshTokenStore(getContext());
    }

    @PluginMethod
    public void login(PluginCall call) {
        if (BuildConfig.KAKAO_NATIVE_APP_KEY.isEmpty()) {
            call.reject("Kakao native app key is not configured", "KAKAO_NOT_CONFIGURED");
            return;
        }

        Activity activity = getActivity();
        UserApiClient client = UserApiClient.getInstance();

        if (!client.isKakaoTalkLoginAvailable(activity)) {
            loginWithKakaoAccount(call, activity);
            return;
        }

        client.loginWithKakaoTalk(activity, (token, error) -> {
            if (error != null) {
                if (isUserCancelled(error)) {
                    call.reject("User cancelled Kakao login", "USER_CANCELLED");
                } else {
                    // 카카오톡 로그인 실패(미연결 계정 등)는 카카오계정 로그인으로 이어간다.
                    loginWithKakaoAccount(call, activity);
                }
                return Unit.INSTANCE;
            }
            resolveIdToken(call, token);
            return Unit.INSTANCE;
        });
    }

    @PluginMethod
    public void logout(PluginCall call) {
        if (BuildConfig.KAKAO_NATIVE_APP_KEY.isEmpty()) {
            call.resolve();
            return;
        }

        UserApiClient.getInstance().logout(error -> {
            if (error != null) {
                Log.w(TAG, "Kakao logout failed", error);
            }
            call.resolve();
            return Unit.INSTANCE;
        });
    }

    @PluginMethod
    public void setRefreshToken(PluginCall call) {
        String refreshToken = call.getString("refreshToken");
        if (refreshToken == null || refreshToken.isEmpty()) {
            call.reject("refreshToken is required", "INVALID_ARGUMENT");
            return;
        }

        try {
            refreshTokenStore.save(refreshToken);
            call.resolve();
        } catch (Exception error) {
            call.reject("Failed to store refresh token", "SECURE_STORAGE_ERROR", error);
        }
    }

    @PluginMethod
    public void getRefreshToken(PluginCall call) {
        String refreshToken = refreshTokenStore.read();
        JSObject result = new JSObject();
        result.put("refreshToken", refreshToken == null ? JSONObject.NULL : refreshToken);
        call.resolve(result);
    }

    @PluginMethod
    public void clearRefreshToken(PluginCall call) {
        refreshTokenStore.clear();
        call.resolve();
    }

    private void loginWithKakaoAccount(PluginCall call, Activity activity) {
        UserApiClient.getInstance().loginWithKakaoAccount(activity, (token, error) -> {
            if (error != null) {
                if (isUserCancelled(error)) {
                    call.reject("User cancelled Kakao login", "USER_CANCELLED");
                } else {
                    call.reject("Kakao login failed: " + error.getMessage(), "KAKAO_LOGIN_FAILED");
                }
                return Unit.INSTANCE;
            }
            resolveIdToken(call, token);
            return Unit.INSTANCE;
        });
    }

    private void resolveIdToken(PluginCall call, OAuthToken token) {
        String idToken = token == null ? null : token.getIdToken();
        if (idToken == null || idToken.isEmpty()) {
            // 카카오 콘솔에서 OpenID Connect가 비활성화되어 있으면 id_token이 오지 않는다.
            call.reject("Kakao login did not return an id_token", "NO_ID_TOKEN");
            return;
        }

        JSObject result = new JSObject();
        result.put("idToken", idToken);
        call.resolve(result);
    }

    private static boolean isUserCancelled(Throwable error) {
        return error instanceof ClientError && ((ClientError) error).getReason() == ClientErrorCause.Cancelled;
    }
}
