const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes cần xác thực và phải là admin
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

// Báo cáo sử dụng tổng quan
router.get('/usage', reportController.getUsageReport);

// Báo cáo sử dụng phòng
router.get('/rooms/utilization', reportController.getRoomUtilizationReport);

// Báo cáo chi tiết phòng cụ thể
router.get('/room/:roomId', reportController.getRoomDetailReport);

// Báo cáo phân bố thời gian
router.get('/time-distribution', reportController.getTimeDistributionReport);

// Báo cáo hoạt động người dùng
router.get('/user-activity', reportController.getUserActivityReport);

// Tổng quan dashboard
router.get('/dashboard', reportController.getDashboardSummary);

// Thống kê theo tháng
router.get('/monthly-stats', reportController.getMonthlyStats);

// Xuất báo cáo
router.get('/export/:reportType', reportController.exportReport);

module.exports = router;