import { TwitchSocket } from "./twitch-socket.js";


let a = new RegExp("(?:www\.twitch\.tv\/)(?!$|directory.*|search.*|videos.*|team.*)(?<broadcaster>.*)")

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

chrome.action.onClicked.addListener(async (tab) => {
    if ( a.exec(tab.url) !== null ) {
        // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
        const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
        // Next state will always be the opposite
        const nextState = prevState === 'ON' ? 'OFF' : 'ON'

        // Set the action badge to the next state
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: nextState,
        });

        if ( nextState === "ON" ) {
            const url = new URL(tab.url);
            const broadcaster = url.pathname.replace("/", "");
            let socket = openConnections[tab.id].socket;
            socket.broadcaster = broadcaster;
            console.debug(`JOINING ${broadcaster}`);

        } else if ( nextState === "OFF" ) {
            let socket = openConnections[tab.id].socket;
            socket.part();
            console.debug(`LEAVING ${socket.broadcaster}`);
        }
    }
})


let openConnections = {}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if ( message === "Setup Socket" ) {
            chrome.storage.local.get("credentials")
                .then((response) => {
                    const socket = new TwitchSocket(response.credentials.token, response.credentials.user, openConnections[sender.tab.id]["port"]);
                    openConnections[sender.tab.id]["socket"] = socket;
                    socket.addEventListener("open", () => sendResponse("Completed"));
                })
        }

        return true;
    }
)

chrome.runtime.onConnect.addListener(
    (port) => {
        const tabId = port.sender.tab.id;
        openConnections[tabId] = {};

        console.debug(`Opened PORT for tab ID: ${port.sender.tab.id} (index: ${port.sender.tab.index})`);
        openConnections[tabId]["port"] = port;

        // Shuts down socket when port disconnects
        port.onDisconnect.addListener(
            (port) => {
                console.debug("Shutting down SOCKET for tab ID: {");
                let connection = openConnections[port.sender.tab.id]
                connection.socket.part(); //ERROR LINE
                connection.socket.close();
            }
        )

        port.onMessage.addListener(
            (message, port, sendResponse) => {
                if ( message.action === "JOIN" ) {
                    let connection = openConnections[port.sender.tab.id];
                    connection.socket.broadcaster = message.broadcaster;
                } else if ( message.action === "PART" ) {
                    let connection = openConnections[port.sender.tab.id];
                    if ( connection !== undefined ) {
                        connection.socket.part();
                    }
                }
            }
        )
    }
)
