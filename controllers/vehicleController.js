'use strict';

const Vehicle = require('../models/vehicle');
const Message = require('../helpers/sendMessage');

const db = require('../db');

const addVehicle = async (req, res, next) => {
    try {

        const vehicle = db.collection('vehicles').where("vehicleNo", '==', req.body.vehicleNo);
        const availableVehicle = await vehicle.get();
        if (!availableVehicle.empty) {
            return jsonResponse(res, 200, successRes('You have already added this vehicle successfully'));
        }
        const newVehicle = new Vehicle(req.body.vehicleNo, req.body.brand,
            req.body.model, req.userId, req.body.type, req.body.status);

        const object = newVehicle.getObject();
        await db.collection('vehicles').doc().set(object);
        return jsonResponse(res, 200, successRes('You have added this vehicle successfully'));
    } catch (error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const getVehicles = async (req, res, next) => {
    console.log(req.userId)
    try {
        const vehicles = await db.collection('vehicles').where("user", '==', req.userId).get();
        const vehicleResponse = [];
        vehicles.forEach((doc) => {
            const item = new Vehicle(
                doc.data().vehicleNo,
                doc.data().brand,
                doc.data().model,
                doc.data().user,
                doc.data().type,
                doc.data().status
            );
            item.setId(doc.id);
            vehicleResponse.push(item);
        });

        return jsonResponse(res, 200, successRes(vehicleResponse))
    } catch (error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const getVehicle = async (req, res, next) => {
    try {
        const vehicle = await db.collection('vehicles').doc(req.params.id).get();
        if (!vehicle.exists) {
            return jsonResponse(res, 400, badRes("Vehicle not found"))
        }
        if (vehicle.data().user && vehicle.data().user !== req.userId) {
            return jsonResponse(res, 400, badRes("Vehicle not found"))
        }
        return jsonResponse(res, 200, successRes(vehicle.data()))
    } catch (error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await db.collection('vehicles').doc(req.params.id);
        const availableVehicle = await vehicle.get();
        if (!availableVehicle.exists) {
            return jsonResponse(res, 400, badRes('You have not added this vehicle'))
        }
        if (availableVehicle.data().user && availableVehicle.data().user !== req.userId) {
            return jsonResponse(res, 400, badRes('You have not added this vehicledd'))
        }

        const newVehicle = new Vehicle(req.body.vehicleNo, req.body.brand,
            req.body.model, req.userId, req.body.type, req.body.status);
        const object = newVehicle.getObject();
        await vehicle.update(object);
        return jsonResponse(res, 200, successRes('You have updated this vehicle successfully'))
    } catch (error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

const deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await db.collection('vehicles').doc(req.params.id);
        const availableVehicle = await vehicle.get();
        if (!availableVehicle.exists) {
            return jsonResponse(res, 400, badRes('You have not added this vehicle'))
        }
        if (availableVehicle.data().user && availableVehicle.data().user !== req.userId) {
            return jsonResponse(res, 400, badRes('You have not added this vehicle'))
        }
        await vehicle.delete();
        return jsonResponse(res, 200, successRes('You have deleted this vehicle successfully'))
    } catch (error) {
        return jsonResponse(res, 500, errorRes(error))
    }
}

module.exports = {
    addVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
}