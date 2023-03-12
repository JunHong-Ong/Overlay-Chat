class OverlayChat extends OverlayElement {

    /**
     * A class representing the overlay chat as a HTML element.
     * 
     * The class stores display properties of the overlay chat.
     * 
     * @param {number[]} [position=[0, 0]] The position of the HTML element in px expressed as [x, y].
     * @param {number[]} [size=[300, 200]] The size of the HTML element in px expressed as [height, width].
     */
    constructor(position=[0, 0], size=[300, 200]) {
        super();
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

        this.insertAdjacentElement("beforeend", messageContainer);

        setTimeout(() => {
            messageContainer.remove();
        }, 5000);

        this.scrollTop = this.scrollHeight;
    }
}
