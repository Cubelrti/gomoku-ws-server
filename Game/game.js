module.exports = Game;

const BOARD_STATE = {
    UNPLACED: 0,
    A: 1,
    B: 2
}

function isOutOfRange(where) {
    if (where < 0 || where >= 20)
        return true;
    return false;
}


function Game(playerA, playerB, ws) {
    this.playerA = playerA;
    this.playerB = playerB;
    this.board = [];
    for (var i = 0; i < 20; i++) {
        var line = [];
        for (var j = 0; j < 20; j++){
            line.push(BOARD_STATE.UNPLACED);
        }
        this.board.push(line);
    }

    this.place = (id, x, y) => {
        this.board[y][x] = id;
        console.log(`gameplay: id:${id} x:${x} y:${y}`);
    }
    this.revert = (id, x, y) => {
        
    }
    this.broadcast = (message) => {
        try {
            this
                .playerA
                .wsInstance
                .send(message);
            this
                .playerB
                .wsInstance
                .send(message);
        } catch (error) {
            return -1;
        }

    }

    this.judge = (id, x, y) => {
        var countx = 0, county = 0, countcrx = 0, countcry = 0;
        for (let i = -4; i <= 4; i++){
            let start = x + i;
            let count = 0;
            for (let j = 0; j <= 4; j++){
                if (isOutOfRange(start + j)) continue;
                if (this.board[y][start + j] == id) {
                    count++;
                    if (count >= 5) {
                        console.log(`gamejudge:from ${start} to ${start + j}`);
                        return id;
                    }
                }
                else continue;
            }
        }
        for (let i = -4; i <= 4; i++){
            let start = y + i;
            let count = 0;
            for (let j = 0; j <= 4; j++){
                if(isOutOfRange(start+j)) continue;
                if (this.board[start + j][x] == id) {
                    count++;
                    if (count >= 5) {
                        console.log(`gamejudge:from ${start} to ${start + j}`);
                        return id;
                    }                    
                }
                else continue;
            }
        }
        for (let i = -4; i <= 4; i++){
            let startx = x + i;
            let starty = y + i;
            let count = 0;
            for (let j = 0; j <= 4; j++){
                if(isOutOfRange(startx+j) || isOutOfRange(starty+j)) continue;
                if (this.board[starty + j][startx + j] == id) {
                    count++;
                    if (count >= 5) {
                        console.log(`gamejudge:from ${startx} to ${startx + j}`);
                        return id;
                    }                    
                }
                else continue;
            }
        }

        for (let i = -4; i <= 4; i++){
            let startx = x + i;
            let starty = y - i;
            let count = 0;
            for (let j = 0; j <= 4; j++){
                if(isOutOfRange(starty-j) || isOutOfRange(startx+j)) continue;                 
                if (this.board[starty - j][startx + j] == id) {
                    count++;
                    if (count >= 5) {
                        console.log(`gamejudge:from ${startx} to ${startx + j}`);
                        return id;
                    }                    
                }
                else continue;
            }
        }
        return -1;
        
    }
    this.playerA.wsInstance.game = this;
    this.playerB.wsInstance.game = this;
    return this;
}
