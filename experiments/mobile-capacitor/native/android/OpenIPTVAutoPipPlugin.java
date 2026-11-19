package com.trisanghy.openiptvpro.mobile;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OpenIPTVAutoPiP")
public class OpenIPTVAutoPipPlugin extends Plugin {
    @PluginMethod
    public void configure(PluginCall call) {
        final boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled"));
        final boolean playing = Boolean.TRUE.equals(call.getBoolean("playing"));
        if (!(getActivity() instanceof MainActivity)) {
            call.reject("MainActivity unavailable");
            return;
        }
        final MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            activity.configureAutoPip(enabled, playing);
            JSObject response = new JSObject();
            response.put("supported", activity.supportsAutoPip());
            response.put("enabled", enabled);
            response.put("playing", playing);
            call.resolve(response);
        });
    }
    @PluginMethod
    public void enter(PluginCall call) {
        if (!(getActivity() instanceof MainActivity)) {
            call.reject("MainActivity unavailable");
            return;
        }
        final MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            if (!activity.supportsAutoPip()) {
                call.reject("Picture-in-Picture is unavailable on this Android device");
                return;
            }
            if (activity.enterManualPiP()) {
                JSObject response = new JSObject();
                response.put("entered", true);
                call.resolve(response);
            } else {
                call.reject("Android denied PiP transition");
            }
        });
    }

}
