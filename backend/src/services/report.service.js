const { Sequelize, Op } = require('sequelize');
const Reservation = require('../models/reservation.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const sequelize = require('../config/database');

class ReportService {
  /**
   * Tạo báo cáo sử dụng tổng quan
   */
  async generateUsageReport(startDate, endDate) {
    // Đảm bảo đúng định dạng ngày
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Tổng số lượt đặt phòng
    const totalReservations = await Reservation.count({
      where: {
        startTime: { [Op.between]: [start, end] }
      }
    });

    // Số lượt đặt phòng theo trạng thái
    const reservationsByStatus = await Reservation.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        startTime: { [Op.between]: [start, end] }
      },
      group: ['status'],
      raw: true
    });

    // Lấy tất cả đặt phòng trong khoảng thời gian
    const reservations = await Reservation.findAll({
      where: {
        startTime: { [Op.between]: [start, end] }
      },
      include: [
        {
          model: Room,
          attributes: ['name', 'location']
        },
        {
          model: User,
          attributes: ['fullName']
        }
      ],
      raw: true
    });

    return {
      period: {
        startDate: start,
        endDate: end
      },
      totalReservations,
      reservationsByStatus,
      reservations
    };
  }

  /**
   * Tạo tổng quan sử dụng phòng
   */
  async generateRoomUtilizationSummary(startDate, endDate) {
    // Đảm bảo đúng định dạng ngày
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Tính tổng số phút trong khoảng thời gian
    const totalMinutesInPeriod = (end - start) / (60 * 1000);
    
    // Tần suất sử dụng từng phòng
    const roomUtilization = await Room.findAll({
      attributes: [
        'id', 
        'name', 
        'location'
      ],
      include: [
        {
          model: Reservation,
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('Reservation.id')), 'reservationCount'],
            [
              Sequelize.fn(
                'SUM', 
                Sequelize.literal('TIMESTAMPDIFF(MINUTE, Reservation.startTime, Reservation.endTime)')
              ), 
              'totalMinutes'
            ]
          ],
          where: {
            startTime: { [Op.between]: [start, end] },
            status: { [Op.not]: 'cancelled' }
          },
          required: false
        }
      ],
      group: ['Room.id'],
      raw: true,
      nest: true
    });

    // Tính tỷ lệ sử dụng cho từng phòng
    const result = roomUtilization.map(room => {
      const reservationCount = parseInt(room.Reservation.reservationCount || 0, 10);
      const totalMinutes = parseInt(room.Reservation.totalMinutes || 0, 10);
      
      // Tính tỷ lệ sử dụng dựa trên tổng số phút trong khoảng thời gian
      const utilizationRate = totalMinutesInPeriod > 0
        ? (totalMinutes / totalMinutesInPeriod) * 100
        : 0;
        
      return {
        id: room.id,
        name: room.name,
        location: room.location,
        reservationCount,
        totalMinutes,
        utilizationRate
      };
    });
    
    // Sắp xếp theo mức độ sử dụng giảm dần
    return result.sort((a, b) => b.utilizationRate - a.utilizationRate);
  }

  /**
   * Tạo báo cáo sử dụng cho một phòng cụ thể
   */
  async generateRoomUtilizationReport(roomId, startDate, endDate) {
    // Đảm bảo đúng định dạng ngày
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Kiểm tra phòng tồn tại
    const room = await Room.findByPk(roomId);
    if (!room) {
      throw new Error('Không tìm thấy phòng học');
    }

    // Tổng số lượt đặt phòng
    const totalReservations = await Reservation.count({
      where: {
        roomId,
        startTime: { [Op.between]: [start, end] }
      }
    });

    // Tổng thời gian sử dụng (phút)
    const totalUsageTime = await Reservation.findAll({
      attributes: [
        [
          Sequelize.fn(
            'SUM', 
            Sequelize.literal('TIMESTAMPDIFF(MINUTE, startTime, endTime)')
          ), 
          'totalMinutes'
        ]
      ],
      where: {
        roomId,
        startTime: { [Op.between]: [start, end] },
        status: { [Op.not]: 'cancelled' }
      },
      raw: true
    });

    // Tỷ lệ sử dụng phòng
    // Tính tổng số phút trong khoảng thời gian start-end
    const totalMinutesInPeriod = (end - start) / (60 * 1000);
    const usageMinutes = totalUsageTime[0]?.totalMinutes || 0;
    const utilizationRate = totalMinutesInPeriod > 0 ? (usageMinutes / totalMinutesInPeriod) * 100 : 0;

    // Chi tiết lịch đặt phòng
    const reservationDetails = await Reservation.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'fullName']
        }
      ],
      where: {
        roomId,
        startTime: { [Op.between]: [start, end] }
      },
      order: [['startTime', 'ASC']]
    });

    return {
      room: {
        id: room.id,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        equipment: room.equipment
      },
      period: {
        startDate: start,
        endDate: end
      },
      stats: {
        totalReservations,
        totalUsageMinutes: usageMinutes,
        utilizationRate: Math.round(utilizationRate)
      },
      reservations: reservationDetails
    };
  }

  /**
   * Lấy danh sách đặt phòng trong khoảng thời gian
   */
  async getReservationsByTimeRange(startDate, endDate) {
    // Đảm bảo đúng định dạng ngày
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return await Reservation.findAll({
      where: {
        startTime: { [Op.between]: [start, end] }
      },
      include: [
        {
          model: Room,
          attributes: ['name', 'location']
        },
        {
          model: User,
          attributes: ['fullName']
        }
      ]
    });
  }

  /**
   * Tạo báo cáo hoạt động người dùng
   */
  async generateUserActivityReport(startDate, endDate, userId) {
    // Đảm bảo đúng định dạng ngày
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let whereClause = {
      startTime: { [Op.between]: [start, end] }
    };
    
    if (userId) {
      whereClause.userId = userId;
    }

    // Thống kê đặt phòng theo người dùng
    const userStats = await User.findAll({
      attributes: [
        'id',
        'username',
        'fullName',
        'email',
        'role',
        'createdAt'
      ],
      include: [
        {
          model: Reservation,
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('Reservations.id')), 'totalBookings'],
            [
              Sequelize.fn(
                'SUM', 
                Sequelize.literal("CASE WHEN Reservations.status = 'completed' THEN 1 ELSE 0 END")
              ), 
              'completedBookings'
            ],
            [
              Sequelize.fn(
                'SUM', 
                Sequelize.literal("CASE WHEN Reservations.status = 'cancelled' THEN 1 ELSE 0 END")
              ), 
              'cancelledBookings'
            ]
          ],
          where: whereClause,
          required: false
        }
      ],
      group: ['User.id'],
      raw: true,
      nest: true
    });

    // Định dạng kết quả
    return userStats.map(user => ({
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalBookings: parseInt(user.Reservations.totalBookings || 0, 10),
      completedBookings: parseInt(user.Reservations.completedBookings || 0, 10),
      cancelledBookings: parseInt(user.Reservations.cancelledBookings || 0, 10)
    }));
  }

  /**
   * Tạo tổng quan dashboard
   */
  async generateDashboardSummary() {
    // Tính thời gian 30 ngày trước
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Số lượng đặt phòng mới
    const pendingReservations = await Reservation.count({
      where: {
        status: 'pending'
      }
    });
    
    // Tổng số đặt phòng
    const totalReservations = await Reservation.count();
    
    // Số phòng đang hoạt động
    const activeRooms = await Room.count({
      where: {
        status: 'active'
      }
    });
    
    // Tổng số phòng
    const totalRooms = await Room.count();
    
    // Số người dùng tích cực (có ít nhất một đặt phòng trong 30 ngày qua)
    const activeUsers = await Reservation.count({
      distinct: true,
      col: 'userId',
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });
    
    // Tổng số người dùng
    const totalUsers = await User.count();
    
    // Đặt phòng gần đây
    const recentBookings = await Reservation.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Room,
          attributes: ['name', 'location']
        },
        {
          model: User,
          attributes: ['fullName', 'email']
        }
      ]
    });
    
    // Phòng được sử dụng nhiều nhất
    const mostUsedRooms = await Reservation.findAll({
      attributes: [
        'roomId',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'bookingCount']
      ],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.not]: 'cancelled' }
      },
      group: ['roomId'],
      order: [[Sequelize.literal('bookingCount'), 'DESC']],
      limit: 5,
      include: [
        {
          model: Room,
          attributes: ['name', 'location']
        }
      ],
      raw: true,
      nest: true
    });
    
    // Phân bố trạng thái đặt phòng
    const statusDistribution = await Reservation.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      group: ['status'],
      raw: true
    });
    
    return {
      stats: {
        pendingReservations,
        totalReservations,
        activeRooms,
        totalRooms,
        activeUsers,
        totalUsers
      },
      recentBookings,
      mostUsedRooms: mostUsedRooms.map(item => ({
        roomId: item.roomId,
        roomName: item.Room.name,
        location: item.Room.location,
        bookings: parseInt(item.bookingCount, 10)
      })),
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: parseInt(item.count, 10)
      }))
    };
  }

  /**
   * Tạo thống kê theo tháng
   */
  async generateMonthlyStats(year) {
    const monthlyStats = [];
    
    // Tạo thống kê cho từng tháng
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Tổng số đặt phòng trong tháng
      const totalReservations = await Reservation.count({
        where: {
          startTime: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Tổng số giờ sử dụng trong tháng
      const totalUsageTime = await Reservation.findAll({
        attributes: [
          [
            Sequelize.fn(
              'SUM', 
              Sequelize.literal('TIMESTAMPDIFF(HOUR, startTime, endTime)')
            ), 
            'totalHours'
          ]
        ],
        where: {
          startTime: { [Op.between]: [startDate, endDate] },
          status: { [Op.not]: 'cancelled' }
        },
        raw: true
      });
      
      monthlyStats.push({
        month: month,
        monthName: new Date(year, month - 1, 1).toLocaleString('vi-VN', { month: 'long' }),
        bookings: totalReservations,
        hours: parseInt(totalUsageTime[0]?.totalHours || 0, 10)
      });
    }
    
    return {
      year,
      monthlyStats
    };
  }
}

module.exports = new ReportService();