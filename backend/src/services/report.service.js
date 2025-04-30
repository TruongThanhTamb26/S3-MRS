const { Reservation, Room, User } = require('../models');
const { Op, Sequelize } = require('sequelize');

class ReportService {
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
        [Sequelize.fn('COUNT', Sequelize.col('Reservation.id')), 'count']
      ],
      where: {
        startTime: { [Op.between]: [start, end] }
      },
      group: ['status']
    });

    // Tần suất sử dụng từng phòng
    const roomUsage = await Reservation.findAll({
      attributes: [
        'roomId',
        [Sequelize.fn('COUNT', Sequelize.col('Reservation.id')), 'reservationCount'],
        [Sequelize.fn('SUM', 
          Sequelize.literal('TIMESTAMPDIFF(MINUTE, startTime, endTime)')), 
          'totalMinutes'
        ]
      ],
      include: [
        {
          model: Room,
          attributes: ['name', 'location', 'capacity']
        }
      ],
      where: {
        startTime: { [Op.between]: [start, end] },
        status: { [Op.ne]: 'cancelled' }
      },
      group: ['roomId']
    });

    // Top 10 người dùng đặt phòng nhiều nhất
    const topUsers= await Reservation.findAll({
      attributes: [
        'userId',
        [Sequelize.fn('COUNT', Sequelize.col('Reservation.id')), 'reservationCount']
      ],
      include: [
        {
          model: User,
          attributes: ['username', 'fullName']
        }
      ],
      where: {
        startTime: { [Op.between]: [start, end] }
      },
      group: ['userId'],
      order: [[Sequelize.literal('reservationCount'), 'DESC']],
      limit: 10
    });

    // Thời gian sử dụng trung bình
    const avgUsageTime = await Reservation.findAll({
      attributes: [
        [Sequelize.fn('AVG', 
          Sequelize.literal('TIMESTAMPDIFF(MINUTE, startTime, endTime)')), 
          'averageMinutes'
        ]
      ],
      where: {
        startTime: { [Op.between]: [start, end] },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    return {
      period: {
        startDate: start,
        endDate: end
      },
      totalReservations,
      reservationsByStatus,
      roomUsage,
      topUsers,
      avgUsageTime: avgUsageTime[0]?.dataValues?.averageMinutes || 0
    };
  }

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
        [Sequelize.fn('SUM', 
          Sequelize.literal('TIMESTAMPDIFF(MINUTE, startTime, endTime)')), 
          'totalMinutes'
        ]
      ],
      where: {
        roomId,
        startTime: { [Op.between]: [start, end] },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Tỷ lệ sử dụng phòng
    // Tính tổng số phút trong khoảng thời gian start-end
    const totalMinutesInPeriod = (end - start) / (60 * 1000);
    const usageMinutes = totalUsageTime[0]?.dataValues?.totalMinutes || 0;
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
        capacity: room.capacity,
        location: room.location
      },
      period: {
        startDate: start,
        endDate: end
      },
      totalReservations,
      totalUsageMinutes: usageMinutes,
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
      reservationDetails
    };
  }
}

module.exports = new ReportService();