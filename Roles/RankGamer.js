class RankGamer {
    constructor(wsInstance, id, ranking) {
        this.wsInstance = wsInstance;
        this.id = id;
        if (ranking[id]) {
            this.rank = ranking[id];
        } else {
            this.rank = 0
            ranking[id] = 0;
        }
    }
    send(message) {
        try {
            this.wsInstance.send(message);
        } catch (error) {
            return -1;
        }
    }
}

module.exports = RankGamer;