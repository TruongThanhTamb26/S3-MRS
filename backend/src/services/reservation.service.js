const reservationRepository = require('../repositories/reservation.repository');
const roomRepository = require('../repositories/room.repository');
const { Op } = require('sequelize');

class ReservationService {
  async createReservation(reservationData) {
    // Kiểm tra thời gian hợp lệ
    if (new Date(reservationData.startTime) >= new Date(reservationData.endTime)) {
      throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    // Kiểm tra thời gian đặt tối thiểu (ví dụ: 30 phút)
    const duration = (new Date(reservationData.endTime) - new Date(reservationData.startTime)) / (60 * 1000);
    if (duration < 30) {
      throw new Error('Thời gian đặt phòng tối thiểu là 30 phút');
    }

    // Kiểm tra phòng có tồn tại
    const room = await roomRepository.findById(reservationData.roomId);
    if (!room) {
      throw new Error('Phòng học không tồn tại');
    }

    // Kiểm tra phòng có sẵn sàng
    if (room.status !== 'available') {
      throw new Error('Phòng học đang không khả dụng');
    }

    // Kiểm tra xung đột lịch đặt
    const conflictReservations = await reservationRepository.findOverlapping(
      reservationData.roomId,
      reservationData.startTime,
      reservationData.endTime
    );

    if (conflictReservations.length > 0) {
      throw new Error('Phòng học đã được đặt trong khoảng thời gian này');
    }

    // Kiểm tra số người phù hợp với sức chứa
    if (reservationData.capacity > room.capacity) {
      throw new Error(`Số người vượt quá sức chứa của phòng (tối đa ${room.capacity} người)`);
    }

    // Tạo đặt phòng
    return await reservationRepository.create(reservationData);
  }

  async getReservationById(id) {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Không tìm thấy lịch đặt phòng');
    }
    return reservation;
  }

  async updateReservation(id, userId, reservationData, isAdmin = false) {
    // Kiểm tra lịch đặt có tồn tại
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Không tìm thấy lịch đặt phòng');
    }

    // Kiểm tra người dùng có quyền cập nhật (chủ sở hữu hoặc admin)
    if (reservation.userId !== userId && !isAdmin) {
      throw new Error('Bạn không có quyền cập nhật lịch đặt này');
    }

    // Không cho phép cập nhật khi đã check-in
    if (reservation.checkInTime && !isAdmin) {
      throw new Error('Không thể cập nhật lịch đặt đã check-in');
    }

    // Kiểm tra xung đột nếu thay đổi thời gian hoặc phòng
    if (
      (reservationData.startTime && reservationData.startTime !== reservation.startTime) ||
      (reservationData.endTime && reservationData.endTime !== reservation.endTime) ||
      (reservationData.roomId && reservationData.roomId !== reservation.roomId)
    ) {
      const startTime = reservationData.startTime || reservation.startTime;
      const endTime = reservationData.endTime || reservation.endTime;
      const roomId = reservationData.roomId || reservation.roomId;

      const conflictReservations = await reservationRepository.findOverlapping(
        roomId,
        startTime,
        endTime,
        id
      );

      if (conflictReservations.length > 0) {
        throw new Error('Phòng học đã được đặt trong khoảng thời gian này');
      }
    }

