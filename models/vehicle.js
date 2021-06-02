class Vehicle {
    constructor(vehicleNo, brand, model, user, type = 'Car', status = 0) {
        this.vehicleNo = vehicleNo;
        this.brand = brand;
        this.model = model;
        this.type = type;
        this.user = user;
        this.status = status;
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

module.exports = Vehicle