### WebRTC Signaling Server with WebSocket pal-rtc

**Project in progress**

#### Next steps
* Add license
* Set up `eslint` and `prettier`
* Refactor the code using CR comments
* Write npm script to start the server
* Implement a nicer UX
* Test across computers - host the server and test
* Support connecting to specific peer
* Support connecting to a group chat

### Introduction

`pal-rtc` is toy implementation of WebRTC signaling server using WebSocket for real-time communication between clients. It's implemented in TypeScript.
The server facilitates peer-to-peer communication by managing client connections, exchanging session descriptions (offers/answers), and relaying ICE candidates.
This implementation assumes two clients connecting to the signaling server. Goal is to implement a mesh / p2p topology next.


### Project Structure
* Server (`server.ts`): Handles WebSocket connections, manages client sessions, and broadcasts messages to clients for signaling stage.
* Client (`pal.ts`): Represents a web client that connects to the signaling server using WebSocket, exchanges signaling messages to connect to a peer using webrtc data channel.
* Types (`types.ts`): Defines message types for communication between server and clients.

### Getting started
### Dependencies
* [Node.js](https://nodejs.org/en): Ensure Node.js is installed on your system
* Typescript -  To install globally `npm install -g typescript`
####  Setup
**Server**
* Install dependencies -  `npm install`
* Compile Typescript - `tsc signaling-server.ts`
* Run the server - `node signaling-server.js`
* The server will listen on `ws://localhost:8080`

**Client Interaction**
* Open `index.html` in a web browser.
* Click "Connect" to establish a WebSocket connection with the server.
* Open another tab of `index.html` and click connect
* Upon connection, the both clients receive a welcome message containing its ID and IDs of other connected clients.
* Use the text area to compose messages and click "Send" to send messages to connected peers.
* Click "Disconnect" to terminate the WebSocket connection.
