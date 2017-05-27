module.exports = Game;

const BOARD_STATE = {
    UNPLACED: 0,
    A: 1,
    B: 2
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
        console.log(`id:${id} x:${x} y:${y}`);
    }
    this.revert = (id, x, y) => {
        
    }
    this.broadcast = (message) => {
        this.playerA.wsInstance.send(message);
        this.playerB.wsInstance.send(message);
    }

    this.judge = (id, x, y) => {
        var countx = 0, county = 0, countcrx = 0, countcry = 0;
        try {
            for (let i = -4; i <= 4; i++){
                //judge out of range
                if (x + i < 0) {
                    continue;
                }
                if (this.board[y][x + i] == id)
                    countx++;
                if (countx != 0 && this.board[y][x] != id) break;
            }
            for (let i = -4; i <= 4; i++) {
                if (y + i < 0) {
                    continue;
                }
                if (this.board[y + i][x] == id)
                    county++;
                if (county != 0 && this.board[y + i][x] != id) break;
            }
            for (let i = -4; i <= 4; i++) {
                if (x + i < 0 || y + i < 0) {
                    continue;
                }
                if (this.board[y + i][x + i] == id)
                    countcrx++;
                if (countcrx != 0 && this.board[y + i][x + i] != id) break;
            }
            for (let i = -4; i <= 4; i++) {
                if (x - i < 0 || y + i < 0) {
                    continue;
                }
                if (this.board[y + i][x - i] == id)
                    countcry++;
                if (countcry != 0 && this.board[y + i][x - i] != id) break;
            }            
        } catch (error) {
            
        }
        finally {
            if (countx >= 5 || county >= 5 || countcrx >= 5 || countcry >= 5) return id;
            else return -1;
        }
    }
    this.playerA.wsInstance.game = this;
    this.playerB.wsInstance.game = this;
    return this;
}
