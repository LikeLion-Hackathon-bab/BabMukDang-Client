package com.babmukdang.app;

import android.os.Bundle;

import com.babmukdang.app.kakaoauth.KakaoAuthPlugin;
import com.babmukdang.app.liveupdates.BabMukDangAndroidLiveUpdatesPlugin;
import com.getcapacitor.BridgeActivity;
import com.kakao.sdk.common.KakaoSdk;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 키는 Gradle 속성/local.properties/환경 변수 KAKAO_NATIVE_APP_KEY로만 주입한다.
        if (!BuildConfig.KAKAO_NATIVE_APP_KEY.isEmpty()) {
            KakaoSdk.init(getApplicationContext(), BuildConfig.KAKAO_NATIVE_APP_KEY);
        }
        registerPlugin(BabMukDangAndroidLiveUpdatesPlugin.class);
        registerPlugin(KakaoAuthPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
