export type Message = {
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
