var err = document.getElementById("err");

let decoder = new TextDecoder();
let webusb = null;
let adb = null;
let shell = null;

var autoferesh = false;

async function connectUsb() {
    try {
        webusb = await Adb.open("WebUSB");
        adb = await webusb.connectAdb("host::");
    } catch (e) {
        err.innerText =
            'Error. Hit "allow" if prompted on Quest, then try again. If this persists more than 4 times, try: \n-Unplug / Plug-in Quest, \n-toggle USB debugging, \n-reload browser, \n-close other ADB programs (SideQuest), \n-Check that adb.exe is not running, \n-restart Quest, \n-restart PC, \n-try another cable, \n-try amother port.';
    }
    if (adb != null) {
        document.getElementById("buttons").style.display = "block";
        err.innerText =
            "Success. If menu does not appear, reload page and try again.";
    } else {
        err.innerText =
            'Error. Hit "allow" if prompted on Quest, then try again. If this persists more than 4 times, try: \n-Unplug / Plug-in Quest, \n-toggle USB debugging, \n-reload browser, \n-close other ADB programs (SideQuest), \n-Check that adb.exe is not running, \n-restart Quest, \n-restart PC, \n-try another cable, \n-try amother port.';
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
    shell = await adb.shell(cmd);
    try {
        let r = await shell.receive();
        document.getElementById('globalOutput').innerText = decoder.decode(r.data);
        return decoder.decode(r.data);
    } catch {
        return true;
    }
}

document.addEventListener('click', (el) => {
    switch (el.target.id) {
        case "set-AIO":
            AIO();
            break;

        case "copy-AIO":
            CopyAIO();
            break;
            
        case "connectButton":
            connectUsb();
            break;

        case "discordButton":
            window.open("https://discord.gg/GSWSahAmVU");
            break;

        case "ko-fiButton":
            window.open("https://ko-fi.com/dotindex");
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
        
        case "check-state":
            check();
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