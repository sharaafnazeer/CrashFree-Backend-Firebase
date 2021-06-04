'use strict';
const db = require('../db');
const UserTracking = require('../models/userTracking');

const addValues = async (req, res, next) => {
    try {

        let accidentSettings = await db.collection('settings').doc('accident').get();
        accidentSettings = accidentSettings.data();
        const userTracking = await db.collection('usertracking').doc(req.body.userId).get();
        
        let newUserTracking = new UserTracking(req.body.userId, req.body.vehicleId,
            req.body.lastLocation, req.body.vibrationValue, req.body.accelerometerValue);

        let object = newUserTracking.getObject();
        
        if (!userTracking.exists) {
            await db.collection('usertracking').doc(req.body.userId).set(object);
        }else {
            await db.collection('usertracking').doc(req.body.userId).update(object);
        }

        if (req.body.vibrationValue > 0) {
            if (req.body.accelerometerValue > accidentSettings.accelerometerThreshold) {
                newUserTracking.setSuspecious(true);
                object = newUserTracking.getObject();
                await db.collection('usertracking').doc(req.body.userId).update(object);
            }
        }

        return jsonResponse(res, 200, successRes(''));
    } catch (error) {
        console.log(error)
        return jsonResponse(res, 500, errorRes(error))
    }
}

module.exports = {
    addValues,
}