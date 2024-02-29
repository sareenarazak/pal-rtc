export type ServerMessage = {
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
}

export type ClientMessage = {
    type: "offer" | "answer";
    data: {
        destinationId: string;
        clientId: string;
        description: RTCSessionDescription;
    }
} | {
    type: "icecandidate";
    data: {
        destinationId: string;
        candidate: RTCIceCandidate;
    }
}

export type Message = ServerMessage | ClientMessage;
