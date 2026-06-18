package com.babmukdang.app;

import android.os.Bundle;

import com.babmukdang.app.liveupdates.BabMukDangAndroidLiveUpdatesPlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BabMukDangAndroidLiveUpdatesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
