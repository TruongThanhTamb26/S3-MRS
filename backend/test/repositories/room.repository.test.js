const roomRepository = require('../../src/repositories/room.repository');
const Room = require('../../src/models/room.model');
const sequelize = require('../../src/config/database');

async function testRoomRepository() {
  try {
    // Tắt kiểm tra ràng buộc foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Đồng bộ model với DB
    await Room.sync({ force: true });
    console.log('✅ Đã đồng bộ bảng User');

    // Bật lại kiểm tra foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Test tạo room
    console.log('Testing create room...');
    const roomData = {
      name: 'B2-01',
      capacity: 25,
      location: 'Tòa B - Tầng 2',
      status: 'available',
      equipment: JSON.stringify({
        hasProjector: true,
        hasAirCon: true
      }),
    };
    const room = await roomRepository.create(roomData);
    console.log('✅ Đã tạo phòng:', room.id, room.name);

    // Test tìm room theo ID
    console.log('Testing findById...');
    const foundById = await roomRepository.findById(room.id);
    console.log(`✅ Tìm phòng theo ID: ${foundById ? 'Thành công' : 'Thất bại'}`);

    // Test tìm room theo name
    console.log('Testing findByName...');
    const foundByName = await roomRepository.findByName('B2-01');
    console.log(`✅ Tìm phòng theo tên: ${foundByName ? 'Thành công' : 'Thất bại'}`);

    // Test cập nhật trạng thái room
    console.log('Testing updateStatus...');
    const updatedRoom = await roomRepository.updateStatus(room.id, 'maintenance');
    console.log(`✅ Cập nhật trạng thái: ${updatedRoom.status === 'maintenance' ? 'Thành công' : 'Thất bại'}`);

    // Test xóa room
    console.log('Testing delete...');
    const deleteResult = await roomRepository.delete(room.id);
    console.log(`✅ Xóa phòng: ${deleteResult ? 'Thành công' : 'Thất bại'}`);

  } catch (error) {
    console.error('❌ Lỗi khi test Room repository:', error);
  } finally {
    await sequelize.close();
  }
}

testRoomRepository();