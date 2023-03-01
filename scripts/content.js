var popout_chat;
const vidContainer = document.querySelector(".video-player__overlay");
const broadcaster = document.URL.match("(?:https://www.twitch.tv/)(?<broadcaster>.+)").groups["broadcaster"];

class PopOutChat {
    constructor(posX = 0, posY = 0, height = 300, width = 200, visible = true) {
        this.posX = posX;
        this.posY = posY;
        this.height = height;
        this.width = width;
        this.visible = visible;
        this.broadcaster = broadcaster;

        this.generate();

        // Make the DIV element draggable:
        dragElement(this.element);
    }

    generate() {
        this.element = document.createElement("div");
        this.element.id = "pop-out-chat";
        this.element.textContent = "Chat goes here..."; // Remove in future

        vidContainer.insertAdjacentElement("afterbegin", this.element);
        this.parent = this.element.parentElement;
    }

    update() {
        if (this.visible) {
            console.log("Showing element.");
            this.element.removeAttribute("hidden");
        } else {
            console.log("Hiding element.");
            this.element.setAttribute("hidden", true);
        }

        this.checkPosition();

        this.element.style.top = this.posY + "px";
        this.element.style.left = this.posX + "px";
        this.element.style.height = this.height + "px";
        this.element.style.width = this.width + "px";

        this.updateSettings();
    }

    checkPosition() {
        this.posX = this.posX < 0 ? 0 : this.posX;
        this.posY = this.posY < 0 ? 0 : this.posY;

        this.posX = this.posX > this.parent.offsetWidth - this.width ?
            this.parent.offsetWidth - this.width : this.posX;
        this.posY = this.posY > this.parent.offsetHeight - this.height ?
            this.parent.offsetHeight - this.height : this.posY;
    }

    updateSettings() {
        chrome.runtime.sendMessage({
            method: "POST",
            resource: "settings",
            data: {
                name: this.broadcaster,
                visible: this.visible,
                position: [this.posX, this.posY, this.height, this.width]
            }
        });
    }

    get position() {
        return [this.posX, this.posY];
    }

    set position(value) {
        [this.posX, this.posY] = value;
        console.info(`Position has been updated to (${this.posX}, ${this.posY}).`);
    }

    get size() {
        return [this.height, this.width];
    }

    set size(value) {
        [this.height, this.width] = value;
        console.info(`Size has been updated to (${this.height}, ${this.width}).`);
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
        
        popout_chat.position = [elmnt.offsetLeft, elmnt.offsetTop];
        popout_chat.update();
    }
};

function main() {

    // When content script is injected, sends message to request for settings
    settings = chrome.runtime.sendMessage({ method: "GET", resource: "settings", params: {name: broadcaster} });
    settings.then((response) => {
        if (response.statusCode === 422) {
            console.info("Generating default popout.")
            popout_chat = new PopOutChat();
        } else if (response.statusCode === 200) {
            console.info("Generating popout from saved settings.")
            var posX, posY, height, width, visible;
            [posX, posY, height, width] = response.content.position;
            visible = response.content.visible;
            popout_chat = new PopOutChat(posX, posY, height, width, visible);
        }

        popout_chat.update();
        new ResizeObserver(() => {popout_chat.update()}).observe(vidContainer);
    });

};

chrome.runtime.onMessage.addListener((response) => {
    if (response === "show chat") {
        popout_chat.visible = true;
    } else if (response === "hide chat") {
        popout_chat.visible = false;
    }

    popout_chat.update();
})

main();
