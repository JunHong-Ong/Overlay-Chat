class OverlayChat {

    /**
     * A class representing the overlay chat as a HTML element.
     * 
     * The class stores display properties of the overlay chat.
     * 
     * @param {string}    broadcaster      The name of the broadcaster.
     * @param {number[]} [position=[0, 0]] The position of the HTML element in px expressed as [x, y].
     * @param {number[]} [size=[300, 200]] The size of the HTML element in px expressed as [height, width].
     */
    constructor(broadcaster, position=[0, 0], size=[300, 200]) {

        this.broadcaster = broadcaster;
        
        console.debug("Creating new overlay chat object.");
        this._position = position;
        this._size = size;
        this.isVisible = true;
        this.isDraggable = true;

        this.HTMLElement = this._generate();
        this._updatePosition();
        this._updateSize();

        this.messages = [];
        this.socket = new TwitchSocket("token", "user", this.broadcaster);

    }

    _generate() {
        const chatBox = document.createElement("div");
        chatBox.id = "overlay-chat";
        chatBox.textContent = "Chat goes here..." // Remove in future.

        document.querySelector(".video-player__overlay").insertAdjacentElement("afterbegin", chatBox);

        return chatBox
    }

    _checkPosition(position) {
        let [chatX, chatY] =  position;

        const minX = 0, minY = 0;
        const maxX = this.HTMLElement.parentElement.clientWidth - this.width;
        const maxY = this.HTMLElement.parentElement.clientHeight - this.height;

        // Ensures that overlay chat element stays within parent container
        chatX = chatX < minX ? minX : chatX;
        chatY = chatY < minY ? minY : chatY;
        chatX = chatX > maxX ? maxX : chatX;
        chatY = chatY > maxY ? maxY : chatY;

        return [chatX, chatY]
    }

    _updatePosition() {
        // Updates position of overlay chat.
        this.HTMLElement.style.left = this.posX + "px";
        this.HTMLElement.style.top = this.posY + "px";
    }

    _updateSize() {
        // Updates size of overlay chat.
        this.HTMLElement.style.width = this.width + "px";
        this.HTMLElement.style.height = this.height + "px";
    }

    /**
     * Gets the height of the HTML element in px.
     */
    get height() {
        return this._size[0];
    }

    /**
     * Gets the width of the HTML element in px.
     */
    get width() {
        return this._size[1];
    }

    /**
     * Gets the x position (left) of the HTML element in px.
     */
    get posX() {
        return this._position[0];
    }

    /**
     * Gets the y position (top) of the HTML element in px.
     */
    get posY() {
        return this._position[1];
    }

    /**
     * Sets the position of the HTML element.
     * @param {number[]} position The position of the HTML element in px expressed as [x, y].
     */
    set position(position) {
        this._position = this._checkPosition(position);
        this._updatePosition();
    }

    /**
     * Sets the size of the HTML element.
     * @param {number[]} size The size of the HTML element in px expressed as [height, width].
     */
    set size(size) {
        this._size = size;
        this._updateSize();
    }
}
