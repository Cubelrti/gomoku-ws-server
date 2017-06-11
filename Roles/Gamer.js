class Gamer {
    constructor(wsInstance, id) {
        this.wsInstance = wsInstance;
        this.id = id;
        this.rank = 0;
    }
    send(message) {
        try {
            this.wsInstance.send(message);
        } catch (error) {
            return -1;
        }
    }
}

module.exports = Gamer;