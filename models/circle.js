class Circle {
    constructor(user, circleUser, type, status = 0) {
        this.user = user;
        this.circleUser = circleUser;
        this.type = type;
        this.status = status;
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    setType(type) {
        this.type = type;
    }
    getType() {
        return this.type;
    }
    getObject() {
        return Object.assign({}, this);
    }
}

module.exports = Circle;