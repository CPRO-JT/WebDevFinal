// Update the display for WebSocket connection details using stored values in localStorage
document.getElementById("WSStatusIP").innerText = "IP: " + localStorage.getItem("AMT_ServerIP");
document.getElementById("WSStatusPort").innerText = "Port: " + localStorage.getItem("AMT_ServerPort");
document.getElementById("WSStatusPath").innerText = "Path: " + localStorage.getItem("AMT_ServerPath");
document.getElementById("WSStatusProtocol").innerText = "Protocol: " + localStorage.getItem("AMT_ServerProtocol");

// Function to apply new WebSocket settings from input fields to localStorage
function ApplySettings() {
    // Array mapping localStorage keys to corresponding input field IDs
    let settings = [
        ["AMT_ServerIP", "WebSocketClientIP"],       // IP address
        ["AMT_ServerPort", "WebSocketClientPort"],   // Port number
        ["AMT_ServerPath", "WebSocketClientPath"],   // Path
        ["AMT_ServerProtocol", "WebSocketClientProtocol"], // Protocol (ws or wss)
    ];

    // Iterate over the settings array
    for (let idx in settings) {
        let setting = settings[idx]; // Get the current setting pair [localStorage key, input field ID]

        // Check if the input field exists in the DOM; if not, skip to the next setting
        if (document.getElementById(setting[1]) == null) continue;

        // Check if the value of the input field is null; if so, skip to the next setting
        if (document.getElementById(setting[1]).value == null) continue;

        // Log the value of the input field for debugging
        console.log(document.getElementById(setting[1]).value);

        // If the input field ID matches "on," set the protocol to "wss" (secure WebSocket)
        // Otherwise, set it to "ws" (insecure WebSocket)
        if (setting[1] == "on") {
            setting[1] = "wss";
        } else {
            setting[1] = "ws";
        }

        try {
            // Save the input field's value into localStorage under the corresponding key
            localStorage[settings[0]] = document.getElementById(setting[1]).value;
        } catch (e) {
            // Log an error message if the value cannot be saved
            console.error("Error saving settings to localStorage.");
        }
    }
}
