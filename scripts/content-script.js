let disallowedURL = new RegExp("(www\.twitch\.tv\/)($|directory.*|search.*|videos.*|team.*)");
let lastUrl = location.href;
let overlayChat = null;

console.debug("INITIAL SETUP");
initialSetup();

/**
 * Initial setup when user first visits any page under twitch.
 */
function initialSetup() {

    function portMessageHandler(message) {
        if ( message.type === "PRIVMSG" ) {
            overlayChat.insertMessage(message.message);
        }
    }

    const port = chrome.runtime.connect();
    port.onMessage.addListener(portMessageHandler);
    console.debug("PORT OPENED");

    onUrlChange()
}

/**
 * Set up URL monitoring.
 */
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, {subtree: true, childList: true});

function onUrlChange() {
    console.debug('URL changed!', location.href);
    console.debug(disallowedURL.exec(location.href));

    if ( disallowedURL.exec(location.href) === null ) {
        if ( document.querySelector("#overlay-chat") === null ) {
            overlayChat = new OverlayChat();

            overlayChat.HTMLElement.addEventListener("mousemove", (event) => {
                if ( event.ctrlKey && event.shiftKey ) {
                    if ( event.offsetX < 4 && event.offsetY < 4 || event.offsetX > overlayChat.width - 4 && event.offsetY > overlayChat.height - 4) {
                        overlayChat.HTMLElement.style.cursor = "nwse-resize";
                    } else if ( event.offsetX > overlayChat.width - 4 && event.offsetY < 4 || event.offsetX < 4 && event.offsetY > overlayChat.height - 4 ) {
                        overlayChat.HTMLElement.style.cursor = "nesw-resize";
                    } else if ( event.offsetX < 4 || event.offsetX > overlayChat.width - 4 ) {
                        overlayChat.HTMLElement.style.cursor = "ew-resize";
                    } else if ( event.offsetY < 4 || event.offsetY > overlayChat.height - 4 ) {
                        overlayChat.HTMLElement.style.cursor = "ns-resize";
                    } else {
                        overlayChat.HTMLElement.style.cursor = "move";
                    }
                }
            });

            overlayChat.HTMLElement.addEventListener("mouseleave", (event) => {
                overlayChat.HTMLElement.style.cursor = "default";
            });
            
            overlayChat.HTMLElement.addEventListener("mousedown", (event) => {
                event.preventDefault();
                if ( event.ctrlKey && event.shiftKey ) {
                    if ( event.offsetX < 4 && event.offsetY < 4 ) {
                        document.addEventListener("mousemove", resizeXLeft);
                        document.addEventListener("mousemove", resizeYTop);
                    } else if ( event.offsetX > overlayChat.width - 4 && event.offsetY < 4 ) {
                        document.addEventListener("mousemove", resizeXRight);
                        document.addEventListener("mousemove", resizeYTop);
                    } else if ( event.offsetX > overlayChat.width - 4 && event.offsetY > overlayChat.height - 4 ) {
                        document.addEventListener("mousemove", resizeXRight);
                        document.addEventListener("mousemove", resizeYBottom);
                    } else if ( event.offsetX < 4 && event.offsetY > overlayChat.height - 4 ) {
                        document.addEventListener("mousemove", resizeXLeft);
                        document.addEventListener("mousemove", resizeYBottom);
                    } else if ( event.offsetX < 4 ) {
                        document.addEventListener("mousemove", resizeXLeft);
                    } else if ( event.offsetX > overlayChat.width - 4 ) {
                        document.addEventListener("mousemove", resizeXRight);
                    } else if ( event.offsetY < 4 ) {
                        document.addEventListener("mousemove", resizeYTop);
                    } else if ( event.offsetY > overlayChat.height - 4 ) {
                        document.addEventListener("mousemove", resizeYBottom);
                    } else {
                        document.addEventListener("mousemove", moveEvent);

                    }
                    document.addEventListener("mouseup", stopMovement);
                }
            });
        }
    }
}

function moveEvent(event) {
    overlayChat.position = [overlayChat.posX + event.movementX, overlayChat.posY + event.movementY];
}
function resizeXLeft(event) {
    overlayChat.size = [overlayChat.height, overlayChat.width - event.movementX];
    overlayChat.position = [overlayChat.posX + event.movementX, overlayChat.posY];
}
function resizeXRight(event) {
    overlayChat.size = [overlayChat.height, overlayChat.width + event.movementX]
}
function resizeYTop(event) {
    overlayChat.size = [overlayChat.height - event.movementY, overlayChat.width]
    overlayChat.position = [overlayChat.posX, overlayChat.posY + event.movementY];
}
function resizeYBottom(event) {
    overlayChat.size = [overlayChat.height + event.movementY, overlayChat.width]
}
function stopMovement(event) {
    document.removeEventListener("mousemove", resizeXLeft);
    document.removeEventListener("mousemove", resizeXRight);
    document.removeEventListener("mousemove", resizeYTop);
    document.removeEventListener("mousemove", resizeYBottom);
    document.removeEventListener("mousemove", moveEvent);
    document.removeEventListener("mouseup", stopMovement);
}
