const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 80
});

const Game = require('./Game/game')

let gameInstance;

let gamer1, gamer2;

function addGamer(id) {
    if (gamer1 && gamer2) console.log("invalid game operation");
    if (gamer1) {
        gamer2 = id;
        return 2;
    }
    else {
        gamer1 = id;
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
    PLACED_A_GAME: "PLACED_A_GAME",
    GAME_ENDED: "GAME_ENDED",
};

function messageHandler(message,ws) {
    if (message == CLIENT_MESSAGE.HANDSHAKE) {
        let thisId = Date.now();
        ws.send("USERTYPE_" + addGamer(thisId));
        console.log(canStart());
        if (gamer1 && gamer2) {
            gameInstance = Game(gamer1, gamer2, ws);
            
        }
    }
    if (message.includes("_c_")) {
        wss.broadcast(message);
        let messageArr = message.split("_")
        gameInstance.place(parseInt(messageArr[1]), parseInt(messageArr[3]), parseInt(messageArr[4]));
        let result = gameInstance.judge(parseInt(messageArr[1]), parseInt(messageArr[3]), parseInt(messageArr[4]));
        if (result != -1) {
            setTimeout(function() {
                wss.broadcast("WINNER_" + result);
            }, 1000);
            console.log("RESETING GAME BOARD");
            gamer1 = "";
            gamer2 = "";
        }
    }
    if (message == CLIENT_MESSAGE.DISCONNENT) {
        ws.send(SERVER_MESSAGE.DISCONNENT);
        gamer1 = "";
        gamer2 = "";
    }
}


wss.broadcast = function broadcast(data) {
    wss
        .clients
        .forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
};

wss.on('connection', function connection(ws) {
    const ip = ws.upgradeReq.connection.remoteAddress;
    ws.on('message', function incoming(message) {
        console.log('received: %s %s', message, ip);
        messageHandler(message, ws);
    });
});