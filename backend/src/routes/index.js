const express = require('express');
const router = express.Router();

// Import các route
const userRoutes = require('./user.routes');
const roomRoutes = require('./room.routes');
const reservationRoutes = require('./reservation.routes');
const reportRoutes = require('./report.routes');

// Đăng ký các route
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reports', reportRoutes);

module.exports = router;