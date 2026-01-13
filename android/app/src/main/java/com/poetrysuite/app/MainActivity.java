package com.poetrysuite.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register any custom plugins or perform initialization
        registerPlugin(com.getcapacitor.community.camera.Camera.class);
        registerPlugin(com.getcapacitor.Geolocation.class);
        registerPlugin(com.getcapacitor.Keyboard.class);
    }
}
