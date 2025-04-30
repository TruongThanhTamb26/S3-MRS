const userRepository = require('../../src/repositories/user.repository');
const User = require('../../src/models/user.model');
const sequelize = require('../../src/config/database');

async function testUserRepository() {
  try {
    // Tắt kiểm tra ràng buộc foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Đồng bộ model với DB
    await User.sync({ force: true });
    console.log('✅ Đã đồng bộ bảng User');

    // Bật lại kiểm tra foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Test tạo user
    console.log('Testing create user...');
    const userData = {
      username: 'repotest',
      password: 'Password123',
      fullName: 'Repository Test',
      email: 'repotest@example.com',
      role: 'student',
    };
    const user = await userRepository.create(userData);
    console.log('✅ Đã tạo user:', user.id, user.username);

    // Test tìm user theo ID
    console.log('Testing findById...');
    const foundById = await userRepository.findById(user.id);
    console.log(`✅ Tìm user theo ID: ${foundById ? 'Thành công' : 'Thất bại'}`);

    // Test tìm user theo username
    console.log('Testing findByUsername...');
    const foundByUsername = await userRepository.findByUsername('repotest');
    console.log(`✅ Tìm user theo username: ${foundByUsername ? 'Thành công' : 'Thất bại'}`);

    // Test cập nhật user
    console.log('Testing update...');
    const updatedUser = await userRepository.update(user.id, { fullName: 'Updated Name' });
    console.log(`✅ Cập nhật user: ${updatedUser.fullName === 'Updated Name' ? 'Thành công' : 'Thất bại'}`);

    // Test xóa user
    console.log('Testing delete...');
    const deleteResult = await userRepository.delete(user.id);
    console.log(`✅ Xóa user: ${deleteResult ? 'Thành công' : 'Thất bại'}`);

  } catch (error) {
    console.error('❌ Lỗi khi test User repository:', error);
  } finally {
    await sequelize.close();
  }
}

testUserRepository();