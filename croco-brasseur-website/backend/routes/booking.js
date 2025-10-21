// Booking Routes
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Reservation routes
router.post('/reservations', bookingController.createReservation);
router.get('/reservations', bookingController.getAllReservations);
router.get('/reservations/:id', bookingController.getReservationById);
router.put('/reservations/:id', bookingController.updateReservationStatus);
router.delete('/reservations/:id', bookingController.deleteReservation);

module.exports = router;