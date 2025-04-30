const User = require('../../src/models/user.model');
const sequelize = require('../../src/config/database');

async function testUserModel() {
  try {

    // Tắt kiểm tra ràng buộc foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Đồng bộ model với DB
    await User.sync({ force: true });
    console.log('✅ Đã đồng bộ bảng User');

    // Bật lại kiểm tra foreign key
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Tạo user mẫu
    const testUser = await User.create({
      username: 'testuser',
      password: 'Password123',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'student',
    });

    console.log('✅ Đã tạo user:', testUser.toJSON());

    // Kiểm tra mã hóa mật khẩu
    console.log('Kiểm tra mã hóa mật khẩu...');
    const isMatch = await testUser.comparePassword('Password123');
    console.log(`✅ Kiểm tra mật khẩu: ${isMatch ? 'ĐÚNG' : 'SAI'}`);

    // Xóa user test
    await testUser.destroy();
    console.log('✅ Đã xóa user test');

  } catch (error) {
    console.error('❌ Lỗi khi test User model:', error);
  } finally {
    await sequelize.close();
  }
}

testUserModel();