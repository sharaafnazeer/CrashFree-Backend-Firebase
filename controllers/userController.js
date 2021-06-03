'use strict';
const db = require('../db');

const getAllUsers = async (req, res, next) => {
    
    try{
        let users = await db.collection('users').where("status", '==', 1).get();
        const actualUsers = [];
        users = users.forEach((doc) => {
            if (doc.id !== req.userId) {
                actualUsers.push({
                    ...doc.data(),
                    id: doc.id,
                });
            }
        });
        const userResponse = await Promise.all(actualUsers.map(async (doc) => {
            try {
                let realUser = doc;
                
                let circles = await db.collection('circles').get();
                const actualCircles = [];
                circles.forEach((doc) => {
                    actualCircles.push({
                        ...doc.data(),
                        id: doc.id,
                    });
                })
                
                const userCircle = actualCircles.find((doc) =>  doc.user === req.userId || doc.circleUser === req.userId);
                let requested = false;
                let requestCame = false;
                if (userCircle) {
                    userCircle.user == req.userId ? requested = true : requested = false;
                    userCircle.circleUser == req.userId ? requestCame = true : requestCame = false;                 
                
                    realUser.status = userCircle.status;
                    realUser.isCircle = true;

                    if(requested) {
                        realUser.otherStatus = 2;
                    }

                    if(requestCame) {
                        realUser.otherStatus = 1;
                    }
                } else {
                    realUser.status = 0;
                    realUser.isCircle = false;
                    realUser.otherStatus = 0;
                } 

                return {
                    id: userCircle ? userCircle.id ? userCircle.id : null : null,
                    circleUserId: realUser.id,
                    circleUserName: realUser.firstName + " " + realUser.lastName,
                    circleUserEmail: realUser.email,
                    circleUserPhone: realUser.phone || 'N/A',
                    status: realUser.status,
                    type: userCircle ? userCircle.type : 'Unknown',
                    isCircle: realUser.isCircle,
                    otherStatus: realUser.otherStatus,
                };

            } catch (error) {
                return jsonResponse(res, 500, errorRes(error))
            }
        }));
        return jsonResponse(res, 200, successRes(userResponse))
    } catch(error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

module.exports = { 
    getAllUsers,
}