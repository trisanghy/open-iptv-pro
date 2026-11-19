package com.trisanghy.openiptvpro.mobile;

import android.app.PictureInPictureParams;
import android.content.res.Configuration;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Rational;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private boolean autoPipEnabled = false;
    private boolean inlinePlaying = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OpenIPTVAutoPipPlugin.class);
        super.onCreate(savedInstanceState);
    }

    public boolean supportsAutoPip() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            && getPackageManager().hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE);
    }

    public void configureAutoPip(boolean enabled, boolean playing) {
        autoPipEnabled = enabled;
        inlinePlaying = playing;
        if (!supportsAutoPip()) return;
        PictureInPictureParams.Builder params = new PictureInPictureParams.Builder()
            .setAspectRatio(new Rational(16, 9));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            params.setAutoEnterEnabled(enabled && playing);
        }
        setPictureInPictureParams(params.build());
    }

    public boolean enterManualPiP() {
        if (!supportsAutoPip() || isInPictureInPictureMode()) return false;
        try {
            return enterPictureInPictureMode(new PictureInPictureParams.Builder()
                .setAspectRatio(new Rational(16, 9)).build());
        } catch (IllegalStateException | IllegalArgumentException ignored) {
            return false;
        }
    }

    @Override
    protected void onUserLeaveHint() {
        if (supportsAutoPip()
            && Build.VERSION.SDK_INT < Build.VERSION_CODES.S
            && autoPipEnabled && inlinePlaying && !isInPictureInPictureMode()) {
            try {
                enterPictureInPictureMode(new PictureInPictureParams.Builder()
                    .setAspectRatio(new Rational(16, 9)).build());
            } catch (IllegalStateException ignored) {
                // OS may block PiP in restricted multiwindow/lock-screen states.
            }
        }
        super.onUserLeaveHint();
    }

    @Override
    public void onPictureInPictureModeChanged(boolean inPictureInPictureMode, Configuration configuration) {
        super.onPictureInPictureModeChanged(inPictureInPictureMode, configuration);
        if (getBridge() == null || getBridge().getWebView() == null) return;
        final String active = inPictureInPictureMode ? "true" : "false";
        final String script =
            "document.documentElement.classList.toggle('pip-mode'," + active + ");"
          + "window.dispatchEvent(new CustomEvent('openiptv:pipchange',{detail:{active:" + active + "}}));";
        getBridge().getWebView().post(() ->
            getBridge().getWebView().evaluateJavascript(script, null));
    }
}
