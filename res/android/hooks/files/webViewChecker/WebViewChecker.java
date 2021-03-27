package com.kingsofdurak.candywings;

import org.apache.cordova.CordovaActivity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;

public class WebViewChecker {
    private String packageName = "com.google.android.webview";
    private CordovaActivity activity;
    private AlertDialog dialog;
    WebViewChecker(CordovaActivity activity){
        this.activity = activity;
    }
    public boolean check(){
        PackageManager packageManager = this.activity.getPackageManager();
        boolean isAvailable = false;

        String currentVersion;
        try {
            ApplicationInfo packageInfo =  packageManager.getApplicationInfo(this.packageName, 0);
            isAvailable = packageInfo.enabled;
            currentVersion = packageManager.getPackageInfo(this.packageName, 0).versionName;
            int generalVersionValue = Integer.parseInt(currentVersion.substring(0, 2)) ;
            boolean isVersionOk = generalVersionValue >= 75;
            if(isAvailable && !isVersionOk){
                this.showAlertDialog();
            }
        } catch (PackageManager.NameNotFoundException e) {
            Log.e(this.activity.TAG, "checkWebViewUpdate: package not found", e);
        }
        return !isAvailable ||( isAvailable && isVersionOk);
    }

    private void showAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this.activity);
        builder.setTitle("Need for update");
        builder.setMessage("Please update Android System WebView");
        builder.setPositiveButton("Update", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + WebViewChecker.this.packageName));
                intent.addFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK|Intent.FLAG_ACTIVITY_NEW_TASK);
                try {
                    WebViewChecker.this.activity.startActivityForResult(intent, Activity.RESULT_OK);
                    WebViewChecker.this.activity.finish();
                }catch (Exception e){
                    Log.e(WebViewChecker.this.activity.TAG, "start intent", e);
                }
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                WebViewChecker.this.activity.finish();
            }
        });
        this.dialog = builder.create();
        this.dialog.show();
    }

}
