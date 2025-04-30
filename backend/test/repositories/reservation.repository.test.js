const reservationRepository = require('../../src/repositories/reservation.repository');
const User = require('../../src/models/user.model');
const Room = require('../../src/models/room.model');
const Reservation = require('../../src/models/reservation.model');
const sequelize = require('../../src/config/database');

async function testReservationRepository() {
  try {
    // Đồng bộ model với DB
    await sequelize.sync({ force: true });
    console.log('✅ Đã đồng bộ các bảng');

    // Tạo test data
    const user = await User.create({
      username: 'repotest',
      password: 'Password123',
      fullName: 'Repository Test',
      email: 'repotest@example.com',
      role: 'student',
    });

    const room = await Room.create({
      name: 'B2-01',
      capacity: 25,
      location: 'Tòa B - Tầng 2',
      status: 'available',
      equipment: JSON.stringify({
        hasProjector: true
      }),
      roomType: 'individual'
    });

    // Test tạo đặt phòng
    console.log('Testing create reservation...');
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2);
    
    const reservationData = {
      UserId: user.id,
      RoomId: room.id,
      startTime,
      endTime,
      status: 'pending',
      purpose: 'Testing reservation',
      participantsCount: 1
    };
    
    const reservation = await reservationRepository.create(reservationData);
    console.log('✅ Đã tạo đặt phòng:', reservation.id);

    // Test tìm theo ID
    console.log('Testing findById...');
    const foundById = await reservationRepository.findById(reservation.id);
    console.log(`✅ Tìm đặt phòng theo ID: ${foundById ? 'Thành công' : 'Thất bại'}`);

    // Test tìm theo userId
    console.log('Testing findByUserId...');
    const userReservations = await reservationRepository.findByUserId(user.id);
    console.log(`✅ Tìm đặt phòng theo userId: ${userReservations.length > 0 ? 'Thành công' : 'Thất bại'}`);

    // Test tìm theo roomId
    console.log('Testing findByRoomId...');
    const roomReservations = await reservationRepository.findByRoomId(room.id);
    console.log(`✅ Tìm đặt phòng theo roomId: ${roomReservations.length > 0 ? 'Thành công' : 'Thất bại'}`);

    // Test check-in
    console.log('Testing checkIn...');
    const checkedIn = await reservationRepository.checkIn(reservation.id);
    console.log(`✅ Check-in: ${checkedIn.checkInTime ? 'Thành công' : 'Thất bại'}`);

    // Test check-out
    console.log('Testing checkOut...');
    const checkedOut = await reservationRepository.checkOut(reservation.id);
    console.log(`✅ Check-out: ${checkedOut.checkOutTime ? 'Thành công' : 'Thất bại'}`);

    // Xóa test data
    await reservation.destroy();
    await room.destroy();
    await user.destroy();
    console.log('✅ Đã xóa dữ liệu test');

  } catch (error) {
    console.error('❌ Lỗi khi test Reservation repository:', error);
  } finally {
    await sequelize.close();
  }
}

testReservationRepository();