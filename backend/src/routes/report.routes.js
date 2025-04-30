const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes cần xác thực và phải là admin
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

router.get('/usage', reportController.generateUsageReport);
router.get('/room/:roomId', reportController.generateRoomUtilizationReport);

module.exports = router;