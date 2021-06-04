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

const updateDriverOkay = async (req, res, next) => {
    req.userId = '1GGW02DCJJsPH3RRgjKF'
    try {
        const userTracking = await db.collection('usertracking').doc(req.userId).get();

        let accidentOccured = false;
        let suspecious = false;
        if (req.body.status === 1) {
            accidentOccured = false;
            suspecious = false;
        } else {
            accidentOccured = true;
            suspecious = true;
        }
        
        const updateData = {
            ...userTracking.data(),
            accidentOccured : accidentOccured,
            suspecious : suspecious,
        }
        
        if (!userTracking.exists) {
            await db.collection('usertracking').doc(req.userId).set(updateData);
        }else {
            await db.collection('usertracking').doc(req.userId).update(updateData);
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
    updateDriverOkay
}