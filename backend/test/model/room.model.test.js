const Room = require('../../src/models/room.model');
const sequelize = require('../../src/config/database');

async function testRoomModel() {
  try {
    // Tắt kiểm tra ràng buộc foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Đồng bộ model với DB
    await Room.sync({ force: true });
    console.log('✅ Đã đồng bộ bảng User');

    // Bật lại kiểm tra foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

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

    console.log('✅ Đã tạo phòng:', testRoom.toJSON());

    // Thử cập nhật trạng thái phòng
    await testRoom.update({ status: 'maintenance' });
    console.log('✅ Đã cập nhật trạng thái phòng:', testRoom.toJSON());

    // Xóa room test
    await testRoom.destroy();
    console.log('✅ Đã xóa phòng test');

  } catch (error) {
    console.error('❌ Lỗi khi test Room model:', error);
  } finally {
    await sequelize.close();
  }
}

testRoomModel();