console.debug("INITIAL LOAD")

let overlayChat = null;
chrome.runtime.onMessage.addListener(
    (message) => {
        if ( message.action === "SETUP" ) {
            if ( overlayChat === null ){
                overlayChat = new OverlayChat();

                overlayChat.HTMLElement.addEventListener("mousemove", (event) => {
                    if ( event.ctrlKey && event.shiftKey ) {
                        if ( event.offsetX < 4 && event.offsetY < 4 || event.offsetX > overlayChat.width - 4 && event.offsetY > overlayChat.height - 4) {
                            overlayChat.HTMLElement.classList.toggle("nwse-resize", true);
                            overlayChat.HTMLElement.classList.toggle("ew-resize", false);
                            overlayChat.HTMLElement.classList.toggle("ns-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nesw-resize", false);
                            overlayChat.HTMLElement.classList.toggle("move", false);
                        } else if ( event.offsetX > overlayChat.width - 4 && event.offsetY < 4 || event.offsetX < 4 && event.offsetY > overlayChat.height - 4 ) {
                            overlayChat.HTMLElement.classList.toggle("nesw-resize", true);
                            overlayChat.HTMLElement.classList.toggle("ew-resize", false);
                            overlayChat.HTMLElement.classList.toggle("ns-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nwse-resize", false);
                            overlayChat.HTMLElement.classList.toggle("move", false);
                        } else if ( event.offsetX < 4 || event.offsetX > overlayChat.width - 4 ) {
                            overlayChat.HTMLElement.classList.toggle("ew-resize", true);
                            overlayChat.HTMLElement.classList.toggle("ns-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nesw-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nwse-resize", false);
                            overlayChat.HTMLElement.classList.toggle("move", false);
                        } else if ( event.offsetY < 4 || event.offsetY > overlayChat.height - 4 ) {
                            overlayChat.HTMLElement.classList.toggle("ns-resize", true);
                            overlayChat.HTMLElement.classList.toggle("ew-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nesw-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nwse-resize", false);
                            overlayChat.HTMLElement.classList.toggle("move", false);
                        } else {
                            overlayChat.HTMLElement.classList.toggle("move", true);
                            overlayChat.HTMLElement.classList.toggle("ew-resize", false);
                            overlayChat.HTMLElement.classList.toggle("ns-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nesw-resize", false);
                            overlayChat.HTMLElement.classList.toggle("nwse-resize", false);
                        }
                    }
                })

                overlayChat.HTMLElement.addEventListener("mouseleave", (event) => {
                    overlayChat.HTMLElement.classList.toggle("ew-resize", false);
                    overlayChat.HTMLElement.classList.toggle("ns-resize", false);
                    overlayChat.HTMLElement.classList.toggle("nesw-resize", false);
                    overlayChat.HTMLElement.classList.toggle("nwse-resize", false);
                    overlayChat.HTMLElement.classList.toggle("move", false);
                })
                
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
    document.removeEventListener("mousemove", resizeXLeft);
    document.removeEventListener("mousemove", resizeXRight);
    document.removeEventListener("mousemove", resizeYTop);
    document.removeEventListener("mousemove", resizeYBottom);
    document.removeEventListener("mousemove", moveEvent);
    document.removeEventListener("mouseup", stopMovement);
}
