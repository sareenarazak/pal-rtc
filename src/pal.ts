import {ClientMessage, Message} from "./types.js";

type ClientConfig = {
    clientId: string | undefined;
    peerClientIds: Set<string>;
}

const clientConfig: ClientConfig = {
    clientId : undefined,
    peerClientIds: new Set<string>()
};

type PeerConnection = {
    peerConnection: RTCPeerConnection | undefined;
    destinationId: string | undefined;
    dataChannel: RTCDataChannel | undefined;
};

const peerConn: PeerConnection = {
    peerConnection: undefined,
    destinationId: undefined,
    dataChannel: undefined
};

const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }]};

let ws: WebSocket;

document.addEventListener("DOMContentLoaded", () => {
    const connectBtn = document.querySelector("#ws-connect") as HTMLButtonElement;
    const disconnectBtn = document.querySelector("#ws-disconnect") as HTMLButtonElement;
    const textArea = document.querySelector("#message-pal") as HTMLTextAreaElement;
    const sendBtn = document.querySelector("#send-message") as HTMLButtonElement;
    const receiveMsg = document.querySelector("#received-msg") as HTMLTextAreaElement;

    connectBtn.addEventListener("click", () => {
        connect.call(connectBtn, disconnectBtn);
    });

    disconnectBtn.addEventListener("click", () => {
        disconnect.call(disconnectBtn, connectBtn);
    });

    // TODO : change this to some event that only triggers once
    textArea.addEventListener("input",  () => {
        if (sendBtn.disabled) {
            sendBtn.disabled = false
        }
    });

    sendBtn.addEventListener("click",  () => {
        sendToPal.call(sendBtn, textArea.value);
    });

});

