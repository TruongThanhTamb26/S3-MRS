const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', roomController.getAllRooms);
router.get('/available', roomController.findAvailableRooms);
router.get('/:id', roomController.getRoomById);

// Admin routes
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, roomController.createRoom);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, roomController.updateRoom);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, roomController.deleteRoom);
router.patch('/:id/status', authMiddleware.verifyToken, authMiddleware.isAdmin, roomController.updateRoomStatus);

module.exports = router;