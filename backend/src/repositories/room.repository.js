const { Room } = require('../models');
const { Op } = require('sequelize');

class RoomRepository {
  async findById(id) {
    return await Room.findByPk(id);
  }

  async findByName(name) {
    return await Room.findOne({ where: { name } });
  }

  async create(roomData) {
    return await Room.create(roomData);
  }

  async update(id, roomData) {
    const room = await Room.findByPk(id);
    if (!room) return null;
    return await room.update(roomData);
  }

  async delete(id) {
    const room = await Room.findByPk(id);
    if (!room) return false;
    await room.destroy();
    return true;
  }

  async findAll(options = {}) {
    return await Room.findAll(options);
  }

  async findAvailableRooms(startTime, endTime, capacity = 1) {
    // Tìm các phòng chưa được đặt trong khoảng thời gian này
    const reservedRoomIds = await this.findReservedRoomIds(startTime, endTime);
    
    return await Room.findAll({
      where: {
        id: { [Op.notIn]: reservedRoomIds },
        status: 'available',
        capacity: { [Op.gte]: capacity }
      }
    });
  }

  async findReservedRoomIds(startTime, endTime) {
    const { Reservation } = require('../models');
    const reservations = await Reservation.findAll({
      where: {
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime, endTime] }
          },
          {
            endTime: { [Op.between]: [startTime, endTime] }
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } }
            ]
          }
        ],
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      attributes: ['roomId']
    });

    return reservations.map(res => res.roomId);
  }

  async updateStatus(id, status) {
    const room = await Room.findByPk(id);
    if (!room) return null;
    return await room.update({ status });
  }
}

module.exports = new RoomRepository();