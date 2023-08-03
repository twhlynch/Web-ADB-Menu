## A web based Adb menu for the Meta Quest

### Error guide

Error. Hit "allow" if prompted on Quest, then try again. If this persists more than 4 times, try:
- Unplug / Plug-in Quest,
- toggle USB debugging,
- reload browser,
- close other ADB programs (SideQuest),
- Check that adb.exe is not running,
- restart Quest,
- restart PC,
- try another cable,
- try amother port.

### Current features

- Set Hz (Refresh rate)
- Set performance mode (CPU level, and GPU level)
- Set resolution
- Set Foveation strength 
- Enable / Disable telemetry (Credit: [Basti564](https://github.com/Basti564))
- Enable / disable screen timeout
- Disable guardian
- Enable experimental settings
- Correct chromatic abberation
- Potato recording mode
- Run custom command
- Check state

### ADB commands used

**Set Hz**

```adb shell setprop debug.oculus.refreshRate [Hz]```

```adb shell setprop debug.oculus.swapInterval [swap]```

**then**

```adb shell input keyevent KEYCODE_SLEEP```

```adb shell input keyevent KEYCODE_WAKEUP```

**Set performance mode**

```adb shell setprop debug.oculus.gpuLevel [level]```

```adb shell setprop debug.oculus.cpuLevel [level]```

**Set resolution**

```adb shell setprop debug.oculus.textureWidth [resolution]```

```adb shell setprop debug.oculus.textureHeight [resolution]```

**Set Foveation strength**

```adb shell setprop debug.oculus.foveation.level [level]```

```adb shell setprop debug.oculus.foveation.dynamic 0```

**Telemetry**

```adb shell pm [enable / disable] com.oculus.unifiedtelemetry```

```adb shell pm [enable / disable] com.oculus.gatekeeperservice```

```adb shell pm [enable / disable] com.oculus.notification_proxy```

```adb shell pm [enable / disable] com.oculus.bugreporter```

```adb shell pm [enable / disable] com.oculus.os.logcollector```

```adb shell pm [enable / disable] com.oculus.appsafety```

**Screen timeout**

```adb shell am broadcast -a com.oculus.vrpowermanager.prox_close```

**or**

```adb shell am broadcast -a com.oculus.vrpowermanager.automation_disable```

**Disable guardian**

```adb shell adb shell setprop debug.oculus.guardian_pause 1```

**Enable experimental settings**

```adb shell db shell setprop debug.oculus.experimentalEnabled 1```

**Chromatic abberation**

```adb shell adb shell setprop debug.oculus.forceChroma 1```

**Potato recording mode**

```adb shell setprop debug.oculus.capture.bitrate 1000```

```adb shell setprop debug.oculus.capture.height 500```

```adb shell setprop debug.oculus.capture.width 500```

**Run custom command**

```adb shell [command]```

> Uses https://github.com/webadb/webadb.js/ (MIT)