    return await reservationRepository.update(id, reservationData);
  }

  async cancelReservation(id, userId, isAdmin = false) {
    // Kiểm tra lịch đặt có tồn tại
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Không tìm thấy lịch đặt phòng');
    }

    // Kiểm tra người dùng có quyền hủy (chủ sở hữu hoặc admin)
    if (reservation.userId !== userId && !isAdmin) {
      throw new Error('Bạn không có quyền hủy lịch đặt này');
    }

    // Không cho phép hủy khi đã check-in
    if (reservation.checkInTime && !isAdmin) {
      throw new Error('Không thể hủy lịch đặt đã check-in');
    }

    return await reservationRepository.updateStatus(id, 'cancelled');
  }

  async getUserReservations(userId, status = null) {
    const options = {};
    if (status) {
      options.where = { status };
    }
    
    // Sắp xếp theo thời gian bắt đầu
    options.order = [['startTime', 'ASC']];
    
    return await reservationRepository.findByUserId(userId, options);
  }

  async checkIn(id, userId, isAdmin = false) {
    // Kiểm tra lịch đặt có tồn tại
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Không tìm thấy lịch đặt phòng');
    }

    // Kiểm tra người dùng có quyền check-in (chủ sở hữu hoặc admin)
    if (reservation.userId !== userId && !isAdmin) {
      throw new Error('Bạn không có quyền check-in lịch đặt này');
    }

    // Chỉ cho phép check-in trước 15 phút so với giờ bắt đầu
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const diffMinutes = (startTime - now) / (60 * 1000);
    
    if (diffMinutes > 15 && !isAdmin) {
      throw new Error('Chỉ có thể check-in trước 15 phút so với giờ bắt đầu');
    }

    // Cập nhật trạng thái phòng
    await roomRepository.updateStatus(reservation.roomId, 'occupied');
    
    return await reservationRepository.checkIn(id);
  }

  async checkOut(id, userId, isAdmin = false) {
    // Kiểm tra lịch đặt có tồn tại
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Không tìm thấy lịch đặt phòng');
    }

    // Kiểm tra người dùng có quyền check-out (chủ sở hữu hoặc admin)
    if (reservation.userId !== userId && !isAdmin) {
      throw new Error('Bạn không có quyền check-out lịch đặt này');
    }

    // Kiểm tra đã check-in chưa
    if (!reservation.checkInTime) {
      throw new Error('Lịch đặt chưa được check-in');
    }

    // Cập nhật trạng thái phòng
    await roomRepository.updateStatus(reservation.roomId, 'available');
    
    return await reservationRepository.checkOut(id);
  }

  async getAllReservations(filters = {}) {
    const options = {};
    
    // Áp dụng các bộ lọc
    if (filters.status) {
      options.where = { ...options.where, status: filters.status };
    }
    
    if (filters.startDate && filters.endDate) {
      options.where = {
        ...options.where,
        startTime: {
          [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
        }
      };
    }
    
    if (filters.roomId) {
      options.where = { ...options.where, roomId: filters.roomId };
    }

    // Sắp xếp theo thời gian bắt đầu
    options.order = [['startTime', 'ASC']];
    
    return await reservationRepository.findAll(options);
  }
  
  async getReservationsByStatusAndStartTime(status, startTimeFrom, startTimeTo, options = {}) {
    try {
      const query = {
        where: {
          status: status
        },
        ...options
      };
      
      // Nếu có startTimeFrom và startTimeTo, thêm điều kiện lọc theo thời gian bắt đầu
      if (startTimeFrom || startTimeTo) {
        query.where.startTime = {};
        
        if (startTimeFrom) {
          query.where.startTime[Op.gte] = startTimeFrom;
        }
        
        if (startTimeTo) {
          query.where.startTime[Op.lte] = startTimeTo;
        }
      }
      
      // Thực hiện truy vấn với điều kiện đã xây dựng
      const reservations = await Reservation.findAll(query);
      return reservations;
    } catch (error) {
      console.error('Error getting reservations by status and start time:', error);
      throw error;
    }
  }

  async getOverdueCheckedInReservations(options = {}) {
    try {
      const now = new Date();
      
      const query = {
        where: {
          status: 'checked-in',
          endTime: {
            [Op.lt]: now // Lấy những phòng có thời gian kết thúc trước thời điểm hiện tại
          }
        },
        ...options
      };
      
      // Thực hiện truy vấn với điều kiện đã xây dựng
      const reservations = await reservationRepository.findAll(query);
      return reservations;
    } catch (error) {
      console.error('Error getting overdue checked-in reservations:', error);
      throw error;
    }
  }

}

module.exports = new ReservationService();