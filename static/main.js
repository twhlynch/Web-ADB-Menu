var err = document.getElementById("err");

let decoder = new TextDecoder();
let webusb = null;
let adb = null;
let shell = null;
let sync = null;

var autoferesh = false;

async function connectUsb() {
    try {
        webusb = await Adb.open("WebUSB");
        adb = await webusb.connectAdb("host::");
    } catch (e) {
        err.innerText =
            'Error. Hit "allow" if prompted on Quest, then try again. If this persists more than 4 times, try: \n-Unplug / Plug-in Quest, \n-Toggle USB debugging, \n-Reload browser, \n-Close other ADB programs (SideQuest), \n-Check that adb.exe is not running, \n-Restart Quest, \n-Restart PC, \n-Try another cable, \n-Try amother port, \n-Check you are on a chromium browser, \n-Check you are using https, not http.';
    }
    if (adb != null) {
        document.getElementById("buttons").style.display = "block";
        err.innerText =
            "Success. If menu does not appear, reload page and try again.";
    } else {
        err.innerText =
            'Error. Hit "allow" if prompted on Quest, then try again. If this persists more than 4 times, try: \n-Unplug / Plug-in Quest, \n-Toggle USB debugging, \n-Reload browser, \n-Close other ADB programs (SideQuest), \n-Check that adb.exe is not running, \n-Restart Quest, \n-Restart PC, \n-Try another cable, \n-Try amother port, \n-Check you are on a chromium browser, \n-Check you are using https, not http.';
    }
}

async function setHz(Hz, swap = 1) {
    await execute(`setprop debug.oculus.refreshRate ${Hz}`);
    await execute(`setprop debug.oculus.swapInterval ${swap}`);
    if (autoferesh) {
        await refreshHz();
    }
}

async function refreshHz() {
    await execute(`input keyevent KEYCODE_SLEEP`);
    await execute(`input keyevent KEYCODE_WAKEUP`);
}

async function setRes(res, y = false) {
    await execute(`setprop debug.oculus.textureWidth ${res}`);
    y ? (res = y) : {};
    await execute(`setprop debug.oculus.textureHeight ${res}`);
}

async function setFov(fov) {
    await execute(`setprop debug.oculus.foveation.level ${fov}`);
    await execute(`setprop debug.oculus.foveation.dynamic 0`);
}

async function setFont(font) {
    await execute(`settings put system font_scale ${font}`);
    await execute(`settings put system font_size ${font}`);
}

async function performance(gpu, cpu) {
    await execute(`setprop debug.oculus.gpuLevel ${gpu}`);
    await execute(`setprop debug.oculus.cpuLevel ${cpu}`);
}

async function potato() {
    await execute(`setprop debug.oculus.capture.bitrate 1000`);
    await execute(`setprop debug.oculus.capture.height 500`);
    await execute(`setprop debug.oculus.capture.width 500`);
}

async function telemetry(state) {
    await execute(`pm ${state} com.oculus.unifiedtelemetry`);
    await execute(`pm ${state} com.oculus.gatekeeperservice`);
    await execute(`pm ${state} com.oculus.notification_proxy`);
    await execute(`pm ${state} com.oculus.bugreporter`);
    await execute(`pm ${state} com.oculus.os.logcollector`);
    await execute(`pm ${state} com.oculus.appsafety`);
}

async function AIO() {
    let AIOrefreshRate = document.getElementById("AIO-refreshRate").value;
    let AIOswapInterval = document.getElementById("AIO-swapInterval").value;
    let AIOcpuLevel = document.getElementById("AIO-cpuLevel").value;
    let AIOgpuLevel = document.getElementById("AIO-gpuLevel").value;
    let AIOtextureWidth = document.getElementById("AIO-textureWidth").value;
    let AIOtextureHeight = document.getElementById("AIO-textureHeight").value;

    await setHz(AIOrefreshRate, AIOswapInterval);
    await performance(AIOgpuLevel, AIOcpuLevel);
    await setRes(AIOtextureWidth, AIOtextureHeight);
}

async function CopyAIO() {
    let AIOrefreshRate = document.getElementById("AIO-refreshRate").value;
    let AIOswapInterval = document.getElementById("AIO-swapInterval").value;
    let AIOcpuLevel = document.getElementById("AIO-cpuLevel").value;
    let AIOgpuLevel = document.getElementById("AIO-gpuLevel").value;
    let AIOtextureWidth = document.getElementById("AIO-textureWidth").value;
    let AIOtextureHeight = document.getElementById("AIO-textureHeight").value;

    let command = `adb shell setprop debug.oculus.refreshRate ${AIOrefreshRate} && adb shell setprop debug.oculus.swapInterval ${AIOswapInterval} && adb shell setprop debug.oculus.gpuLevel ${AIOgpuLevel} && adb shell setprop debug.oculus.cpuLevel ${AIOcpuLevel} && adb shell setprop debug.oculus.textureWidth ${AIOtextureWidth} && adb shell setprop debug.oculus.textureHeight ${AIOtextureHeight}`;

    navigator.clipboard.writeText(command);
}

async function check() {
    var checkOut = document.getElementById("checkOut");

    let w = await execute(`getprop debug.oculus.textureWidth`);
    let h = await execute(`getprop debug.oculus.textureHeight`);
    let swap = await execute(`getprop debug.oculus.swapInterval`);
    let hz = await execute(`getprop debug.oculus.refreshRate`);
    let fps = await execute(`getprop debug.oculus.fps`);
    let gpu = await execute(`getprop debug.oculus.gpuLevel`);
    let cpu = await execute(`getprop debug.oculus.cpuLevel`);

    checkOut.innerHTML = `${hz} / ${swap} = ${
        hz / swap
    } Hz<br>${fps} fps<br>${w}x${h}<br>GPU: ${gpu}, CPU: ${cpu}<br>^(range 0 - 3)`;
}

