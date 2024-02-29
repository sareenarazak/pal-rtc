### Config
  * set up eslint and prettier
  * checkout ts-node
  * ts-watch set up 

  * ~~Set up directory - check ts convention~~ 
  * ~~Change package name~~
  * ~~Create a new git repo~~
  * ~~Commit / push~~

### Signaling server
  * ~~Commit the server code~~
  * Write test for the server code

### Client
  * ~~Implement connect and disconnect handler to websocket server~~
    * ~~Add message handling for `welcome` , `new-pal` and `bye-pal` messages~~
    *  Do I do function.call when passing arguments for event handling 
    * Check how best to declare the clientconfig type  -->  Remove `as RTCPPeerConnection` code
    * Send `offer` to peer when user adds input to `textArea`
  * Implement `answer` flow 
  * Send `icecandidate` and implement message handling
  * Add event handling for send and receive channel events 
  * Write test cases --> unsure when or how to go about testing 
