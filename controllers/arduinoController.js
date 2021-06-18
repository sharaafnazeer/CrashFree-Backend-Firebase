'use strict';
const db = require('../db');
const UserTracking = require('../models/userTracking');

const addValues = async (req, res, next) => {
    
    try {

        const vehicles = await db.collection('vehicles').where("user", '==', req.body.userId).where("status", '==', 1).get();
        //const actualVehicles = vehicles.data();

        if (vehicles.empty) {
            return jsonResponse(res, 400, errorRes('No vehcile is on driving state now'));
        }

        let accidentSettings = await db.collection('settings').doc('accident').get();
        accidentSettings = accidentSettings.data();
        let userTracking = await db.collection('usertracking').doc(req.body.userId).get();
        
        let newUserTracking = new UserTracking(req.body.userId, req.body.vehicleId,
            req.body.lastLocation, req.body.vibrationValue, req.body.rollValueInitial, req.body.pitchValueInitial, req.body.rollValue, req.body.pitchValue);

        let object = newUserTracking.getObject();
        
        if (!userTracking.exists) {
            await db.collection('usertracking').doc(req.body.userId).set(object);
        }else {
            await db.collection('usertracking').doc(req.body.userId).update(object);
        }

        if (req.body.vibrationValue > 0) {

            userTracking = await db.collection('usertracking').doc(req.body.userId).get();

            const actualTracking = userTracking.data();
            let rollTrue = false;
            let pitchTrue = false;

            if (actualTracking.rollValueInitial < 0) {

                if(actualTracking.rollValue < 0) {

                    console.log("roll came 1");
                    console.log (actualTracking.rollValue)
                    console.log (actualTracking.rollValueInitial)
                    console.log (accidentSettings.accelerometerThreshold)
                    console.log (actualTracking.rollValueInitial - accidentSettings.accelerometerThreshold)
                    

                    if(actualTracking.rollValue < (actualTracking.rollValueInitial - accidentSettings.accelerometerThreshold)) {
                        rollTrue = true;
                    }

                } else {


                    console.log("roll came 2");
                    console.log (actualTracking.rollValue)
                    console.log (actualTracking.rollValueInitial)
                    console.log (accidentSettings.accelerometerThreshold)
                    console.log (actualTracking.rollValueInitial + accidentSettings.accelerometerThreshold)

                    if(actualTracking.rollValue > (actualTracking.rollValueInitial + accidentSettings.accelerometerThreshold)) {
                        rollTrue = true;
                    }

                }
                console.log(rollTrue)
            }


            if (actualTracking.pitchValueInitial < 0) {

                if(actualTracking.pitchValue < 0) {

                    console.log("pitch came 1");
                    console.log (actualTracking.pitchValue)
                    console.log (actualTracking.pitchValueInitial)
                    console.log (accidentSettings.accelerometerThreshold)
                    console.log (actualTracking.pitchValueInitial - accidentSettings.accelerometerThreshold)
                    

                    if(actualTracking.pitchValue < (actualTracking.pitchValueInitial - accidentSettings.accelerometerThreshold)) {
                        pitchTrue = true;
                    }

                } else {


                    console.log("pitch came 2");
                    console.log (actualTracking.pitchValue)
                    console.log (actualTracking.pitchValueInitial)
                    console.log (accidentSettings.accelerometerThreshold)
                    console.log (actualTracking.pitchValueInitial + accidentSettings.accelerometerThreshold)

                    if(actualTracking.pitchValue > (actualTracking.pitchValueInitial + accidentSettings.accelerometerThreshold)) {
                        pitchTrue = true;
                    }

                }
                console.log(pitchTrue)
            }

            if (rollTrue || pitchTrue) {
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