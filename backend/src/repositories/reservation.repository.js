const { Reservation, User, Room } = require('../models');
const { Op } = require('sequelize');

class ReservationRepository {
  async findById(id) {
    return await Reservation.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'fullName'] },
        { model: Room, attributes: ['id', 'name', 'capacity', 'location'] }
      ]
    });
  }

  async create(reservationData) {
    return await Reservation.create(reservationData);
  }

  async update(id, reservationData) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    return await reservation.update(reservationData);
  }

  async delete(id) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return false;
    await reservation.destroy();
    return true;
  }

  async findAll(options = {}) {
    const query = {
      include: [
        { model: User, attributes: ['id', 'username', 'fullName'] },
        { model: Room, attributes: ['id', 'name', 'capacity', 'location'] }
      ],
      ...options
    };
    return await Reservation.findAll(query);
  }

  async findByUserId(userId, options = {}) {
    return await Reservation.findAll({
      where: { userId },
      include: [
        { model: Room, attributes: ['id', 'name', 'capacity', 'location'] }
      ],
      ...options
    });
  }

  async findByRoomId(roomId, options = {}) {
    return await Reservation.findOne({
      where: { roomId },
      include: [
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ],
      ...options
    });
  }

  async findOverlapping(roomId, startTime, endTime, excludeId = null) {
    const adjustedStartTime = new Date(startTime);
    adjustedStartTime.setMinutes(adjustedStartTime.getMinutes() + 1);
    const adjustedEndTime = new Date(endTime);
    adjustedEndTime.setMinutes(adjustedEndTime.getMinutes() - 1);
    const where = {
      roomId,
      [Op.or]: [
        { startTime: { [Op.between]: [adjustedStartTime, adjustedEndTime] } },
        { endTime: { [Op.between]: [adjustedStartTime, adjustedEndTime] } },
        {
          [Op.and]: [
            { startTime: { [Op.lte]: adjustedStartTime } },
            { endTime: { [Op.gte]: adjustedEndTime } }
          ]
        }
      ],
      status: { [Op.in]: ['confirmed'] }
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    return await Reservation.findAll({ where });
  }

  async updateStatus(id, status) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    return await reservation.update({ status });
  }

  async checkIn(id) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    return await reservation.update({
      checkInTime: new Date(),
      status: 'checked-in'
    });
  }

  async checkOut(id) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    return await reservation.update({
      checkOutTime: new Date(),
      status: 'completed'
    });
  }
}

module.exports = new ReservationRepository();