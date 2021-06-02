var express = require('express');
var router = express.Router();
const passport = require("passport");
const vehicleController = require('../controllers/vehicleController');

router.post('/vehicle', vehicleController.addVehicle)
router.put('/vehicle/:id', vehicleController.updateVehicle)
router.delete('/vehicle/:id', vehicleController.deleteVehicle)
router.get('/vehicle', vehicleController.getVehicles)
router.get('/vehicle/:id', vehicleController.getVehicle)

module.exports = router;
