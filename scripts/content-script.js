var overlayChat, port;

customElements.define("overlay-chat", OverlayChat);
let disallowedUrls = new RegExp("(www\.twitch\.tv\/)($|directory.*|search.*|videos.*|team.*)");

function portMessageHandler(message) {
    if ( message.type === "PRIVMSG" ) {
        globalThis.overlayChat.insertMessage(message.message);
    } else {
        console.debug(message);
    }
}

let lastUrl = location.href;

new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, {subtree: true, childList: true});

function onUrlChange() {
    port.postMessage({ action:"PART" });

    if ( disallowedUrls.exec(location.href) === null ) {
        const url = new URL(location.href);
        const broadcaster = url.pathname.replace("/", "")

        if ( document.querySelector("overlay-chat") === null ) {
            overlayChat = document.createElement("overlay-chat");
            document.querySelector(".video-player__overlay").insertAdjacentElement("afterbegin", overlayChat);
        }
        port.postMessage({ action:"JOIN", broadcaster:broadcaster });
    }
}


function setUpPort(resolve, reject) {
    port = chrome.runtime.connect();
    port.onMessage.addListener(portMessageHandler);
    port = port;
    console.debug("Completed: Port Setup.");

    chrome.runtime.sendMessage("Setup Socket")
        .then((response) => {
            if ( response === "Completed" ) {
                console.debug("Completed: Socket Setup.")
                resolve();
            }
        })
}

function checkUrl() {
    let disallowedUrls = new RegExp("(www\.twitch\.tv\/)($|directory.*|search.*|videos.*|team.*)");
    const isAllowed = disallowedUrls.exec(location.href) === null
    
    return isAllowed;
}

function createElement(isAllowed) {

    if ( isAllowed ) {
        if ( document.querySelector("overlay-chat") === null ) {
            overlayChat = document.createElement("overlay-chat");
            document.querySelector(".video-player__overlay").insertAdjacentElement("afterbegin", overlayChat);
            console.debug("Completed: Insert Element.")
        } else {
            console.debug("Element already exists.")
        }
    }

    return isAllowed;
}

function joinChannel(isAllowed) {
    const url = new URL(location.href);
    const broadcaster = url.pathname.replace("/", "");

    if ( isAllowed ) {
        console.debug("URL allowed. Joining channel...");
        port.postMessage({ action: "JOIN", broadcaster: broadcaster });
    }
    
    return;
}

function leaveChannel() {
    port.postMessage({ action: "PART" });
}


new Promise(setUpPort)
    .then(checkUrl)
    .then(createElement)
    .then(joinChannel)
    .catch((error) => {
        console.error(`Initial setup failed: ${error}`);
    })
    .finally(() => console.log("All done"));
