'use strict';

const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 80
});

const Game = require('./Game/game'),
      Gamer = require("./Roles/Gamer"),
      RankGamer = require("./Roles/RankGamer"),
      CLIENT_MESSAGE = require("./Connections/ClientMessages"),
      SERVER_MESSAGE = require("./Connections/ServerMessages"),
      messageHandler = require('./Handlers/MessageHandlers')


let rankingGamer = [];
let matchingGamer = [];
let ranking = {};

let ServerState = {
    matchingGamer,
    rankingGamer,
    ranking,
}


wss.on('connection', function connection(ws) {
    const ip = ws.upgradeReq.connection.remoteAddress;
    ws.on('message', function incoming(message) {
        console.log('messagelog: %s %s', message, ip);
        messageHandler(message, ws, ServerState);
    });
});