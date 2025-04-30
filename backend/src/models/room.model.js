const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
    defaultValue: 'available'
  },
  equipment: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of available equipment in the room'
  },
  roomType: {
    type: DataTypes.ENUM('individual', 'group', 'mentoring'),
    allowNull: false,
    defaultValue: 'individual'
  }
});

module.exports = Room;