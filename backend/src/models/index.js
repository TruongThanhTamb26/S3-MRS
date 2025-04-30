const User = require('./user.model');
const Room = require('./room.model');
const Reservation = require('./reservation.model');

// Đảm bảo mô hình được đồng bộ với database
const syncModels = async () => {
  try {
    await User.sync();
    await Room.sync();
    await Reservation.sync();
    console.log('Models synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

module.exports = {
  User,
  Room,
  Reservation,
  syncModels
};