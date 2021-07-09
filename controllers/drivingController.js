'use strict';
const db = require('../db');

const UserTracking = require('../models/userTracking');
var admin = require("firebase-admin");

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

        let userTracking = await db.collection('usertracking').doc(req.userId).get();
        
        let newUserTracking = new UserTracking(req.userId, req.body.vehicleId,
            {}, 0.0, 0.0, 0.0, 0.0, 0.0);

        let object = newUserTracking.getObject();
        
        if (!userTracking.exists) {
            await db.collection('usertracking').doc(req.userId).set(object);
        }else {
            await db.collection('usertracking').doc(req.userId).update(object);
        }
            
        if (req.body.driving){
            return jsonResponse(res, 200, successRes('You have started driving successfully'))
        }                
        else {
            return jsonResponse(res, 200, successRes('You have stoped driving successfully'))
        }
    } catch(error) {
        console.log(error)
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

        if(accidentOccured) {
            try {
                const userCircles = await db.collection('circles').where("status", '==', 1).get();
        
                const actualCircles = [];
                userCircles.forEach((doc) => {
                    if (doc.data().user === req.userId || doc.data().circleUser === req.userId) {
                        actualCircles.push({
                            ...doc.data(),
                            id: doc.id,
                        });
                    }
                });
                const circleResponse = await Promise.all(actualCircles.map(async (userCircleDoc) => {
        
                    try {
                    
                        let users = await db.collection('users').get();
                        const actualUsers = [];
                        users.forEach(async (doc) => {
                            if (doc.id === userCircleDoc.user || doc.id === userCircleDoc.circleUser) {
                                actualUsers.push({
                                    ...doc.data(),
                                    id: doc.id,
                                });
                            }                
                        })
                        
                        return actualUsers.map(user => {                    
                            return {
                                id: user.id,
                                firebaseToken: user.firebaseToken,
                                name: user.firstName + " " + user.lastName,
                                phone: user.phone,
                                type: userCircleDoc.type,
                                lastLocation: user.lastLocation
                            }
                        });
        
                    } catch (error) {
                        return jsonResponse(res, 500, errorRes(error))
                    }
        
                }));
        
                const responses = [];
                circleResponse.forEach(async (userDocs) => {
                    userDocs.forEach(async (user) => {
                        if ((user.id != req.userId) && user.firebaseToken) {
                            responses.push(user);
                        }                   
                    })
                });
        
                const finalResponses = await Promise.all(responses.map(async (res) => {
        
                    try {       
                        const vehicle = db.collection('vehicles').where("user", '==', req.userId).where("status", '==', 1);
                        const availableVehicle = await vehicle.get();                        
                        if (!availableVehicle.empty) {
                            const actualVehicle = availableVehicle.docs[0].data();
                            return {
                                ...res,
                                vehicle: actualVehicle.brand + " " + actualVehicle.model,
                                vehicleNo: actualVehicle.vehicleNo
                            };
                        } else {
                            return {
                                ...res
                            };
                        }
        
                    } catch (error) {
                        return jsonResponse(res, 500, errorRes(error))
                    }
                }));
        
                finalResponses.forEach(async (element) => {
                    console.log(element)
                    const fireResponse = await admin.messaging().sendToDevice(
                        [element.firebaseToken], // ['token_1', 'token_2', ...]
                        {
                            notification: {
                               title: "Accident Suspecious Warning!",
                               body: "We suspect that one of your family or friend is under danger. Please kindly check whether he/she is okay at the moment",
                            },
                            data: {
                                name: element.name,
                                phone: element.phone,
                                type: element.type,
                                vehicle: element.vehicle,
                                vehicleNo: element.vehicleNo,
                                lastLocationLat: element.lastLocation?.lat + "", 
                                lastLocationLong: element.lastLocation?.long + ""
                            }
                        },
                        {
                          // Required for background/quit data-only messages on iOS
                          contentAvailable: true,
                          // Required for background/quit data-only messages on Android
                          priority: "high",
                          timeToLive: 60*60*24
                        }
                      );
        
                    console.log(fireResponse);
                });
                return jsonResponse(res, 200, successRes(finalResponses));
            } catch (errror) {
                console.log(error)
                return jsonResponse(res, 500, errorRes(error))
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
            isDrowsy: req.body.status == 1 ? true: false
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

const sendAlertToUser = async (req, res, next) => {

    try {
        const userCircles = await db.collection('circles').where("status", '==', 1).get();

        const actualCircles = [];
        userCircles.forEach((doc) => {
            if (doc.data().user === req.userId || doc.data().circleUser === req.userId) {
                actualCircles.push({
                    ...doc.data(),
                    id: doc.id,
                });
            }
        });
        const circleResponse = await Promise.all(actualCircles.map(async (userCircleDoc) => {

            try {
            
                let users = await db.collection('users').get();
                const actualUsers = [];
                users.forEach(async (doc) => {
                    if (doc.id === userCircleDoc.user || doc.id === userCircleDoc.circleUser) {
                        actualUsers.push({
                            ...doc.data(),
                            id: doc.id,
                        });
                    }                
                })
                
                return actualUsers.map(user => {                    
                    return {
                        id: user.id,
                        firebaseToken: user.firebaseToken,
                        name: user.firstName + " " + user.lastName,
                        phone: user.phone,
                        type: userCircleDoc.type,
                        lastLocation: user.lastLocation
                    }
                });

            } catch (error) {
                return jsonResponse(res, 500, errorRes(error))
            }

        }));

        const responses = [];
        circleResponse.forEach(async (userDocs) => {
            userDocs.forEach(async (user) => {
                if ((user.id != req.userId) && user.firebaseToken) {
                    responses.push(user);
                }                   
            })
        });

        const finalResponses = await Promise.all(responses.map(async (res) => {

            try {            
                const vehicle = db.collection('vehicles').where("user", '==', res.id).where("status", '==', 1);
                const availableVehicle = await vehicle.get();                        
                if (!availableVehicle.empty) {
                    const actualVehicle = availableVehicle.docs[0].data();
                    return {
                        ...res,
                        vehicle: actualVehicle.brand + " " + actualVehicle.model,
                        vehicleNo: actualVehicle.vehicleNo
                    };
                } else {
                    return {
                        ...res
                    };
                }

            } catch (error) {
                return jsonResponse(res, 500, errorRes(error))
            }
        }));

        finalResponses.forEach(async (element) => {
            const fireResponse = await admin.messaging().sendToDevice(
                [element.firebaseToken], // ['token_1', 'token_2', ...]
                {
                    notification: {
                       title: "Accident Suspecious Warning!",
                       body: "We suspect that one of your family or friend is under danger. Please kindly check whether he/she is okay at the moment",
                    },
                    data: {
                        name: element.name,
                        phone: element.phone,
                        type: element.type,
                        vehicle: element.vehicle,
                        vehicleNo: element.vehicleNo,
                        lastLocationLat: element.lastLocation?.lat + "", 
                        lastLocationLong: element.lastLocation?.long + ""
                    }
                },
                {
                  // Required for background/quit data-only messages on iOS
                  contentAvailable: true,
                  // Required for background/quit data-only messages on Android
                  priority: "high",
                  timeToLive: 60*60*24
                }
              );

            console.log(fireResponse);
        });
        return jsonResponse(res, 200, successRes(finalResponses));
    } catch (errror) {
        console.log(error)
        return jsonResponse(res, 500, errorRes(error))
    }    
}

module.exports = {
    startStopDriving,
    updateDriverLocation,
    updateDriverOkay,
    alertDrowsiness,
    sendAlertToUser,
}