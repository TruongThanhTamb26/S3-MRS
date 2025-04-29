// src/routes/index.js
const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const roomRoutes = require('./room.routes');
const bookingRoutes = require('./booking.routes');

router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;