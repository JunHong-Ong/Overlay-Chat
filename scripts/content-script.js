let overlayChat;

function main() {
    const broadcasterRegex = document.URL.match("(?:https://www.twitch.tv/)(?<broadcaster>.+)");
    const broadcaster = broadcasterRegex.groups["broadcaster"];
    overlayChat = new OverlayChat(broadcaster);
}

function moveEvent(event) {
    // Update position of overlay chat.
    overlayChat.position = [overlayChat.posX + event.movementX, overlayChat.posY + event.movementY];
}

function upEvent(event) {
    document.removeEventListener("mouseup", upEvent);
    document.removeEventListener("mousemove", moveEvent);

    // Save new position in storage.
}

main();

overlayChat.HTMLElement.addEventListener("mousedown", function (event) {
    event.preventDefault();
    document.addEventListener("mousemove", moveEvent);
    document.addEventListener("mouseup", upEvent);
})
