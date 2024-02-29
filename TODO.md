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
    ~~* Send `offer` to peer when user adds input to `textArea`~~
  ~~* Implement `answer` flow~~ 
  ~~* Send `icecandidate` and implement message handling~~
  ~~* Add event handling for send and receive channel events~~ 


### Current status --> Message sending only works intermittently 
```
Ice candidate event received pal.ts:228:12
Sending to client Q_7ZTbawS7oOcQ1Xsei4e pal.ts:229:12
Ice candidate event received pal.ts:228:12
Sending to client Q_7ZTbawS7oOcQ1Xsei4e pal.ts:229:12
Ice candidate event received pal.ts:228:12
Sending to client Q_7ZTbawS7oOcQ1Xsei4e pal.ts:229:12
Ice candidate event received pal.ts:228:12
Sending to client Q_7ZTbawS7oOcQ1Xsei4e pal.ts:229:12
Message send channel is open pal.ts:250:16
Sending hello message pal.ts:251:16
Received event from peer HELLO MESSAGE
```
