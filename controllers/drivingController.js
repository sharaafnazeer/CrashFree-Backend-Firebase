'use strict';
const db = require('../db');

const Vehicle = require('../models/vehicle');
const User = require('../models/user');

const startStopDriving = async (req, res, next) => {
    try {
        const user = await db.collection('users').doc(req.userId);

        const availableUser = await user.get();
        if (!availableUser.exists) {
            return jsonResponse(res, 400, badRes("Account not available"))
        }
        const updateData = {
            ...availableUser.data(),
            driving : req.body.driving,
            lastLocation : {
                lat : req.body.lastLocation.lat,
                long: req.body.lastLocation.long
            }
        }

        await user.update(updateData);


        const vehicles = await db.collection('vehicles').where("user", '==', req.userId).get();
        const otherVehicles = [];

        vehicles.forEach((doc) => {

            if (doc.id !== req.body.vehicleId) {
                otherVehicles.push({
                    ...doc.data(),
                    id : doc.id,
                })
            }                
        });

        otherVehicles.forEach(async (other) => {
            const singleVehicle = await db.collection('vehicles').doc(other.id);
            const availableSingleVehicle = await singleVehicle.get();
            singleVehicle.update({
                ...availableSingleVehicle.data(),
                status: 0,
            });
        });

        const currentVehicle = await db.collection('vehicles').doc(req.body.vehicleId);
        const currentAvailableVehicle = await currentVehicle.get();
        if (!currentAvailableVehicle.exists) {
            return jsonResponse(res, 400, badRes("Vehicle not found"))
        }

        const updatableVehicle = {
            ...currentAvailableVehicle.data(),
        }

        if (req.body.driving) {
            updatableVehicle.status = 1;
        } else {
            updatableVehicle.status = 0;
        }

        currentVehicle.update(updatableVehicle);
        if (req.body.driving){
            return jsonResponse(res, 200, successRes('You have started driving successfully'))
        }                
        else {
            return jsonResponse(res, 200, successRes('You have stoped driving successfully'))
        }
    } catch(error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const updateDriverLocation = async (req, res, next) => {

    const user = await db.collection('users').doc(req.userId);

        const availableUser = await user.get();
        if (!availableUser.exists) {
            return jsonResponse(res, 400, badRes("Account not available"))
        }
        const updateData = {
            ...availableUser.data(),
            lastLocation : {
                lat : req.body.lastLocation.lat,
                long: req.body.lastLocation.long
            }
        }

        await user.update(updateData);
        return jsonResponse(res, 200, successRes(''));
}
const updateDriverOkay = async (req, res, next) => {
    
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

const alertDrowsiness = async (req, res, next) => {

    try {
        const userTracking = await db.collection('usertracking').doc(req.body.userId).get();        
        const updateData = {
            ...userTracking.data(),
            isDrowsy: req.body.status
        }
        
        if (!userTracking.exists) {
            await db.collection('usertracking').doc(req.body.userId).set(updateData);
        }else {
            await db.collection('usertracking').doc(req.body.userId).update(updateData);
        }

        return jsonResponse(res, 200, successRes(''));
    } catch (error) {
        console.log(error)
        return jsonResponse(res, 500, errorRes(error))
    }
}

const sendAlertToUser = (req, res, next) => {
    const registrationToken = 'asdfasdfas' // Should get from db. Unique for every mobile        
        const payload = {
            data: {
                message: 'Hello!!!'
            }
        }
        Message.send(registrationToken, payload)
        return jsonResponse(res, 200, successRes(''))
}

module.exports = {
    startStopDriving,
    updateDriverLocation,
    updateDriverOkay,
    alertDrowsiness,
    sendAlertToUser,
}