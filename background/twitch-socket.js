import { Message } from "./message.js";


export class TwitchSocket extends WebSocket {
    
    constructor(token, user, port) {
        super("wss://irc-ws.chat.twitch.tv:443");
        this.port = port;

        // Executes when connection is opened
        this.addEventListener("open", () => {
            this.send(`PASS oauth:${token}`);
            this.send(`NICK ${user}`);
            this.send("CAP REQ :twitch.tv/commands twitch.tv/tags");
        });

        this.addEventListener("message", (event) => {
            let message = new Message(event.data);
            if (message._parsedMessage != null) {
                if (message.command === "PRIVMSG") {
                    this.port.postMessage(
                        {
                            type: "PRIVMSG",
                            message: message._parsedMessage
                        }
                    );
                }
                if (message.command === "PING") {
                    this.send(`PONG ${message.parameters}`);
                    console.debug("PING PONG");
                }
            }
        })
    }

    join() {
        this.send(`JOIN #${this._broadcaster}`);
        
    }

    part() {
        this.send(`PART #${this._broadcaster}`);
    }

    set broadcaster(value) {
        this._broadcaster = value;
        this.join();
    }

    get broadcaster() {
        return this._broadcaster;
    }
}