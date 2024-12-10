// Define a method called 'hasItem' on the global Storage object
function DefineStorage_hasItem(key) {
    let value = localStorage.getItem(key); // We get the key from localStorage
    if (value == null) {
        // Check if its null
        return false; // Return "Local Storage does not have that key"
    }
    return true; // Return "Local Storage does have that key"
}

// Define a new property on the Storage prototype with our hasItem function as the value
Object.defineProperty(Storage.prototype, "hasItem", { value: DefineStorage_hasItem, writable: true });

// Define a method called 'hasAllItems' on the global Storage object, same as hasItem but takes an array and if any of them return false, we dont have all items
function DefineStorage_hasAllItems(keys) {
    let result = []; // this is where we will store the results from our hasItem calls
    for (let key in keys) {
        // loop through keys<String[]>
        result.push(localStorage.hasItem(keys[key])); // Push the result of the hasItem check to the result array
    }
    if (result.includes(false)) return false; // if the result array contains false, we dont have all items, return false
    return true; // execution here implies the result array is all true, therefore we have all items, return true
}

// Define a new property on the Storage prototype with our hasAllItems function as the value
Object.defineProperty(Storage.prototype, "hasAllItems", { value: DefineStorage_hasAllItems, writable: true });

// Helper function to apply onto the global String object for capitalizing the first letter of a string
function DefineString_capitalize() {
    let result = this.split(""); // split every letter of the string, holding onto the array
    result[0] = result[0].toUpperCase(); // set the first element of the array toUpperCase
    return result.join(""); // join the array back into a complete string and return it
}

// Define a new property on the String prototype with our hasAllItems function as the value
Object.defineProperty(String.prototype, "capitalize", { value: DefineString_capitalize, writable: true });

// Declare our WebSocketClient class. AMT is our prefix for most things to prevent collisions, AMT = Appliance Maintenance Tracker
class AMTWebSocketClient {
    // Declare some default settings that also match the default settings of the Desktop App
    Defaults = {
        ServerIP: "127.0.0.1", // localhost
        ServerPort: 42069, // funny port
        ServerPath: "amt", // WebSocket path
        ServerProtocol: "ws", // ws for insecure, wss for secure, we dont have support for using ssl certs so insecure only
    };

    // Declare the settings object that will actually be the modified settings
    Settings = this.Defaults;

    // Declare the variable that will hold the WebSocket object
    Client;

    FailCount = 0;

    constructor() {
        // Seal the defaults so they cannot be accidentally modified and are reliable defaults
        Object.seal(this.Defaults);
        //console.log(Object.keys(AMTWebSocketClient));
        // Validate the WS Settings
        this.ValidateSettings();
        // Load the WS Settings
        this.LoadSettings();
        // Connect to the WebSocketServer, storing the connection to the class Client variable
        this.Client = new WebSocket(
            `${this.Settings.ServerProtocol}://${this.Settings.ServerIP}:${this.Settings.ServerPort}/${this.Settings.ServerPath}`
        );

        // Event Listener bindings
        this.Client.onopen = this.OnOpen;
        this.Client.onmessage = this.OnMessage;
        this.Client.onerror = this.OnError;
        this.Client.onclose = this.OnClose;
    }

