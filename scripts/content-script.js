console.debug("INITIAL LOAD")

let overlayChat = null;
chrome.runtime.onMessage.addListener(
    (message) => {
        if ( message.action === "SETUP" ) {
            if ( overlayChat === null ){
                overlayChat = new OverlayChat();

                overlayChat.HTMLElement.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                    if ( event.ctrlKey && event.shiftKey ) {
                        if ( event.offsetX < 4 ) {
                            document.onmousemove = resizeXLeft;
                        } else if ( event.offsetX > overlayChat.width - 4 ) {
                            document.onmousemove = resizeXRight;
                        } else if ( event.offsetY < 4 ) {
                            document.onmousemove = resizeYTop;
                        } else if ( event.offsetY > overlayChat.height - 4 ) {
                            document.onmousemove = resizeYBottom;
                        } else {
                            document.onmousemove = moveEvent;
                        }
                        document.onmouseup = stopMovement;
                    }
                });  
            }
        }
    }
)

let port = chrome.runtime.connect();
port.onMessage.addListener(
    (message) => {
        if ( message.type === "PRIVMSG" ) {
            overlayChat.insertMessage(message.message);
        }        
    }
)

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
    document.onmouseup = null;
    document.onmousemove = null;
}
