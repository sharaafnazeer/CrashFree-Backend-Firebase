var express = require('express');
var router = express.Router();
const passport = require("passport");
const authController = require('../controllers/authController');
const vehicleController = require('../controllers/vehicleController');
const userController = require('../controllers/userController');
const circleController = require('../controllers/circleController');
const drivingController = require('../controllers/drivingController');
const arduinoController = require('../controllers/arduinoController');

router.post('/login', authController.signIn); // login
router.get('/verify', authController.verify); // check user logged in
router.post('/register', authController.signUp); // register
router.post('/activate', authController.activateAccount); // account activation
router.post('/verify-reset', authController.resetUserVerify); // reset account verify
router.post('/verify-reset-code', authController.verifyResetCode); // reset account verify
router.post('/reset-password', authController.resetPassword); // reset account password
router.get('/check', passport.authenticate('jwt', { session: false }), authController.checkAuth); 
router.post('/fcm', passport.authenticate('jwt', { session: false }), authController.verify, authController.updateFcm); 

router.get('/user', passport.authenticate('jwt', { session: false }), authController.verify, userController.getAllUsers)


router.post('/circle', passport.authenticate('jwt', { session: false }), authController.verify, circleController.addCircle)
router.delete('/circle/:id', passport.authenticate('jwt', { session: false }), authController.verify, circleController.deleteCircle)
router.get('/circle', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getAllCircle)
router.post('/circle/approve', passport.authenticate('jwt', { session: false }), authController.verify, circleController.approveCircle)
router.get('/circle/get-approved', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getApprovedCircle)
router.get('/circle/get-pending', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getPendingCircle)
router.get('/circle/get-requested', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getRequestedCircle)

router.post('/vehicle', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.addVehicle)
router.put('/vehicle/:id', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.updateVehicle)
router.delete('/vehicle/:id', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.deleteVehicle)
router.get('/vehicle', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.getVehicles)
router.get('/vehicle/:id', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.getVehicle)

router.post('/vehicle/alert', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.sendAlertToUser)


router.post('/driving', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.startStopDriving)
router.post('/driving/location', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.updateDriverLocation)
router.post('/driving/update', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.updateDriverOkay)
router.post('/driving/alert', drivingController.alertDrowsiness)

router.get('/track', arduinoController.addValues)



module.exports = router;
