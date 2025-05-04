const reportService = require('../services/report.service');

class ReportController {
  async getUsageReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const report = await reportService.generateUsageReport(startDate, endDate);
      
      // Định dạng dữ liệu bookingsByStatus để trả về cho frontend
      const bookingsByStatus = report.reservationsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count, 10)
      }));
      
      // Tạo phân bố theo giờ
      const timeDistribution = generateTimeDistribution(report.reservations || []);
      
      res.status(200).json({
        success: true,
        data: {
          totalBookings: report.totalReservations,
          completedBookings: report.reservationsByStatus.find(item => item.status === 'completed')?.count || 0,
          cancelledBookings: report.reservationsByStatus.find(item => item.status === 'cancelled')?.count || 0,
          bookingsByStatus,
          timeDistribution,
          period: report.period
        }
      });
    } catch (error) {
      console.error('Error in getUsageReport:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo báo cáo sử dụng'
      });
    }
  }

  /**
   * Lấy báo cáo sử dụng phòng
   */
  async getRoomUtilizationReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const report = await reportService.generateRoomUtilizationSummary(startDate, endDate);
      
      // Định dạng dữ liệu cho frontend
      const roomUtilization = report.map(room => ({
        id: room.id,
        name: room.name,
        bookings: parseInt(room.reservationCount, 10),
        hours: Math.round(parseInt(room.totalMinutes, 10) / 60),
        utilization: Math.round(room.utilizationRate)
      }));
      
      res.status(200).json({
        success: true,
        data: {
          roomUtilization,
          period: {
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      console.error('Error in getRoomUtilizationReport:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo báo cáo sử dụng phòng'
      });
    }
  }

  /**
   * Lấy báo cáo chi tiết phòng cụ thể
   */
  async getRoomDetailReport(req, res) {
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
      console.error('Error in getRoomDetailReport:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo báo cáo sử dụng phòng'
      });
    }
  }

  /**
   * Lấy báo cáo phân bố thời gian
   */
  async getTimeDistributionReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const reservations = await reportService.getReservationsByTimeRange(startDate, endDate);
      const timeDistribution = generateTimeDistribution(reservations);
      
      res.status(200).json({
        success: true,
        data: {
          timeDistribution,
          period: {
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      console.error('Error in getTimeDistributionReport:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo báo cáo phân bố thời gian'
      });
    }
  }

  /**
   * Lấy báo cáo hoạt động người dùng
   */
  async getUserActivityReport(req, res) {
    try {
      const { startDate, endDate, userId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const userActivity = await reportService.generateUserActivityReport(startDate, endDate, userId);
      
      res.status(200).json({
        success: true,
        data: userActivity
      });
    } catch (error) {
      console.error('Error in getUserActivityReport:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo báo cáo hoạt động người dùng'
      });
    }
  }

  /**
   * Lấy tổng quan dashboard
   */
  async getDashboardSummary(req, res) {
    try {
      const summary = await reportService.generateDashboardSummary();
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo tổng quan dashboard'
      });
    }
  }

  /**
   * Lấy thống kê theo tháng
   */
  async getMonthlyStats(req, res) {
    try {
      const { year } = req.query;
      
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin năm'
        });
      }
      
      const stats = await reportService.generateMonthlyStats(parseInt(year, 10));
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getMonthlyStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo thống kê theo tháng'
      });
    }
  }

  /**
   * Xuất báo cáo
   */
  async exportReport(req, res) {
    try {
      const { reportType } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      let data;
      let fields;
      let filename;
      
      // Lấy dữ liệu tương ứng với loại báo cáo
      switch (reportType) {
        case 'booking':
          data = await reportService.generateUsageReport(startDate, endDate);
          fields = ['id', 'userId', 'roomId', 'startTime', 'endTime', 'status', 'createdAt'];
          filename = `booking-report-${startDate}-to-${endDate}`;
          break;
          
        case 'room-utilization':
          data = await reportService.generateRoomUtilizationSummary(startDate, endDate);
          fields = ['id', 'name', 'reservationCount', 'totalMinutes', 'utilizationRate'];
          filename = `room-utilization-report-${startDate}-to-${endDate}`;
          break;
          
        case 'user-activity':
          data = await reportService.generateUserActivityReport(startDate, endDate);
          fields = ['userId', 'username', 'fullName', 'totalBookings', 'completedBookings', 'cancelledBookings'];
          filename = `user-activity-report-${startDate}-to-${endDate}`;
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Loại báo cáo không hợp lệ'
          });
      }
      
      // Kiểm tra Accept header để xác định định dạng xuất
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        // Xuất Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');
        
        // Thêm header
        worksheet.columns = fields.map(field => ({ header: field, key: field, width: 20 }));
        
        // Thêm dữ liệu
        worksheet.addRows(data);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        
        await workbook.xlsx.write(res);
        res.end();
      } else {
        // Xuất CSV
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        
        res.send(csv);
      }
    } catch (error) {
      console.error('Error in exportReport:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi xuất báo cáo'
      });
    }
  }
}

/**
 * Tạo dữ liệu phân bố theo giờ từ danh sách đặt phòng
 */
function generateTimeDistribution(reservations) {
  const hourCounts = {};
  
  // Khởi tạo tất cả các giờ từ 6:00 đến 22:00
  for (let hour = 6; hour <= 22; hour++) {
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    hourCounts[hourStr] = 0;
  }
  
  // Đếm số lượng đặt phòng theo từng giờ
  reservations.forEach(reservation => {
    const startTime = new Date(reservation.startTime);
    const hour = startTime.getHours();
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    
    if (hourCounts[hourStr] !== undefined) {
      hourCounts[hourStr]++;
    }
  });
  
  // Chuyển đổi sang định dạng mảng cho frontend
  return Object.entries(hourCounts).map(([hour, bookings]) => ({
    hour,
    bookings
  }));
}

module.exports = new ReportController();