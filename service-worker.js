// Set initial state of extension
// Perhaps use local db to save variables: state (on/off), last position (top, left)
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "ON",
    });
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if (request.resource === "settings") {
        if (request.method === "GET") {
            console.info(`Retrieving settings for ${request.params.name}.`);
            var settings = chrome.storage.local.get(request.params.name)
            settings.then((response) =>  {
                if (response[request.params.name] === undefined) {
                    console.info("Unable to find settings.");
                    sendResponse({ statusCode: 422, message: `No settings saved for ${request.params.name}.` });
                } else {
                    console.info("Found settings.");
                    sendResponse({ statusCode: 200, message: "OK", content: response[request.params.name]});
                }
            });
        } else if (request.method === "POST") {
            console.info(`Saving settings for ${request.data.name}.`);
            chrome.storage.local.set({ [request.data.name]: request.data }).then(() => {
                sendResponse({ statusCode: 200, message: "OK" });
            });
        };
    };

    return true;
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${JSON.stringify(oldValue)}", new value is "${JSON.stringify(newValue)}".`
        )
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState,
    });

    if (nextState === "ON") {
        chrome.tabs.sendMessage(tab.id, "show chat");
    } else if (nextState === "OFF") {
        chrome.tabs.sendMessage(tab.id, "hide chat");
    }
});

// // TODO: connect to twitch websocket, send chat messages as request to content script
class TwitchSocket extends WebSocket {
    
    constructor(token, user, port) {
        super("ws://irc-ws.chat.twitch.tv:80");

        this.port = port;
        this.isClosed = false;

        // Executes when connection is opened
        this.addEventListener("open", () => {
            this.send(`PASS oauth:${token}`);
            this.send(`NICK ${user}`);
            this.send("CAP REQ :twitch.tv/commands twitch.tv/tags");

            this.join(port.name);
        });

        this.addEventListener("message", (event) => {
            var message = this._parseChatMessage(event.data);

            if (message != null && !this.isClosed) {
                this._sendToScript(message);
            }
        })

        this.addEventListener("error", (event) => {
            console.log(event);
            // TODO: Send message to content script indicating error
            socket.close();
        })

        this.addEventListener("close", () => {
            this.isClosed = true;
        })
    }

    // Joins a specified channel
    join(channel) {

        // Inserts # as first character if not present 
        if (channel[0] != "#" ) {
            channel = `#${channel}`;
        }

        // Sends JOIN command
        this.send(`JOIN ${channel}`);
    }

    _sendToScript(message) {
        this.port.postMessage({data: message});
    }

    _parseChatMessage(chatMessage) {
        var tags, host, command, message;
        
        if (chatMessage.startsWith("@")) {

            [tags, chatMessage] = this._split(chatMessage, " ");
            [host, chatMessage] = this._split(chatMessage, " ");
            [command, message] = this._split(chatMessage, " :");

            if (command.startsWith("PRIVMSG")) {
                return message
            }
            return null
        }
        return null
    }

    _split(message, separator) {
        var arr, result;

        arr = message.split(separator);
        result = arr.splice(0, 1);
        result.push(arr.join(" "));

        return result
    }
}

chrome.runtime.onConnect.addListener(function(port) {
    socket = new TwitchSocket("token", "user", port);
});
