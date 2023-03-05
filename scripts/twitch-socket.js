class TwitchSocket extends WebSocket {
    
    constructor(token, user, broadcaster) {
        super("wss://irc-ws.chat.twitch.tv:443");

        // Executes when connection is opened
        this.addEventListener("open", () => {
            this.send(`PASS oauth:${token}`);
            this.send(`NICK ${user}`);
            this.send("CAP REQ :twitch.tv/commands twitch.tv/tags");

            this.join(broadcaster);
        });

        this.addEventListener("message", (event) => {
            let message = new Message(event.data);
            if (message._parsedMessage != null) {
                if (message.command === "PRIVMSG") {
                    let messageElement = message.display();
                    document.querySelector("#overlay-chat").insertAdjacentElement("beforeend", messageElement);
                    setTimeout(() => {
                        messageElement.remove();
                    }, 5000);
                }
                if (message.command === "PING") {
                    this.send(`PONG ${message.parameters}`);
                }
            }
        })

        this.addEventListener("error", (event) => {
            console.log(event);
            socket.close();
        })
    }

    // Joins a specified channel
    join(channel) {

        // Inserts # as first character if not present 
        if (channel[0] != "#" ) {
            channel = `#${channel}`;
        }

        // Sends JOIN command
        this.send(`JOIN ${channel}`);
    }
}