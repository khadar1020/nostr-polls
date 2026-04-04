package com.formstr.pollerama;

import android.app.Activity;
import android.app.PictureInPictureParams;
import android.os.Build;
import android.util.Rational;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Pip")
public class PipPlugin extends Plugin {

    static volatile boolean videoActive = false;
    static PipPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    @PluginMethod
    public void setVideoActive(PluginCall call) {
        boolean active = call.getBoolean("active", false);
        videoActive = active;

        // Android 12+: toggle auto-enter so ALL navigation methods (home, recents,
        // gesture swipe-up) will trigger PiP automatically — no need to intercept
        // individual callbacks.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Activity activity = getActivity();
            if (activity != null) {
                activity.runOnUiThread(() -> {
                    PictureInPictureParams params = new PictureInPictureParams.Builder()
                            .setAspectRatio(new Rational(16, 9))
                            .setAutoEnterEnabled(active)
                            .build();
                    activity.setPictureInPictureParams(params);
                });
            }
        }

        call.resolve();
    }

    // Called by MainActivity when the system PiP mode changes so the web layer
    // can switch to/from the full-screen video layout.
    void notifyPipChanged(boolean isInPipMode) {
        JSObject data = new JSObject();
        data.put("active", isInPipMode);
        notifyListeners("pipModeChanged", data);
    }
}
