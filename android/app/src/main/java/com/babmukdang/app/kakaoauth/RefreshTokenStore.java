package com.babmukdang.app.kakaoauth;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * 네이티브 세션의 refresh token만 Android Keystore AES-GCM 키로 암호화해 보관한다. (ADR 0007)
 */
final class RefreshTokenStore {
    private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";
    private static final String KEY_ALIAS = "babmukdang_refresh_token_key";
    private static final String PREFERENCES_NAME = "babmukdang_secure_auth";
    private static final String PREFERENCE_KEY = "refresh_token";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final String SEPARATOR = ":";

    private final SharedPreferences preferences;

    RefreshTokenStore(Context context) {
        preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE);
    }

    void save(String refreshToken) throws Exception {
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
        byte[] encrypted = cipher.doFinal(refreshToken.getBytes(StandardCharsets.UTF_8));
        String value = Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP)
            + SEPARATOR
            + Base64.encodeToString(encrypted, Base64.NO_WRAP);
        if (!preferences.edit().putString(PREFERENCE_KEY, value).commit()) {
            throw new IllegalStateException("Failed to persist refresh token");
        }
    }

    /**
     * 저장된 값이 없거나 복호화할 수 없으면(백업 복원으로 키가 사라진 경우 등) null을 돌려주고 값을 지운다.
     */
    String read() {
        String value = preferences.getString(PREFERENCE_KEY, null);
        if (value == null) return null;

        String[] parts = value.split(SEPARATOR, 2);
        if (parts.length != 2) {
            clear();
            return null;
        }

        try {
            Key key = loadKeyStore().getKey(KEY_ALIAS, null);
            if (!(key instanceof SecretKey)) {
                clear();
                return null;
            }
            byte[] iv = Base64.decode(parts[0], Base64.NO_WRAP);
            byte[] encrypted = Base64.decode(parts[1], Base64.NO_WRAP);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception error) {
            clear();
            return null;
        }
    }

    void clear() {
        preferences.edit().remove(PREFERENCE_KEY).commit();
    }

    private KeyStore loadKeyStore() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
        keyStore.load(null);
        return keyStore;
    }

    private SecretKey getOrCreateKey() throws Exception {
        Key existing = loadKeyStore().getKey(KEY_ALIAS, null);
        if (existing instanceof SecretKey) {
            return (SecretKey) existing;
        }

        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_PROVIDER);
        generator.init(
            new KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        );
        return generator.generateKey();
    }
}
