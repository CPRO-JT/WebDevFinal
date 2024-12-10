document.getElementById("WSStatusIP").innerText = "IP: " + localStorage.getItem("AMT_ServerIP");
document.getElementById("WSStatusPort").innerText = "Port: " + localStorage.getItem("AMT_ServerPort");
document.getElementById("WSStatusPath").innerText = "Path: " + localStorage.getItem("AMT_ServerPath");
document.getElementById("WSStatusProtocol").innerText = "Protocol: " + localStorage.getItem("AMT_ServerProtocol");

function ApplySettings() {
    let settings = [
        ["AMT_ServerIP", "WebSocketClientIP"],
        ["AMT_ServerPort", "WebSocketClientPort"],
        ["AMT_ServerPath", "WebSocketClientPath"],
        ["AMT_ServerProtocol", "WebSocketClientProtocol"],
    ];

    console.log(Object.keys(localStorage));

    for (let idx in settings) {
        let setting = settings[idx];

        if (document.getElementById(setting[1]) == null) {
            console.log(`Checking if element is Null`);
            console.log(document.getElementById(setting[1]));
            continue;
        } else {
            console.log(`Checking if element is not Null`);
            console.log(document.getElementById(setting[1]));
        }
        if (document.getElementById(setting[1]).value == null) {
            console.log(`Checking if value is Null`);
            console.log(document.getElementById(setting[1]).value);
            continue;
        } else {
            console.log(`Checking if value is not Null`);
            console.log(document.getElementById(setting[1]).value);
        }

        //console.log(document.getElementById(setting[1]).value);
        if (setting[1] == "on") {
            setting[1] = "wss";
        } else {
            setting[1] = "ws";
        }

        try {
            let settingVal = $(setting[1]).val();
            AMT.SetWSSetting(setting[0], settingVal == "on" ? "wss" : settingVal == "off" ? "ws" : settingVal);
        } catch (e) {
            console.error("bruh");
        }
    }
}

function ClearLocalStorage() {
    localStorage.clear();
    AMT.WS.ValidateSettings();
}

function ReconnectToAMTDesktop() {
    AMT.WS.ValidateSettings();
    AMT.Reconnect();
}
// document.getElementById("WebSocketClientProtocol")
