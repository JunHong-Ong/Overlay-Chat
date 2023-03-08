class OverlayChat {

    /**
     * A class representing the overlay chat as a HTML element.
     * 
     * The class stores display properties of the overlay chat.
     * 
     * @param {number[]} [position=[0, 0]] The position of the HTML element in px expressed as [x, y].
     * @param {number[]} [size=[300, 200]] The size of the HTML element in px expressed as [height, width].
     */
    constructor(position=[0, 0], size=[300, 200]) {
        console.debug("Creating new overlay chat object.");
        this._position = position;
        this._size = size;
        this._isVisible = true;
        this._isDraggable = true;

        this.HTMLElement = this._generate();
        this._updatePosition();
        this._updateSize();
    }

    insertMessage(messageData) {
        let messageContainer = document.createElement("div");
        let nameContainer = document.createElement("div");
        let textContainer = document.createElement("div");

        messageContainer.id = "message";
        nameContainer.id = "name";
        textContainer.id = "text";

        nameContainer.style.color = messageData.tags.color;
        nameContainer.textContent = messageData.source.nick;

        textContainer.textContent = messageData.parameters;

        messageContainer.insertAdjacentElement("beforeend", nameContainer);
        messageContainer.insertAdjacentElement("beforeend", textContainer);

        this.HTMLElement.insertAdjacentElement("beforeend", messageContainer);

        setTimeout(() => {
            messageContainer.remove();
        }, 5000);

        this.HTMLElement.scrollTop = this.HTMLElement.scrollHeight;
    }

    _generate() {
        const chatBox = document.createElement("div");
        chatBox.id = "overlay-chat";
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
        this.HTMLElement.style.left = this.posX + "px";
        this.HTMLElement.style.top = this.posY + "px";
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

    _checkSize(size) {
        let [height, width] = size;

        const minWidth = 0, minHeight = 0;
        const maxHeight = this.HTMLElement.parentElement.clientHeight - this.posY;
        const maxWidth = this.HTMLElement.parentElement.clientWidth - this.posX;

        height = height < minHeight ? minHeight : height;
        width = width < minWidth ? minWidth : width;
        height = height > maxHeight ? maxHeight : height;
        width = width > maxWidth ? maxWidth : width;

        return [height, width]
    }

    _updateSize() {
        // Updates size of overlay chat.
        this.HTMLElement.style.width = this.width + "px";
        this.HTMLElement.style.height = this.height + "px";
    }

    /**
     * Sets the size of the HTML element.
     * @param {number[]} size The size of the HTML element in px expressed as [height, width].
     */
    set size(size) {
        this._size = this._checkSize(size);
        this._updateSize();
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
}
