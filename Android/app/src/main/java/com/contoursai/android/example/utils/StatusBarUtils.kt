package com.contoursai.android.example.utils

import android.app.Activity
import android.os.Build
import android.view.WindowInsetsController

object StatusBarUtils {
    fun updateStatusBarColor(activity: Activity) {
        val window = activity.window
        val decorView = window.decorView
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = decorView.windowInsetsController
            controller?.setSystemBarsAppearance(WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS)
        }
    }
}
