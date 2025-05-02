const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Room = require('./room.model');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
    defaultValue: 'confirmed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Định nghĩa mối quan hệ
Room.hasMany(Reservation, { foreignKey: 'roomId' });
Reservation.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

module.exports = Reservation;