import {WebSocket, WebSocketServer} from "ws";
import { nanoid } from "nanoid";

const PORT_NUMBER = 8080;
type Message = {
    type: "welcome";
    data: {
        selfId: string;
        otherIds: string[];
    }
} | {
    type: "new-pal" | "bye-pal";
    data: {
        id: string;
    }
};

type ClientMessage = {
    type: string;
    destinationId: string;
}

const wsServer = new WebSocketServer({ port : PORT_NUMBER });
const clientIdConnMap = new Map();

wsServer.on("listening", () => {
    console.log(`Server listening on ${PORT_NUMBER}`);
});

wsServer.on("connection", (wsConnection: WebSocket) => {
    console.log("New client connection");
    handleNewConnection(wsConnection);

    wsConnection.on("message",  (message: string) => {
        console.log(`Message received from client ${message}`);
        try {
            const messageData = JSON.parse(message);
            if (isClientMessage(messageData)) {
            handleClientMessage(messageData);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error while handling client message Error : ${error.message}`);
            }
        }
    });

    wsConnection.on("error", console.error);
});

wsServer.on("close", (clientId: string) => {
    console.log(`Request to close connection from ${clientId}`);
    try {
        console.log(`Client ${clientId} disconnected`);
        handleCloseConnection(clientId);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while disconnecting client ${clientId} Error : ${error.message}`);
        }
    }
});

function handleNewConnection(connection: WebSocket) {
    let clientId = nanoid();
    clientIdConnMap.set(clientId, connection);
    console.log(`Assigning client ID ${clientId}`);
    sendWelcomeMessage(clientId);
    broadCastToPeers(clientId, "new-pal");
}

function handleCloseConnection(clientId: string) {
    clientIdConnMap.delete(clientId);
    broadCastToPeers(clientId, "bye-pal");
}

function sendWelcomeMessage(selfId: string) {
    sendToClient(selfId, {
        type: "welcome",
        data: {
            selfId : selfId,
            otherIds: Array.from(clientIdConnMap.keys())
                .filter((id) => id !== selfId)
        }
    })
}

function broadCastToPeers(except: string, type: "new-pal" | "bye-pal") {
    Array.from(clientIdConnMap.keys())
        .filter((key) => key !== except)
        .forEach((key) =>
            sendToClient(key, {
                type : type,
                data : {
                    id: except
                }
            }));
}

function sendToClient(clientId: string, data: Message | ClientMessage) {
    const connection = clientIdConnMap.get(clientId);
    if (connection) {
        const message = JSON.stringify(data);
        console.log(`sending to client ${clientId} message ${message}`);
        connection.send(message);
    } else {
        console.log(`Client ID ${clientId} connection not found`);
    }
}

function handleClientMessage(clientMessage: ClientMessage) {
    const destinationId = clientMessage.destinationId;
    sendToClient(destinationId, clientMessage);
}

function isClientMessage(message: any): message is ClientMessage {
    return (message as ClientMessage).destinationId !== undefined;
}
