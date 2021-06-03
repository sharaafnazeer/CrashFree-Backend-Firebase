class UserToken {
    constructor(userId, token, type, expireAt) {
        this.userId = userId;
        this.token = token;
        this.type = type;
        this.expireAt = expireAt;
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    getObject() {
        return Object.assign({}, this);
    }
}

module.exports = UserToken;