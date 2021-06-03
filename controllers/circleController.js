'use strict';
const db = require('../db');

const UserCircle = require('../models/circle');
const User = require('../models/user');

const addCircle = async (req, res, next) => {
    try {

        const userCicleQry = await db.collection('circles').where("user", '==', req.userId).where("circleUser", '==', req.body.circleUser).get();

        if (!userCicleQry.empty) {
            const userCircleDoc = userCicleQry.docs[0].data();
            if (userCircleDoc.status === 1) 
                    return jsonResponse(res, 400, badRes('This particular contact is already added to your close cirlce'))
                else 
                    return jsonResponse(res, 400, badRes('You have already requested this contact to add in your close circle. Confirmation pending'))
        }

        const userCircle = new UserCircle(req.userId, req.body.circleUser, circleType()[req.body.type]);

        const object = userCircle.getObject();
        await db.collection('circles').doc().set(object);

        return jsonResponse(res, 200, successRes('Your request to add this contact is sent successfully'))
    } catch (error) {
        console.log(error)
        return jsonResponse(res, 500, errorRes(error))
    }
}

const deleteCircle = async (req, res, next) => {
    try {
        const circle = await db.collection('circles').doc(req.params.id);
        const availableCircle = await circle.get();
        if (!availableCircle.exists) {
            return jsonResponse(res, 400, badRes('You have not added this contact in your close circle'));
        }   
        if (availableCircle.data().user !== req.userId) {
            return jsonResponse(res, 400, badRes('You have not added this contact in your close circle')); 
        }
        await circle.delete();
        return jsonResponse(res, 200, successRes('You have deleted this contact successfully'));
    } catch (error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const approveCircle = async (req, res, next) => {
    const userCircle = await db.collection('circles').where("user", '==', req.body.circleUser).where("circleUser", '==', req.userId);
    const availableUserCircle = await userCircle.get();
        if (availableUserCircle.empty) {
            return jsonResponse(res, 400, badRes('You have not added this contact in your close circle'));
        }

        const userCircleDoc = availableUserCircle.docs[0].data();
        if (userCircleDoc.status === 1) {
            return jsonResponse(res, 400, badRes('You have already added this contact in your close circle'));
        }

        const newUserCircle = new UserCircle(userCircleDoc.user, userCircleDoc.circleUser, userCircleDoc.type, 1)
        newUserCircle.setId(availableUserCircle.docs[0].id)

        const object = newUserCircle.getObject();
        await db.collection('circles').doc(newUserCircle.getId()).update(object);        
        return jsonResponse(res, 200, successRes('You have added this contact in your close circle successfully'));
}

const getApprovedCircle = async (req, res, next) => {
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
                users.forEach((doc) => {
                    if (doc.id === userCircleDoc.user || doc.id === userCircleDoc.circleUser) {
                        actualUsers.push({
                            ...doc.data(),
                            id: doc.id,
                        });
                    }                
                })
                
                return actualUsers.map(user => {
                    return {
                        id: userCircleDoc.id,
                        circleUserId: user.id,
                        circleUserName: user.firstName + " " + user.lastName,
                        circleUserEmail: user.email,
                        circleUserPhone: user.phone,
                        status: userCircleDoc.status,
                        type: userCircleDoc.type,
                    }
                });

            } catch (error) {
                return jsonResponse(res, 500, errorRes(error))
            }

        }));

        const responses = [];
        circleResponse.forEach(userDocs => {
            userDocs.forEach(user => {
                if (user.circleUserId != req.userId) {
                        responses.push(user);
                }                   
            })
        });

        return jsonResponse(res, 200, successRes(responses));
    } catch (errror) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const getPendingCircle = async (req, res, next) => {
    try {
        const userCircles = await db.collection('circles').where("status", '==', 0).get();

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
            let requested = false;
            let requestCame = false;
            userCircleDoc.user == req.userId ? requested = true : requested = false;
            userCircleDoc.circleUser == req.userId ? requestCame = true : requestCame = false;

            if(requestCame) {

                try {
            
                    let users = await db.collection('users').get();
                    const actualUsers = [];
                    users.forEach((doc) => {
                        if (doc.id === userCircleDoc.user || doc.id === userCircleDoc.circleUser) {
                            actualUsers.push({
                                ...doc.data(),
                                id: doc.id,
                            });
                        }                
                    });
                    return actualUsers.map(user => {
                        return {
                            id: userCircleDoc.id,
                            circleUserId: user.id,
                            circleUserName: user.firstName + " " + user.lastName,
                            circleUserEmail: user.email,
                            circleUserPhone: user.phone,
                            status: userCircleDoc.status,
                            type: userCircleDoc.type,
                            otherStatus: 1
                        }
                    });

                } catch (error) {
                    return jsonResponse(res, 500, errorRes(error));
                }

            } else {
                return [];
            }
        }));
        const responses = [];
        circleResponse.forEach(userDocs => {
            userDocs.forEach(user => {
                if (user.circleUserId != req.userId) {
                    responses.push(user);
                }                   
            })
        });
        return jsonResponse(res, 200, successRes(responses));

    } catch (error) {
        return jsonResponse(res, 500, errorRes(error));
    }
}

const getRequestedCircle = async (req, res, next) => {
    try {
        const userCircles = await db.collection('circles').where("status", '==', 0).get();

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
            let requested = false;
            let requestCame = false;
            userCircleDoc.user == req.userId ? requested = true : requested = false;
            userCircleDoc.circleUser == req.userId ? requestCame = true : requestCame = false;

            if(requested) {

                try {
            
                    let users = await db.collection('users').get();
                    const actualUsers = [];
                    users.forEach((doc) => {
                        if (doc.id === userCircleDoc.user || doc.id === userCircleDoc.circleUser) {
                            actualUsers.push({
                                ...doc.data(),
                                id: doc.id,
                            });
                        }                
                    });
                    return actualUsers.map(user => {
                        return {
                            id: userCircleDoc.id,
                            circleUserId: user.id,
                            circleUserName: user.firstName + " " + user.lastName,
                            circleUserEmail: user.email,
                            circleUserPhone: user.phone,
                            status: userCircleDoc.status,
                            type: userCircleDoc.type,
                            otherStatus: 2
                        }
                    });

                } catch (error) {
                    return jsonResponse(res, 500, errorRes(error));
                }

            } else {
                return [];
            }
        }));
        const responses = [];
        circleResponse.forEach(userDocs => {
            userDocs.forEach(user => {
                if (user.circleUserId != req.userId) {
                    responses.push(user);
                }                   
            })
        });
        return jsonResponse(res, 200, successRes(responses));

    } catch (error) {
        return jsonResponse(res, 500, errorRes(error));
    }
}

const getAllCircle = async (req, res, next) => {
    try {
        const userCircles = await db.collection('circles').where("status", '==', 0).get();

        const actualCircles = [];
        userCircles.forEach((doc) => {
            if (doc.data().user === req.userId || doc.data().circleUser === req.userId) {
                actualCircles.push({
                    ...doc.data(),
                    id: doc.id,
                });
            }
        });

        return jsonResponse(res, 200, successRes(actualCircles));

    } catch (error) {
        return jsonResponse(res, 500, errorRes(error));
    }
}

module.exports = {
    addCircle,
    deleteCircle,
    approveCircle,
    getApprovedCircle,
    getPendingCircle,
    getRequestedCircle,
    getAllCircle,
 };