var express = require('express');
var router = express.Router();
const passport = require("passport");
const vehicleController = require('../controllers/vehicleController');
const userController = require('../controllers/userController');
const circleController = require('../controllers/circleController');

router.get('/user', userController.getAllUsers);


router.post('/vehicle', vehicleController.addVehicle);
router.put('/vehicle/:id', vehicleController.updateVehicle);
router.delete('/vehicle/:id', vehicleController.deleteVehicle);
router.get('/vehicle', vehicleController.getVehicles);
router.get('/vehicle/:id', vehicleController.getVehicle);


router.post('/circle', circleController.addCircle);
router.delete('/circle/:id', circleController.deleteCircle);
router.post('/circle/approve', circleController.approveCircle);
router.get('/circle/get-approved', circleController.getApprovedCircle);
router.get('/circle/get-pending', circleController.getPendingCircle);
router.get('/circle/get-requested', circleController.getRequestedCircle);

// router.get('/circle/get-approved', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getApprovedCircle)
// router.get('/circle/get-pending', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getPendingCircle)
// router.get('/circle/get-requested', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getRequestedCircle)



module.exports = router;
