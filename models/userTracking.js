'use strict';

const moment = require("moment");

class UserTracking {
    constructor(userId, vehicleId, lastLocation, vibrationValue, accelerometerValue, time = moment(), 
                suspecious = false, accidentOccured = false, isDrowsy = false) {
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.lastLocation = lastLocation;
        this.vibrationValue = vibrationValue;
        this.accelerometerValue = accelerometerValue;
        this.time = time;
        this.accidentOccured = accidentOccured;
        this.suspecious = suspecious;
        this.isDrowsy = isDrowsy;
    }

    getObject() {
        return Object.assign({}, this);
    }

    setAccidentOccured (accidentOccured) {
        this.accidentOccured = accidentOccured;
    }

    setSuspecious (suspecious) {
        this.suspecious = suspecious;
    }
}

module.exports = UserTracking;