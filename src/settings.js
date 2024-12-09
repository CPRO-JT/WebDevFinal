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
    for (let idx in settings) {
        let setting = settings[idx];

        if (document.getElementById(setting[1]) == null) continue;
        if (document.getElementById(setting[1]).value == null) continue;

        console.log(document.getElementById(setting[1]).value);
        if (setting[1] == "on") {
            setting[1] = "wss";
        } else {
            setting[1] = "ws";
        }

        try {
            localStorage[settings[0]] = document.getElementById(setting[1]).value;
        } catch (e) {
            console.error("bruh");
        }
    }
}
// document.getElementById("WebSocketClientProtocol")
