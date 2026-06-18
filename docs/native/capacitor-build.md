# Capacitor Native Build Guide

## Scope

This guide covers the Milestone 4 baseline for building BabMukDang as a native Capacitor app. The native projects are generated under `BabMukDang-Client/android` and `BabMukDang-Client/ios`.

## Commands

From `BabMukDang-Client`:

```bash
npm install
npm run cap:sync
```

Android debug build:

```bash
npm run native:android:debug
```

iOS sync/build preparation:

```bash
npm run native:ios:sync
npx cap open ios
```

## Native app metadata

- App ID: `com.babmukdang.app`
- App name: `밥먹당`
- Web output: `dist`
- Android scheme: `https`

## Permissions configured in native projects

Android:

- `INTERNET`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_FINE_LOCATION`
- `CAMERA`
- `POST_NOTIFICATIONS`
- optional camera hardware feature

IOS:

- `NSCameraUsageDescription`
- `NSLocationWhenInUseUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `UIBackgroundModes` with `remote-notification`

## Generated asset policy

`npx cap sync` copies `dist` into native project folders. These generated web asset folders are ignored in git and should be regenerated in local or CI builds:

- `BabMukDang-Client/android/app/src/main/assets/public/`
- `BabMukDang-Client/ios/App/App/public/`

## Current environment limitation

Android native build was attempted in the sandbox, but Gradle wrapper could not download Gradle due DNS/network failure against `services.gradle.org`. iOS project sync also warned that CocoaPods and Xcode are not installed. Re-run native builds on a machine with Gradle network access, Android SDK, CocoaPods, and Xcode.