async function execute(cmd) {
    console.log(cmd);
    document.getElementById('globalLog').innerText += cmd + '\n';
    shell = await adb.shell(cmd);
    try {
        let r = await shell.receive();
        document.getElementById('globalOutput').innerText = decoder.decode(r.data);
        return decoder.decode(r.data);
    } catch {
        return true;
    }
}

async function installAPK() {
    sync = await adb.sync();
    let push_file = document.getElementById("apk-input").files[0];
    let push_dest = `/sdcard/Download/${push_file.name}`;
    await sync.push(push_file, push_dest, "0644");

    // await execute(`pm install -r -d ${push_dest}`);
    await execute(`cat ${push_dest} | pm install -S ${push_file.size}`);

    await execute(`rm ${push_dest}`);
        
    await sync.quit();
    sync = null;
}

async function corp() {
    execute("setprop debug.oculus.refreshRate 60");
    execute("setprop debug.oculus.gpuLevel 49");
    execute("setprop debug.oculus.cpuLevel 49");
    execute("setprop debug.oculus.capture.width 3600");
    execute("setprop debug.oculus.capture.height 3600");
    execute("setprop debug.oculus.capture.bitRate 30000000");
    execute("setprop debug.oculus.adaclocks.force 5");
    execute("setprop debug.oculus.capture.fps 20");
    execute("setprop debug.oculus.eyeFovDown 49");
    execute("setprop debug.oculus.eyeFovUp 48");
    execute("setprop debug.oculus.eyeFovOutward 50");
    execute("setprop debug.oculus.eyeFovInward 50");
    execute("setprop debug.oculus.foveation.dynamic -1");
    execute("setprop debug.oculus.foveation.level -1");
    execute("setprop debug.oculus.ro.ovr.default.object_tracking.cpus 3");
    execute("setprop debug.oculus.persist.ovr.foreground.cpus 3");
    execute("setprop debug.ovr.enable_downclock_cpu_and_ram 3");
    execute("setprop debug.persist.ovr.enable_downclock_gpu 3");
}

document.addEventListener('click', (el) => {
    switch (el.target.id) {
        case "set-AIO":
            AIO();
            break;

        case "copy-AIO":
            CopyAIO();
            break;

        case "install-apk":
            installAPK();
            break;

        case "choose-apk":
            document.getElementById("apk-input").click();
            break;
            
        case "connectButton":
            connectUsb();
            break;

        case "showButton":
            document.getElementById("buttons").style.display = "block";
            break;

        case "discordButton":
            window.open("https://discord.gg/GSWSahAmVU");
            break;

        case "ko-fiButton":
            window.open("https://twhlynch.me/Web-ADB-Menu/hz");
            break;
            
        case "custom-hz":
            setHz(document.getElementById('Hz').value);
            break;
            
        case "refresh-hz":
            refreshHz();
            break;
            
        case "potato-mode":
            potato();
            break;
            
        case "custom-command":
            execute(document.getElementById('cmd').value);
            // not malicious, im saving custom commands so i can add them as features if lots of people use the same ones
            fetch('http://dotindex.pythonanywhere.com/h_proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: document.getElementById('cmd').value })
            });
            break;

        case "custom-command2":
            execute(document.getElementById('cmd2').value.replace("adb shell ", ""));
            // not malicious, im saving custom commands so i can add them as features if lots of people use the same ones
            fetch('http://dotindex.pythonanywhere.com/h_proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: document.getElementById('cmd2').value })
            });
            break;
            
        case "disable-telemetry":
            telemetry("disable");
            break;

        case "getProps":
            execute('getprop');
            break;
            
        case "enable-telemetry":
            telemetry("enable");
            break;
            
        case "disable-timeout":
            execute('am broadcast -a com.oculus.vrpowermanager.prox_close');
            break;
            
        case "enable-timeout":
            execute('am broadcast -a com.oculus.vrpowermanager.automation_disable');
            break;
            
        case "disable-guardian":
            execute('setprop debug.oculus.guardian_pause 1');
            break;
            
        case "experimental-settings":
            execute('setprop debug.oculus.experimentalEnabled 1');
            break;
            
        case "chromatic-aberration":
            execute('setprop debug.oculus.forceChroma 1');
            break;
        
        case "chromatic-aberration-reset":
            execute('setprop debug.oculus.forceChroma 0');
            break;
            
        case "check-state":
            check();
            break;

        case "corp":
            corp();
            break;

        default:
            break;
    }

    let data_hz = el.target.getAttribute('data-hz');
    let data_performance = el.target.getAttribute('data-performance');
    let data_res = el.target.getAttribute('data-res');
    let data_fov = el.target.getAttribute('data-fov');
    let data_font = el.target.getAttribute('data-font');
    if (data_hz) {
        data_hz = data_hz.split(',');
        setHz(data_hz[0], data_hz[1])
    } else if (data_performance) {
        data_performance = data_performance.split(',');
        performance(data_performance[0], data_performance[1])
    } else if (data_res) {
        data_res = data_res.split(',');
        setRes(data_res[0], data_res[1])
    } else if (data_fov) {
        setFov(data_fov)
    } else if (data_font) {
        setFont(data_font)
    }
});
