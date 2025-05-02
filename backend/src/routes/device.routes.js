const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes cần xác thực và phải là admin
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isTechnician);

// Lấy danh sách thiết bị theo id room
router.get('/room/:roomId', deviceController.getDevicesByRoomId);
// sửa số lượng thiết bị theo id room
router.put('/room/:roomId', deviceController.updateDeviceByRoomId);

module.exports = router;