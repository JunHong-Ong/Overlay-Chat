customElements.define("overlay-chat", OverlayChat);

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
        if ( document.querySelector("overlay-chat") === null ) {
            overlayChat = document.createElement("overlay-chat");
            document.querySelector(".video-player__overlay").insertAdjacentElement("afterbegin", overlayChat);
        }
    }
}
