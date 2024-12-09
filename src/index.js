//////////////////////////////////
//Utitity Methods Local Storage //
//////////////////////////////////

// Add a 'hasItem' method to the Storage prototype to check if a key exists in localStorage
function DefineStorage_hasItem(key) {
    let value = localStorage.getItem(key); // Retrieve the value associated with the given key from localStorage
    if (value == null) {
        // If the value is null (key doesn't exist in localStorage)
        return false; // Indicate the key is not present
    }
    return true; // Indicate the key exists
}

// Extend the Storage prototype with the 'hasItem' method
Object.defineProperty(Storage.prototype, "hasItem", { value: DefineStorage_hasItem, writable: true });

// Add a 'hasAllItems' method to the Storage prototype to check if all keys in an array exist in localStorage
function DefineStorage_hasAllItems(keys) {
    let result = []; // Array to store the existence checks for each key
    for (let key of keys) {
        // Iterate over the keys array
        result.push(localStorage.hasItem(key)); // Use 'hasItem' to check each key and add the result to the array
    }
    if (result.includes(false)) return false; // If any result is false, not all keys exist; return false
    return true; // If all results are true, all keys exist; return true
}

// Extend the Storage prototype with the 'hasAllItems' method
Object.defineProperty(Storage.prototype, "hasAllItems", { value: DefineStorage_hasAllItems, writable: true });

// Add a 'capitalize' method to the String prototype to capitalize the first letter of a string
function DefineString_capitalize() {
    let result = this.split(""); // Split the string into an array of characters
    result[0] = result[0].toUpperCase(); // Convert the first character to uppercase
    return result.join(""); // Rejoin the characters into a string and return it
}

// Extend the String prototype with the 'capitalize' method
Object.defineProperty(String.prototype, "capitalize", { value: DefineString_capitalize, writable: true });


//////////////////////////
//WebSocket Client Setup//
//////////////////////////

// WebSocket client class for Appliance Maintenance Tracker (AMT), handles communication between web app and server
class AMTWebSocketClient {
    // Default WebSocket connection settings
    Defaults = {
        ServerIP: "127.0.0.1", // Default server IP (localhost)
        ServerPort: 42069, // Default server port
        ServerPath: "amt", // Default WebSocket path
        ServerProtocol: "ws", // Default protocol ('ws' for non-secure)
    };

    // Active settings object (modifiable during runtime)
    Settings = this.Defaults;

    // WebSocket client instance
    Client;

    // Counter for WebSocket connection failures
    FailCount = 0;

    constructor() {
        Object.seal(this.Defaults); // Prevent modifications to the Defaults object
        this.ValidateSettings(); // Ensure the settings in localStorage are valid
        this.LoadSettings(); // Load settings from localStorage
        this.Client = new WebSocket(
            `${this.Settings.ServerProtocol}://${this.Settings.ServerIP}:${this.Settings.ServerPort}/${this.Settings.ServerPath}`
        );

        // Bind WebSocket event handlers
        this.Client.onopen = this.OnOpen;
        this.Client.onmessage = this.OnMessage;
        this.Client.onerror = this.OnError;
        this.Client.onclose = this.OnClose;
    }

    // Validate and synchronize WebSocket settings with localStorage
    ValidateSettings = () => {
        let keys = Object.keys(this.Defaults); // Retrieve keys from the Defaults object

        for (let key of keys) {
            let localStorageKey = `AMT_${key}`; // Prefix keys with 'AMT_' for localStorage

            // Ensure localStorage contains valid values for each key
            if (!localStorage.hasItem(localStorageKey) || localStorage.getItem(localStorageKey) === "undefined") {
                localStorage.setItem(localStorageKey, this.Defaults[key]);
            }
            if (localStorage.getItem(localStorageKey) == null || typeof localStorage.getItem(localStorageKey) !== typeof this.Defaults[key]) {
                localStorage.setItem(
                    localStorageKey,
                    globalThis[(typeof this.Defaults[key]).capitalize()](localStorage.getItem(localStorageKey))
                );
            }
        }
    };

    // Save the current WebSocket settings to localStorage
    SaveSettings = () => {
        if (localStorage.hasAllItems(["AMT_ServerIP", "AMT_ServerPort", "AMT_ServerPath", "AMT_ServerProtocol"])) {
            localStorage.setItem("AMT_ServerIP", this.Settings.ServerIP);
            localStorage.setItem("AMT_ServerPort", this.Settings.ServerPort);
            localStorage.setItem("AMT_ServerPath", this.Settings.ServerPath);
            localStorage.setItem("AMT_ServerProtocol", this.Settings.ServerProtocol);
        } else {
            alert("Failed to save settings to Local Storage!");
        }
    };

