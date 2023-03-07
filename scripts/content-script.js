console.debug("INITIAL LOAD")

function displayMessage(data) {
    let messageContainer = document.createElement("div");
    let nameContainer = document.createElement("div");
    let textContainer = document.createElement("div");

    messageContainer.id = "message";
    nameContainer.id = "name";
    textContainer.id = "text";

    nameContainer.style.color = data.tags.color;
    nameContainer.textContent = data.source.nick;

    textContainer.textContent = data.parameters;

    messageContainer.insertAdjacentElement("beforeend", nameContainer);
    messageContainer.insertAdjacentElement("beforeend", textContainer);

    return messageContainer;
}

let port = chrome.runtime.connect();
port.postMessage({ action: "SETUP" })

port.onMessage.addListener(
    (message) => {
        if ( message.type === "PRIVMSG" ) {
            let container = document.querySelector("#overlay-chat");
            let messageContainer = displayMessage(message.message);
            container.insertAdjacentElement("beforeend",
                messageContainer);
            container.scrollTop = container.scrollHeight;
            setTimeout(() => {
                messageContainer.remove();
            }, 5000);
        }        
    }
)
