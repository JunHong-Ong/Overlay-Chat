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
            var message = this._parseChatMessage(event.data);

            if (message != null) {
                console.log(message);
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

    _parseChatMessage(chatMessage) {
        var tags, host, command, message;
        
        if (chatMessage.startsWith("@")) {

            [tags, chatMessage] = this._split(chatMessage, " ");
            [host, chatMessage] = this._split(chatMessage, " ");
            [command, message] = this._split(chatMessage, " :");

            if (command.startsWith("PRIVMSG")) {
                return message
            }
            return null
        }
        return null
    }

    _split(message, separator) {
        var arr, result;

        arr = message.split(separator);
        result = arr.splice(0, 1);
        result.push(arr.join(" "));

        return result
    }
}