    // Load WebSocket settings from localStorage
    LoadSettings = () => {
        if (localStorage.hasAllItems(["AMT_ServerIP", "AMT_ServerPort", "AMT_ServerPath", "AMT_ServerProtocol"])) {
            this.Settings.ServerIP = localStorage.getItem("AMT_ServerIP");
            this.Settings.ServerPort = localStorage.getItem("AMT_ServerPort");
            this.Settings.ServerPath = localStorage.getItem("AMT_ServerPath");
            this.Settings.ServerProtocol = localStorage.getItem("AMT_ServerProtocol");
        } else {
            alert("Failed to load settings from Local Storage!");
        }
    };

    ////////////////////
    //WebSocket Events//
    ////////////////////

    // Handle successful WebSocket connection, sends greeting to server
    OnOpen = (event) => {
        console.log(`WS Event | Open: ${JSON.stringify(event)}`);
        this.SaveSettings(); // Save valid settings
        this.Client.send("Hello from AMT Web!"); // Notify the server of the connection
        this.FailCount--;
    };

    // Handle incoming WebSocket messages, different handlers are called depending on data type
    OnMessage = (event) => {
        if (event.data instanceof ArrayBuffer) this.OnMessageArrayBuffer(event);
        if (event.data instanceof Blob) this.OnMessageBlob(event);
        this.OnMessageString(event);
    };

    OnMessageArrayBuffer = (event) => {
        console.log(`WS Event | Message | ArrayBuffer: ${JSON.stringify(event)}`);
    };

    OnMessageBlob = (event) => {
        console.log(`WS Event | Message | Blob: ${JSON.stringify(event)}`);
    };

    OnMessageString = (event) => {
        let [AMTOpCode, AMTData] = event.data.split("|"); // Extract OpCode and data

        switch (AMTOpCode) {
            case "SyncResponse":
                globalThis.AMT.SetAppliances(AMTData);
                break;
            // Handle other OpCodes as needed
        }
    };

    OnError = (event) => {
        console.error(`WS Error: ${JSON.stringify(event)}`);
    };

    OnClose = (event) => {
        console.log(`WS Event | Close: ${JSON.stringify(event)}`);
        if (this.FailCount >= 5) return; // Stop reconnecting after 5 failures
        this.FailCount++;
        setTimeout(() => {
            this.Client = new WebSocket(
                `${this.Settings.ServerProtocol}://${this.Settings.ServerIP}:${this.Settings.ServerPort}/${this.Settings.ServerPath}`
            );
        }, 3000); // Attempt reconnection after 3 seconds
    };
}

// Define the global AMT object with utility functions and WebSocket client
let AMT = {
    Appliances: [], // Array to store appliance data
    Tasks: [], // Array to store task data

    // Method to update the list of appliances with received data
    SetAppliances: (AllAppliances) => {
        // Parse the JSON string into a JavaScript object/array
        AMT.Appliances = JSON.parse(AllAppliances);
    },

    // Method to extract tasks from appliances and populate the AMT.Tasks array
    GetTasks: () => {
        // Loop through each appliance in the AMT.Appliances array
        for (let Appliance of AMT.Appliances) {
            // Loop through each task associated with the current appliance
            for (let Task of Appliance.Tasks) {

                // Format the DueDate to remove the time portion by splitting at "T" 
                Task.DueDate = Task.DueDate.split("T")[0];
                // format the Frequency to remove decimal places and take first part
                Task.Frequency = Task.Frequency.split(".")[0];
                // Add the formatted task object to the AMT.Tasks array
                AMT.Tasks.push(Task);
            }
        }
    },

    // Method to send a message through the WebSocket connection
    SendMessage: (message) => {
        // Use the WebSocket client stored in AMT.WS.Client to send the provided message
        AMT.WS.Client.send(message);
    },

    // Method to synchronize data between the Web App and the Desktop App
    SyncWithDesktop: (callback) => {
        // Send a "Sync" message to the WebSocket server to initiate synchronization
        AMT.WS.Client.send("Sync");

        // Add an event listener to handle the response message from the WebSocket server
        AMT.WS.Client.addEventListener("message", callback);

        // Set a timeout to remove the event listener after 5 seconds, 
        // ensuring the callback doesn't persist indefinitely in case of no response
        setTimeout(() => {
            AMT.WS.Client.removeEventListener("message", callback);
        }, 5000);
    },
};

// Make the AMT object and WebSocket client globally accessible
Object.defineProperty(globalThis, "AMT", { value: AMT, writable: true });
Object.defineProperty(AMT, "WS", { value: new AMTWebSocketClient(), writable: true });
