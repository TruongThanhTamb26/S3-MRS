const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes cần xác thực
router.use(authMiddleware.verifyToken);

// User routes
router.post('/', reservationController.createReservation);
router.get('/my-reservations', reservationController.getUserReservations);
router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.cancelReservation);
router.post('/:id/check-in', reservationController.checkIn);
router.post('/:id/check-out', reservationController.checkOut);

// Admin routes
router.get('/', authMiddleware.isAdmin, reservationController.getAllReservations);

module.exports = router;