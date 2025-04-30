const reportService = require('../services/report.service');

class ReportController {
  async generateUsageReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const report = await reportService.generateUsageReport(startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async generateRoomUtilizationReport(req, res) {
    try {
      const { roomId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const report = await reportService.generateRoomUtilizationReport(roomId, startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReportController();