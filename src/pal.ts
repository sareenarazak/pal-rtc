import {Message} from "./types.js";

type ClientConfig = {
    clientId: string | undefined;
    peerClientIds: Set<string>;
}

const clientConfig: ClientConfig = {
    clientId : undefined,
    peerClientIds: new Set<string>()
};

let ws: WebSocket;

document.addEventListener("DOMContentLoaded", () => {
    const connectBtn = document.querySelector("#ws-connect") as HTMLButtonElement;
    const disconnectBtn = document.querySelector("#ws-disconnect") as HTMLButtonElement;

    connectBtn.addEventListener("click", () => {
        connect.call(connectBtn, disconnectBtn);
    });

    disconnectBtn.addEventListener("click", () => {
        disconnect.call(disconnectBtn, connectBtn)
    });
});

function connect(this: HTMLButtonElement, disconnBtn: HTMLButtonElement) {
    ws = new WebSocket("ws://localhost:8080");

    ws.addEventListener("open", () => {
        console.log("Connected to web socket server");
        this.disabled = true;
        disconnBtn.disabled = false;

        ws.addEventListener("message", (event: MessageEvent) => {
            try {
                console.log(`Received message from server ${event.data}`);
                const message: Message = JSON.parse(event.data);
                handleMessage(message)
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error while handling message from server Error : ${error.message}`);
                }
            }

        });
    });

    ws.addEventListener("close", () => {
        console.log("Disconnected from web socket server");
    });
}

function disconnect(this: HTMLButtonElement, connBtn: HTMLButtonElement) {
    ws.close();
    this.disabled = true;
    connBtn.disabled = false;
}

function handleMessage(message : Message) {
    const { type, data } = message;
    switch (type) {
        case "welcome":
            clientConfig.clientId = data.selfId;
            data.otherIds.forEach(id => clientConfig.peerClientIds.add(id));
            break;

        case "new-pal":
            clientConfig.peerClientIds.add(data.id);
            console.log(`Added peer id ${data.id}`);
            break;

        case "bye-pal":
            clientConfig.peerClientIds.delete(data.id);
            console.log(`Removed peer id ${data.id}`);
            break;

        default:
            throw new Error(`Unsupported message type ${type}`);
    }

}
