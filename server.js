'use strict';

const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 80
});

const Game = require('./Game/game')

class Gamer{
    constructor(wsInstance, id, usertype) {
        this.wsInstance = wsInstance;
        this.usertype = usertype;
        this.id = id;
    }
}

let gamer1, gamer2;

function addGamer(id, ws) {
    if (gamer1) {
        gamer2 = new Gamer(ws, id, 2);
        return 2;
    }
    else {
        gamer1 = new Gamer(ws, id, 1);
        return 1;
    }
}

function canStart() {
    if (gamer1 && gamer2) return "We can start now.";
    else return "No we can't start yet.";
}

const CLIENT_MESSAGE = {
    HANDSHAKE: "HEARTBEAT_PACKAGE_0_INIT",  
    DISCONNENT: "HEARTBEAT_PACKAGE_3_DISCONNECT",
}

const SERVER_MESSAGE = {
    HANDSHAKE: "HEARTBEAT_PACKAGE_1_OK",
    AUTHENTICATE: "HEARTBEAT_PACKAGE_2_AUTHENTICATE_REQUIRED",
    DISCONNENT: "HEARTBEAT_PACKAGE_3_DISCONNECTING",
    CHECK_ALIVE: "HEARTBEAT_PING",
    PLACED_A_GAME: "PLACED_A_GAME",
    GAME_ENDED: "GAME_ENDED",
};

function messageHandler(message,ws) {
    if (message == CLIENT_MESSAGE.HANDSHAKE) {
        let thisId = Date.now();
        //improve stability if one terminated websocket.
        if (gamer1) {
            //judge if disconnected.
            try {
                gamer1.wsInstance.send(SERVER_MESSAGE.CHECK_ALIVE);
            }
            catch (ex){
                //gamer1 terminated.
                gamer1 = undefined;
            }
        }

        ws.send("USERTYPE_" + addGamer(thisId, ws));
        if (gamer1 && gamer2) {
            let game = new Game(gamer1, gamer2)
            gamer1.gameInstance = game;
            gamer2.gameInstance = game;
            game.broadcast("GAME_START");
            gamer1 = undefined;
            gamer2 = undefined;
        }
    }
    if (message.includes("_c_")) {
        let gameInstance = ws.game;
        let messageArr = message.split("_")
        let gamerID = messageArr[5];
        gameInstance.broadcast(message);
        gameInstance.place(parseInt(messageArr[1]), parseInt(messageArr[3]), parseInt(messageArr[4]));
        let result = gameInstance.judge(parseInt(messageArr[1]), parseInt(messageArr[3]), parseInt(messageArr[4]));
        if (result != -1) {
            setTimeout(function() {
                gameInstance.broadcast("WINNER_" + result);
            }, 1000);
            console.log("game ended with "+ result + "win.");
        }
    }
    if (message == CLIENT_MESSAGE.DISCONNENT) {
        ws.game.broadcast(SERVER_MESSAGE.GAME_ENDED);
        ws.game = undefined;
    }
}

wss.on('connection', function connection(ws) {
    const ip = ws.upgradeReq.connection.remoteAddress;
    ws.on('message', function incoming(message) {
        console.log('received: %s %s', message, ip);
        messageHandler(message, ws);
    });
});