    ValidateSettings = () => {
        // We get the keys of the Default Settings object
        let keys = Object.keys(this.Defaults);

        // Loop through the keys
        for (let keyidx in keys) {
            // map the key to have the AMT_ prefix for localStorage key names
            let key = `AMT_${keys[keyidx]}`;
            //console.log((typeof this.Defaults[keys[key]]).capitalize());

            // If localStorage has a false value for that key, we set it to default
            if (localStorage.hasItem(key) == false) localStorage.setItem(key, this.Defaults[keys[keyidx]]);

            // If localStorage has undefined (string type) as a value for that key, we set it to default
            if (localStorage.getItem(key) == "undefined") localStorage.setItem(key, this.Defaults[keys[keyidx]]);

            // If localStorage has undefined (null | undefined type) as a value for that key, we set it to default
            if (localStorage.getItem(key) == undefined) localStorage.setItem(key, this.Defaults[keys[keyidx]]);

            // If localStorage has null as a value for that key, we set it to default
            if (localStorage.getItem(key) == null) localStorage.setItem(key, this.Defaults[keys[keyidx]]);

            // If the typeof the value in localStorage at that key doesnt equal typeof the value in defaults, then cast the localStorage value to the same type as the default settings and reapply the value.
            if (typeof localStorage.getItem(key) != typeof this.Defaults[keys[keyidx]])
                localStorage.setItem(
                    key,
                    globalThis[(typeof this.Defaults[keys[keyidx]]).capitalize()](localStorage.getItem(key))
                );

            /*
            globalThis[(typeof this.Defaults[keys[keyidx]]).capitalize()](localStorage.getItem(key))
                    Lets break this down to make some more sense. I can read this, but I doubt anyone else knows what is going on.

                globalThis[X](Y) = GlobalObject[PropertyAccessor](Constructor Call)
                X Segment - (typeof this.Defaults[keys[keyidx]]).capitalize()
                X Explain - gets the typeof value in default settings, and capitalizes it (yes, that method i added to the String object was so I could one line this.)
                Y Segment - localStorage.getItem(key)
                Y Explain - the value from localStorage at that key
                Assume: keys[keyidx] = "ServerPort", key = "AMT_ServerPort"
                Step 1: globalThis[(typeof this.Defaults["ServerPort").capitalize()](localStorage.getItem("AMT_ServerPort"))
                Step 2: globalThis["number".capitalize()]("42069")
                Step 3: globalThis["Number"]("42069")
                Step 4: Number("42069");
                Result: 42069 (same value as what was stored. is now stored as a number, used to be stored as a string)
            */
        }
    };

    SaveSettings = () => {
        // Check if all keys exist, if they do, assign the Settings values to localStorage
        if (localStorage.hasAllItems(["AMT_ServerIP", "AMT_ServerPort", "AMT_ServerPath", "AMT_ServerProtocol"])) {
            localStorage.setItem("AMT_ServerIP", this.Settings.ServerIP);
            localStorage.setItem("AMT_ServerPort", this.Settings.ServerPort);
            localStorage.setItem("AMT_ServerPath", this.Settings.ServerPath);
            localStorage.setItem("AMT_ServerProtocol", this.Settings.ServerProtocol);
        } else {
            // Alert the user if there are missing values. There should not be, if you see this, you have a bug.
            alert("Failed to save settings to Local Storage!\n\n" + e);
        }
    };

    LoadSettings = () => {
        // Check if all keys exist, if they do, load the Settings values from localStorage
        if (localStorage.hasAllItems(["AMT_ServerIP", "AMT_ServerPort", "AMT_ServerPath", "AMT_ServerProtocol"])) {
            this.Settings.ServerIP = localStorage.getItem("AMT_ServerIP");
            this.Settings.ServerPort = localStorage.getItem("AMT_ServerPort");
            this.Settings.ServerPath = localStorage.getItem("AMT_ServerPath");
            this.Settings.ServerProtocol = localStorage.getItem("AMT_ServerProtocol");
        } else {
            // Alert the user if there are missing values. There should not be, if you see this, you have a bug.
            alert("Failed to load settings from Local Storage!");
        }
    };

    // WebSocket onopen event handler
    OnOpen = (event) => {
        //alert("Connected to AMT Desktop!");
        console.log(`WS Event | Open: ${JSON.stringify(event)}`);
        this.SaveSettings(); // The current settings must be correct as we just connected successfully
        this.Client.send("Hello from AMT Web!"); // send a hello to the Desktop App
        this.FailCount--;
    };

    // WebSocket onmessage event handler
    OnMessage = (event) => {
        // this is pretty self explanitory
        if (event.data instanceof ArrayBuffer) this.OnMessageArrayBuffer(event);
        if (event.data instanceof Blob) this.OnMessageBlob(event);
        this.OnMessageString(event);
    };

    // Fired when the onmessage event data is an ArrayBuffer
    OnMessageArrayBuffer = (event) => {
        alert("WS: Recieved ArrayBuffer!");
        console.log(`WS Event | Message | ArrayBuffer:\n\n${JSON.stringify(event)}}`);
    };

    // Fired when the onmessage event data is a Blob
    OnMessageBlob = (event) => {
        alert("WS: Recieved Blob!");
        console.log(`WS Event | Message | Blob:\n\n${JSON.stringify(event)}}`);
    };

