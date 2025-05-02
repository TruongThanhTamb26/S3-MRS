const Reservation = require('../../src/models/reservation.model');
const User = require('../../src/models/user.model');
const Room = require('../../src/models/room.model');
const sequelize = require('../../src/config/database');

async function testReservationModel() {
  try {
    // Đồng bộ model với DB
    await sequelize.sync({ force: true });
    console.log('✅ Đã đồng bộ các bảng');

    // Tạo user mẫu
    const testUser = await User.create({
      username: 'testuser',
      password: 'Password123',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'student',
    });

    // Tạo room mẫu
    const testRoom = await Room.create({
      name: 'B1-01',
      capacity: 30,
      location: 'Tòa B - Tầng 1',
      status: 'available',
      equipment: JSON.stringify({
        hasProjector: true,
        hasAirCon: true,
        hasWhiteboard: true
      }),
    });

    // Tạo reservation mẫu
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2); // Đặt 2 tiếng

    const testReservation = await Reservation.create({
      UserId: testUser.id,
      RoomId: testRoom.id,
      startTime,
      endTime,
      status: 'confirmed',
      capacity: 5
    });

    console.log('✅ Đã tạo đặt phòng:', testReservation.toJSON());

    // Kiểm tra mối quan hệ
    const reservationWithAssociations = await Reservation.findByPk(testReservation.id, {
      include: [User, Room]
    });
    console.log('✅ Đặt phòng với người dùng và phòng:', 
      JSON.stringify({
        id: reservationWithAssociations.id,
        user: reservationWithAssociations.User ? reservationWithAssociations.User.username : null,
        room: reservationWithAssociations.Room ? reservationWithAssociations.Room.name : null
      }, null, 2)
    );

    // Xóa dữ liệu test
    await testReservation.destroy();
    await testRoom.destroy();
    await testUser.destroy();
    console.log('✅ Đã xóa dữ liệu test');

  } catch (error) {
    console.error('❌ Lỗi khi test Reservation model:', error);
  } finally {
    await sequelize.close();
  }
}

testReservationModel();