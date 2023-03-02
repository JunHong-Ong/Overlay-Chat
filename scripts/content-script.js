var overlayChat;
const vidContainer = document.querySelector(".video-player__overlay");
const broadcaster = document.URL.match("(?:https://www.twitch.tv/)(?<broadcaster>.+)").groups["broadcaster"];

class OverlayChat {
    constructor(broadcaster, position=[0, 0], size=[300, 200]) {
        // (X, Y) position of overlay chat within the video container.
        [this._posX, this._posY] = position;
        // Height and Width of overlay chat.
        [this._height, this._width] = size;

        // Meta properties of the overlay chat.
        this.broadcaster = broadcaster;
        this.isVisible = true;
        
        // Generate and inserts draggable element into video container
        this._generate();
        this._insertElement(this.element, vidContainer);

        // Make the DIV element draggable:
        dragElement(this.element);
    }

    update() {
        if (this.isVisible) {
            console.info("Showing element.");
            this.element.removeAttribute("hidden");
        } else {
            console.info("Hiding element.");
            this.element.setAttribute("hidden", true);
        }

        this.checkPosition();

        this.element.style.top = this._posY + "px";
        this.element.style.left = this._posX + "px";
        this.element.style.height = this._height + "px";
        this.element.style.width = this._width + "px";

        this.updateSettings();
    }

    checkPosition() {
        this._posX = this._posX < 0 ? 0 : this._posX;
        this._posY = this._posY < 0 ? 0 : this._posY;

        this._posX = this._posX > this.element.parent.offsetWidth - this._width ?
            this.element.parent.offsetWidth - this._width : this._posX;
        this._posY = this._posY > this.element.parent.offsetHeight - this._height ?
            this.element.parent.offsetHeight - this._height : this._posY;
    }

    updateSettings() {
        chrome.runtime.sendMessage({
            method: "POST",
            resource: "settings",
            data: {
                name: this.broadcaster,
                visible: this.isVisible,
                position: [this._posX, this._posY, this._height, this._width]
            }
        });
    }

    get position() {
        return [this._posX, this._posY];
    }

    set position(value) {
        [this._posX, this._posY] = value;
        console.info(`Position has been updated to (${this._posX}, ${this._posY}).`);
    }

    get size() {
        return [this._height, this._width];
    }

    set size(value) {
        [this._height, this._width] = value;
        console.info(`Size has been updated to (${this._height}, ${this._width}).`);
    }

    _generate() {
        this.element = document.createElement("div");
        this.element.id = "overlay-chat";
        this.element.textContent = "Chat goes here..."; // Remove in future
    }

    /**
     * Inserts an element as the child of another element.
     * 
     * @param {*} child 
     * @param {*} parent 
     */
    _insertElement(child, parent) {
        parent.insertAdjacentElement("afterbegin", child);
        child.parent = parent;
    }
    
};

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Allow moving the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Bound element within video container
        var newTop = (elmnt.offsetTop - pos2),
            newLeft = (elmnt.offsetLeft - pos1),
            parentContainer = elmnt.parentElement;

        newTop = newTop < 0 ? 0 : newTop
        newLeft = newLeft < 0 ? 0 : newLeft

        newTop = newTop > parentContainer.clientHeight - elmnt.clientHeight ? parentContainer.clientHeight - elmnt.clientHeight : newTop
        newLeft = newLeft > parentContainer.clientWidth - elmnt.clientWidth ? parentContainer.clientWidth - elmnt.clientWidth : newLeft
        
        // set the element's new position:
        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        
        overlayChat.position = [elmnt.offsetLeft, elmnt.offsetTop];
        overlayChat.update();
    }
};

function main() {

    // When content script is injected, sends message to request for settings
    settings = chrome.runtime.sendMessage({ method: "GET", resource: "settings", params: {name: broadcaster} });
    settings.then((response) => {
        if (response.statusCode === 422) {
            console.info("Generating default popout.")
            overlayChat = new OverlayChat();
        } else if (response.statusCode === 200) {
            console.info("Generating popout from saved settings.")
            var posX, posY, height, width, visible;
            [posX, posY, height, width] = response.content.position;
            visible = response.content.visible;
            overlayChat = new OverlayChat(posX, posY, height, width, visible);
        }

        overlayChat.update();
        new ResizeObserver(() => {overlayChat.update()}).observe(vidContainer);

        var port = chrome.runtime.connect({name: broadcaster});

        port.onMessage.addListener((message) => {
            overlayChat.element.textContent = message.data;
        });
    });
};

chrome.runtime.onMessage.addListener((response) => {
    if (response === "show chat") {
        overlayChat.visible = true;
    } else if (response === "hide chat") {
        overlayChat.visible = false;
    }

    overlayChat.update();
})

main();