    // Fired when the onmessage event data is a String
    OnMessageString = (event) => {
        //alert("WS: Recieved String!");
        //console.log(`WS Event | Message | String:\n\n${JSON.stringify(event.data)}}`);
        let splitResponse = event.data.split("|"); // split the message at the pipe symbol
        let AMTOpCode = splitResponse[0]; // left side of pipe is OpCode
        let AMTData = splitResponse[1]; // right side of pipe is JSON data

        switch (AMTOpCode) {
            case "SyncResponse": // When the OpCode is SyncResponse we use the JSON data to update the Web Apps appliance data
                globalThis.AMT.SetAppliances(AMTData);
                break;

            // There will be more OpCodes here, like Diff and ApplianceIds.
            // might even do images over websocket for the meme
            /* 
                Webpage hashes what it has for appliances and sends the hash paired with their respective appliance id to the websocket server. 
                the server hashes what it has on hand and checks against the web sync. 
                If the server has ids the website doesnt have, it will send them, and if the websocket server hashes dont match the hash the website sent, then it resends the appliance objects that dont pass the check.
                This will ensure the webpage has all appliances available and they are all in sync with the server.
            */
        }
    };

    // WebSocket onerror event handler
    OnError = (event) => {
        console.error(`WS Error:\n\n${JSON.stringify(event)}}`);
    };

    // WebSocket onclose event handler
    OnClose = (event) => {
        if (this.FailCount >= 5) return;
        this.FailCount++;
        //alert("WS: Closed.");
        console.log(`WS Event | Close:\n\n${JSON.stringify(event)}}`);
        setTimeout(() => {
            // When the socket closes, we wait 3 seconds to reconnect
            this.Client = new WebSocket(
                `${this.Settings.ServerProtocol}://${this.Settings.ServerIP}:${this.Settings.ServerPort}/${this.Settings.ServerPath}`
            );
        }, 3000);
    };

    OpenWS = (event) => {
        this.Client = new WebSocket(
            `${this.Settings.ServerProtocol}://${this.Settings.ServerIP}:${this.Settings.ServerPort}/${this.Settings.ServerPath}`
        );
    };
}

// AMT object for holding other data and utils for the application
let AMT = {
    Appliances: [], //Define Appliances array
    Tasks: [], // Define Tasks array

    // We use this to update the WebApp with data from the Desktop App
    SetAppliances: (AllAppliances) => {
        AMT.Appliances = JSON.parse(AllAppliances);
        //console.log(this.Appliances);
    },

    // Used to pull all tasks out of appliances into their own list
    GetTasks: () => {
        for (Appliance of AMT.Appliances) {
            for (Task of Appliance.Tasks) {
                Task.DueDate = Task.DueDate.split("T")[0];
                Task.Frequency = Task.Frequency.split(".")[0];
                AMT.Tasks.push(Task);
            }
        }
    },

    // SendMessage on the WebSocket connection, just a util
    SendMessage: (message) => {
        AMT.WS.Client.send(message);
    },

    // Used to get data from Desktop App.
    SyncWithDesktop: (callback) => {
        AMT.WS.Client.send("Sync"); // We tell the Desktop App we are trying to sync
        AMT.WS.Client.addEventListener("message", callback); // We create a listener for the next message (which will most likely be the SyncResponse)
        setTimeout(() => {
            // We wait 5 seconds and remove the listener as your connection is too slow or you have too many appliances if you havent gotten a response in 5 seconds. you should have recieved the data already.
            AMT.WS.Client.removeEventListener("message", callback);
        }, 5000);
    },

    CloseConnection: () => {
        AMT.WS.Client.close();
    },

    OpenConnection: () => {
        AMT.WS.OpenWS();
    },

    Reconnect: () => {
        AMT.CloseConnection();
        AMT.OpenConnection();
    },

    SetWSSetting: (settingName, value) => {
        localStorage[settingName] = value;
    },
};

// Define the AMT object on the Global object
Object.defineProperty(globalThis, "AMT", { value: AMT, writable: true });
// Define the WebSocket Client as a property on the now global AMT object
Object.defineProperty(AMT, "WS", { value: new AMTWebSocketClient(), writable: true });
