const roomRepository = require('../repositories/room.repository');
const reservationRepository = require('../repositories/reservation.repository');
const { Op } = require('sequelize');

class RoomService {
  async getAllRooms(filters = {}) {
    const options = {};
    
    // Áp dụng các bộ lọc
    if (filters.status) {
      options.where = { ...options.where, status: filters.status };
    }
    
    if (filters.capacity) {
      options.where = { ...options.where, capacity: { [Op.gte]: filters.capacity } };
    }

    return await roomRepository.findAll(options);
  }

  async getRoomById(id) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng học');
    }
    return room;
  }

  async createRoom(roomData) {
    // Kiểm tra tên phòng đã tồn tại
    const existingRoom = await roomRepository.findByName(roomData.name);
    if (existingRoom) {
      throw new Error('Tên phòng đã tồn tại');
    }

    return await roomRepository.create(roomData);
  }

  async updateRoom(id, roomData) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng học');
    }

    // Nếu cập nhật tên phòng, kiểm tra tên mới đã tồn tại
    if (roomData.name && roomData.name !== room.name) {
      const existingRoom = await roomRepository.findByName(roomData.name);
      if (existingRoom) {
        throw new Error('Tên phòng đã tồn tại');
      }
    }

    return await roomRepository.update(id, roomData);
  }

  async deleteRoom(id) {
    // Kiểm tra phòng có lịch đặt chưa
    const reservations = await reservationRepository.findByRoomId(id, {
      where: {
        status: {
          [Op.in]: ['confirmed']
        }
      }
    });

    console.log(id, reservations);

    if (reservations.length > 0) {
      throw new Error('Không thể xóa phòng đang có lịch đặt');
    }

    const result = await roomRepository.delete(id);
    if (!result) {
      throw new Error('Không tìm thấy phòng học');
    }

    return { message: 'Xóa phòng thành công' };
  }

  async updateRoomStatus(id, status) {
    const validStatuses = ['available', 'occupied', 'maintenance'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái phòng không hợp lệ');
    }

    const room = await roomRepository.updateStatus(id, status);
    if (!room) {
      throw new Error('Không tìm thấy phòng học');
    }

    return room;
  }

  async findAvailableRooms(startTime, endTime, capacity = 1) {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    return await roomRepository.findAvailableRooms(startTime, endTime, capacity);
  }
}

module.exports = new RoomService();