function connect(this: HTMLButtonElement, disconnBtn: HTMLButtonElement) {
    ws = new WebSocket("ws://localhost:8080");

    ws.addEventListener("open", () => {
        console.log("Connected to web socket server");
        this.disabled = true;
        disconnBtn.disabled = false;

        ws.addEventListener("message", async (event: MessageEvent) => {
            try {
                console.log(`Received message from server ${event.data}`);
                const message: Message = JSON.parse(event.data);
                await handleMessage(message);
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
};

function disconnect(this: HTMLButtonElement, connBtn: HTMLButtonElement) {
    ws.close();
    this.disabled = true;
    connBtn.disabled = false;
}

async function handleMessage(message : Message) {
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

        case "offer" :
            console.log(`Got and offer from ${data.clientId} , offer is : ${data.description}`)
            try {
                if(!peerConn.peerConnection) {
                   createPeerConnection();

                }
                peerConn.destinationId = data.clientId;
                const peerConnection = peerConn.peerConnection as RTCPeerConnection;
                await setRemoteDescription(peerConnection, data.description);
                await createAndSendAnswer(peerConnection, data.clientId);

            } catch (error) {
                console.log(`Error handling incoming offer: ${error}`);
            }
            break;

        case "answer":
            try {
                console.log(`Got and answer from ${data.destinationId} , offer is : ${JSON.stringify(data.description)}`);
                const peerConnection = peerConn.peerConnection as RTCPeerConnection;
                peerConn.destinationId = data.clientId;
                await setRemoteDescription(peerConnection, data.description);
            } catch (error) {
                console.log(`Error handling incoming answer: ${error}`);
            }
            break;

        case "icecandidate":
            console.log(`Received ice candidate ${JSON.stringify(data.candidate)}`);
            const peerConnection = peerConn.peerConnection as RTCPeerConnection;
            await peerConnection.addIceCandidate(data.candidate);
            break;

        default:
            throw new Error(`Unsupported message type ${type}`);
    }
}

function sendToPal(this:HTMLButtonElement, message: string) {
    if (clientConfig.peerClientIds.size === 0) {
        console.log("No peers yet");
        return;
    }

    createPeerConnection();
    createDataChannel("message-pal", message);
}

function createPeerConnection() {
    if (!peerConn.peerConnection) {
        const peerConnection = new RTCPeerConnection(config)
        peerConnection.addEventListener("negotiationneeded",  createAndSendOffer);
        peerConnection.addEventListener("icecandidate", sendIceCandidateToPeer);

        // Add receive channel request handler
        // Bug fix for not getting data on receiver side :  moved from createDataChannel() function
        peerConnection.addEventListener("datachannel", receiveChannelCallback);

        peerConn.peerConnection = peerConnection;
    }}

function createAndSendOffer() {
        console.log("Negotiation needed event ");
        console.log("Destination client id " , clientConfig.peerClientIds.keys().next());
        createOffer()
            .then(() => {
                const peerConnection = peerConn.peerConnection as RTCPeerConnection;
                if (peerConnection.localDescription && clientConfig.clientId) {
                    sendToSignalingServer({
                        type: "offer",
                        data: {
                            clientId: clientConfig.clientId,
                            destinationId: clientConfig.peerClientIds.keys().next().value, // Bad :/
                            description: peerConnection.localDescription
                        }
                    });
                }
            })
            .catch(error => {
                console.log(`Error creating offer: ${error}`);
            });
}

async function createAndSendAnswer(peerConn: RTCPeerConnection, destinationId:string) {
    const answer = await peerConn.createAnswer();
    await peerConn.setLocalDescription(answer);
    if (peerConn.localDescription && clientConfig.clientId) {
        sendToSignalingServer({
            type: "answer",
            data: {
                clientId: clientConfig.clientId,
                destinationId: destinationId,
                description: peerConn.localDescription
            }
        });
    }
}
async function createOffer() {
    console.log("Creating Offer");
    try {
        const peerConnection = peerConn.peerConnection as RTCPeerConnection;
        const offer = await peerConnection.createOffer();
        console.log("offer created ");
        console.log(JSON.stringify(offer));
        console.log("Setting local descriptor");
        await peerConnection.setLocalDescription(offer);
    } catch (error) {
        console.log(`Error while sending local description to the websocket server ${error}`);
    }
}

function createDataChannel(label:string, message:string) {
    console.log("Creating data channel on sender side");
    const peerConnection = peerConn.peerConnection as RTCPeerConnection;

    // Triggers negotiationneeded event
    const dataChannel = peerConnection.createDataChannel(label);
    peerConn.dataChannel = dataChannel;

    // Sender channel listeners
    dataChannel.addEventListener("open", () => {
        handleSendChannelStatusChange.call(dataChannel, message);
    });

    dataChannel.addEventListener("close", () => {
        handleSendChannelStatusChange.call(dataChannel, "");
    });
}

async function setRemoteDescription(peerConn: RTCPeerConnection, description: RTCSessionDescription) {
    await peerConn.setRemoteDescription(description);
}

async function sendIceCandidateToPeer(event: RTCPeerConnectionIceEvent) {
    console.log("Ice candidate event received");
    const destinationId = peerConn.destinationId;
    const iceCandidate = event.candidate;
    if (iceCandidate && destinationId) {
        sendToSignalingServer({
            type: "icecandidate",
            data: {
                destinationId: destinationId,
                candidate: iceCandidate
            }
        });
    }
}

function sendToSignalingServer(message: ClientMessage) {
    console.log(`Message sent to signaling server  ${JSON.stringify(message)}`);
    ws.send(JSON.stringify(message));
}

function handleSendChannelStatusChange(this: RTCDataChannel, message: string) {
    if (this.readyState === "open") {
        console.log("Message send channel is open");
        console.log(`Sending message ${message}`);
        this.send(message);
    } else if (this.readyState === "closed") {
        console.log("Message channel is closed");
    }
}

function receiveChannelCallback(this: RTCPeerConnection, event: RTCDataChannelEvent) {
    const receiveChannel = event.channel;
    peerConn.dataChannel  = receiveChannel;

    receiveChannel.addEventListener("message",  handleReceiveMessage);
    receiveChannel.addEventListener("open",  handleReceiveChannelStatusChange);
    receiveChannel.addEventListener("close",  handleReceiveChannelStatusChange);
}

function handleReceiveMessage(this:RTCDataChannel, event: MessageEvent) {
    const receiveMsg = document.querySelector("#received-msg") as HTMLTextAreaElement;
    receiveMsg.innerText = `Message ${event.data}`
    console.log(`Received event from peer ${event.data}`);
}

function handleReceiveChannelStatusChange() {
    if (peerConn.dataChannel) {
        console.log(`Adding receive channel on peer connection`);
        const receiveChannel = peerConn.dataChannel;
        console.log(
            `Receive channel's status has changed to ${receiveChannel.readyState}`,
        );
    }
}
