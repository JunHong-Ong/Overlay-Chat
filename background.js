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