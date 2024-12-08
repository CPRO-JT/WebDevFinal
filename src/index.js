function DefineStorage_hasItem(key) {
    let value = localStorage.getItem(key);
    if (value == null) {
        return false;
    }
    return true;
}

Object.defineProperty(Storage.prototype, "hasItem", { value: DefineStorage_hasItem, writable: true });

function DefineStorage_hasAllItems(keys) {
    let result = [];
    for (let key in keys) {
        result.push(localStorage.hasItem(keys[key]));
    }
    if (result.includes(false)) return false;
    return true;
}

Object.defineProperty(Storage.prototype, "hasAllItems", { value: DefineStorage_hasAllItems, writable: true });

function DefineString_capitalize() {
    let result = this.split("");
    result[0] = result[0].toUpperCase();
    return result.join("");
}

Object.defineProperty(String.prototype, "capitalize", { value: DefineString_capitalize, writable: true });

class AMTWebSocketClient {
    Defaults = {
        ServerIP: "127.0.0.1",
        ServerPort: 42069,
        ServerPath: "amt",
    };

    Settings = this.Defaults;

    Client;

    constructor() {
        console.log(Object.keys(AMTWebSocketClient));
        this.ValidateSettings();
        this.LoadSettings();
        this.Client = new WebSocket(
            `ws://${this.Settings.ServerIP}:${this.Settings.ServerPort}/${this.Settings.ServerPath}`
        );
        this.Client.onopen = this.OnOpen;
        this.Client.onmessage = this.OnMessage;
        this.Client.onerror = this.OnError;
        this.Client.onclose = this.OnClose;
    }

    ValidateSettings = () => {
        Object.defineProperty(AMTWebSocketClient, "ValidateSettings", { value: this.ValidateSettings, writable: true });
        let keys = Object.keys(this.Defaults);

        for (let keyidx in keys) {
            let key = `AMT_${keys[keyidx]}`;
            //console.log((typeof this.Defaults[keys[key]]).capitalize());
            if (localStorage.hasItem(key) == false) localStorage.setItem(key, this.Defaults[keys[keyidx]]);
            if (localStorage.getItem(key) == "undefined") localStorage.setItem(key, this.Defaults[keys[keyidx]]);
            if (localStorage.getItem(key) == undefined) localStorage.setItem(key, this.Defaults[keys[keyidx]]);
            if (localStorage.getItem(key) == null) localStorage.setItem(key, this.Defaults[keys[keyidx]]);
            if (typeof localStorage.getItem(key) != typeof this.Defaults[keys[keyidx]])
                localStorage.setItem(
                    key,
                    globalThis[(typeof this.Defaults[keys[keyidx]]).capitalize()](this.Defaults[keys[keyidx]])
                );
        }
    };

    SaveSettings = () => {
        if (localStorage.hasAllItems(["AMT_ServerIP", "AMT_ServerPort", "AMT_ServerPath"])) {
            localStorage.setItem("AMT_ServerIP", this.Settings.ServerIP);
            localStorage.setItem("AMT_ServerPort", this.Settings.serverPort);
            localStorage.setItem("AMT_ServerPath", this.Settings.ServerPath);
        } else {
            alert("Failed to save settings to Local Storage!\n\n" + e);
        }
    };

    LoadSettings = () => {
        if (localStorage.hasAllItems(["AMT_ServerIP", "AMT_ServerPort", "AMT_ServerPath"])) {
            this.Settings.ServerIP = localStorage.getItem("AMT_ServerIP");
            this.Settings.ServerPort = localStorage.getItem("AMT_ServerPort");
            this.Settings.ServerPath = localStorage.getItem("AMT_ServerPath");
        } else {
            alert("Failed to load settings from Local Storage!");
        }
    };

    OnOpen = (event) => {
        //alert("Connected to AMT Desktop!");
        console.log(`WS Event | Open: ${JSON.stringify(event)}`);
        this.SaveSettings();
        this.Client.send("Hello from AMT Web!");
    };

    OnMessage = (event) => {
        if (event.data instanceof ArrayBuffer) OnMessageArrayBuffer(event);
        if (event.data instanceof Blob) OnMessageBlob(event);
        this.OnMessageString(event);
    };

    OnMessageArrayBuffer = (event) => {
        alert("WS: Recieved ArrayBuffer!");
        console.log(`WS Event | Message | ArrayBuffer:\n\n${JSON.stringify(event)}}`);
    };

    OnMessageBlob = (event) => {
        alert("WS: Recieved Blob!");
        console.log(`WS Event | Message | Blob:\n\n${JSON.stringify(event)}}`);
    };

    OnMessageString = (event) => {
        alert("WS: Recieved String!");
        console.log(`WS Event | Message | String:\n\n${JSON.stringify(event.data)}}`);
    };

    OnError = (event) => {
        console.error(`WS Error:\n\n${JSON.stringify(event)}}`);
    };

    OnClose = (event) => {
        alert("WS: Closed.");
        console.log(`WS Event | Close:\n\n${JSON.stringify(event)}}`);
    };

    SendMessage = (message) => {
        this.Client.send(message);
    };
}

let WS = new AMTWebSocketClient();
