const Game = require('../Game/game'),
    Gamer = require("../Roles/Gamer"),
    RankGamer = require("../Roles/RankGamer"),
    CLIENT_MESSAGE = require("../Connections/ClientMessages"),
    SERVER_MESSAGE = require("../Connections/ServerMessages");

function messageHandler(message, ws, ServerState) {
    let {rankingGamer, ranking, gamer1, gamer2, matchingGamer} = ServerState;

    if (message.includes(CLIENT_MESSAGE.START_MATCH)) {
        let gamer = new Gamer(ws, "Matcher");
        matchingGamer.push(gamer);
        for (var i = matchingGamer.length - 1; i >= 0; i--) {
            try {
                matchingGamer[i]
                    .wsInstance    
                    .send(SERVER_MESSAGE.CHECK_ALIVE);
            } catch (ex) {
                //gamer terminated.
                matchingGamer.splice(i, 1);
            }
        }
        ws.send("SEARCHING_MATCH");
        if (matchingGamer.length >= 2) {
            let random = Math.random();
            let gamer1 = matchingGamer.pop();
            let gamer2 = matchingGamer.pop();
            if (random > 0.5) {
                let temp = gamer2;
                gamer2 = gamer1;
                gamer1 = temp;
            }
            let game = new Game(gamer1, gamer2);
            gamer1.gameInstance = game;
            gamer2.gameInstance = game;
            gamer1.userType = 1;
            gamer1
                .send("USERTYPE_1");
            gamer2.userType = 2;
            gamer2
                .send("USERTYPE_2");
            game.broadcast("GAME_START");
        }
    }
    if (message.includes(CLIENT_MESSAGE.RANK)) {
        //sample message: RANK_ID
        let messageArr = message.split("_");
        let gamerID = messageArr[1];
        let gamer = new RankGamer(ws, gamerID, ranking);
        rankingGamer.push(gamer);
        //check gamers are alive
        for (var i = rankingGamer.length - 1; i >= 0; i--) {
            try {
                rankingGamer[i]
                    .wsInstance
                    .send(SERVER_MESSAGE.CHECK_ALIVE);
            } catch (ex) {
                //gamer terminated.
                rankingGamer.splice(i, 1);
            }
        }
        ws.send("SEARCHING_MATCH");
        setTimeout(function () {
            if (rankingGamer.length >= 2) {
                rankingGamer.sort((a, b) => a.rank - b.rank);
                let random = Math.random();
                let gamer1 = rankingGamer.pop();
                let gamer2 = rankingGamer.pop();
                if (random > 0.5) {
                    let temp = gamer2;
                    gamer2 = gamer1;
                    gamer1 = temp;
                }
                let game = new Game(gamer1, gamer2);
                gamer1.gameInstance = game;
                gamer2.gameInstance = game;
                game.broadcast(gamer1.id + "_vs_" + gamer2.id)
                setTimeout(function () {
                    game.broadcast(gamer1.id + " rank:" + gamer1.rank)
                }, 1000);
                setTimeout(function () {
                    game.broadcast(gamer2.id + " rank:" + gamer2.rank)
                }, 2000);
                setTimeout(function () {
                    gamer1.userType = 1;
                    gamer1
                        .send("USERTYPE_1");
                    gamer2.userType = 2;
                    gamer2
                        .send("USERTYPE_2");
                    game.broadcast("GAME_START");
                }, 3000);
            }
        }, 5000);
    }
    if (message.includes(CLIENT_MESSAGE.GET_RANK)) {
        let outMessage = "RANKING_";
        var keys = [];
        for (var key in ranking) {
            if (ranking.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys
            .sort(function (a, b) {
                return ranking[b] - ranking[a];
            });
        for (var key of keys) {
                var element = ranking[key];
                outMessage += (element + "/" + key + "_");
        }
        ws.send(outMessage);
    }
    if (message.includes(CLIENT_MESSAGE.ACTION)) {
        //sample message: ACTION_1_c_7_9 header_id_control_x_y
        let gameInstance = ws.game;
        let messageArr = message.split("_");
        let gamerID = messageArr[5];
        gameInstance.broadcast(message);
        gameInstance.place(parseInt(messageArr[1]), parseInt(messageArr[3]), parseInt(messageArr[4]));
        let result = gameInstance.judge(parseInt(messageArr[1]), parseInt(messageArr[3]), parseInt(messageArr[4]));
        if (result != -1) {
            setTimeout(function () {
                gameInstance.broadcast("WINNER_" + result);
            }, 1000);
            console.log("game ended with user " + result + " win.");
            //determine if matchingGamer
            if (gameInstance.playerA.id == "Matcher") return;
            if (gameInstance.playerA.userType == result) {
                ranking[gameInstance.playerA.id] += 50;
                ranking[gameInstance.playerB.id] -= 30;
            } else {
                ranking[gameInstance.playerB.id] += 50;
                ranking[gameInstance.playerA.id] -= 30;
            }
            ranking["Aspire"] = 0;
        }
    }
    if (message.includes(CLIENT_MESSAGE.RESET_MATCH)) {
        ws
            .game
            .broadcast(SERVER_MESSAGE.GAME_ENDED);
        ws.game = undefined;
    }
}

module.exports = messageHandler;