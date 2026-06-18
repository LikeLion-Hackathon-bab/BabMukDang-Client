package com.babmukdang.app.liveupdates;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.babmukdang.app.MainActivity;
import com.babmukdang.app.R;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.annotation.PluginMethod;

import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(
    name = "BabMukDangAndroidLiveUpdates",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class BabMukDangAndroidLiveUpdatesPlugin extends Plugin {
    private static final String CHANNEL_ID = "babmukdang_meal_plan_live_updates";
    private static final String CHANNEL_NAME = "밥약 라이브 업데이트";
    private static final String TOKEN_PREFIX = "android-live-update:";

    @PluginMethod
    public void startOrUpdate(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
            return;
        }

        showNotification(call);
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        if (getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
            call.reject("ANDROID_LIVE_UPDATE_NOTIFICATION_PERMISSION_DENIED");
            return;
        }
        showNotification(call);
    }

    @PluginMethod
    public void end(PluginCall call) {
        String mealPlanId = call.getString("mealPlanId");
        String activityId = call.getString("activityId");
        if (mealPlanId == null || mealPlanId.isEmpty()) {
            call.reject("MEAL_PLAN_ID_REQUIRED");
            return;
        }
        NotificationManagerCompat.from(getContext()).cancel(notificationId(activityId != null ? activityId : mealPlanId));
        call.resolve();
    }

    private void showNotification(PluginCall call) {
        String mealPlanId = call.getString("mealPlanId");
        String title = call.getString("title", "밥약");
        String progressLabel = call.getString("progressLabel", "밥약 진행 중");
        String restaurantName = call.getString("restaurantName");
        String placeName = call.getString("placeName");
        String scheduledAt = call.getString("scheduledAt");
        String deepLink = call.getString("deepLink", "/home");

        if (mealPlanId == null || mealPlanId.isEmpty()) {
            call.reject("MEAL_PLAN_ID_REQUIRED");
            return;
        }

        createChannelIfNeeded();
        String activityId = String.format(Locale.US, "meal-plan-%s", mealPlanId);
        String location = firstNonBlank(restaurantName, placeName, "장소 정하는 중");
        String timing = scheduledAt == null || scheduledAt.isEmpty() ? "시간 정하는 중" : scheduledAt;
        Intent intent = new Intent(getContext(), MainActivity.class)
            .setAction(Intent.ACTION_VIEW)
            .setData(Uri.parse(deepLink.startsWith("http") ? deepLink : "babmukdang://app" + deepLink))
            .putExtra("mealPlanId", mealPlanId)
            .putExtra("activityId", activityId)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        int pendingIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingIntentFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(
            getContext(),
            notificationId(activityId),
            intent,
            pendingIntentFlags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(getContext(), CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(progressLabel + " · " + timing)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(progressLabel + "\n" + location + "\n" + timing))
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_STATUS);

        NotificationManagerCompat.from(getContext()).notify(notificationId(activityId), builder.build());

        JSObject result = new JSObject();
        result.put("activityId", activityId);
        result.put("pushToken", TOKEN_PREFIX + UUID.nameUUIDFromBytes(activityId.getBytes()).toString());
        call.resolve(result);
    }

    private void createChannelIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("밥약 예정 시간과 확정 상태를 잠금화면과 알림 영역에 표시합니다.");
        manager.createNotificationChannel(channel);
    }

    private int notificationId(String stableId) {
        return Math.abs(stableId.hashCode());
    }

    private String firstNonBlank(String first, String second, String fallback) {
        if (first != null && !first.trim().isEmpty()) return first;
        if (second != null && !second.trim().isEmpty()) return second;
        return fallback;
    }
}
