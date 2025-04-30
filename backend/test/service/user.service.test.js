const userService = require('../../src/services/user.service');
const User = require('../../src/models/user.model');
const sequelize = require('../../src/config/database');

async function testUserService() {
  try {
    // Đồng bộ model với DB
    await sequelize.sync({ force: true });
    console.log('✅ Đã đồng bộ bảng User');

    // Test đăng ký
    console.log('Testing register...');
    const userData = {
      username: 'servicetest',
      password: 'Password123',
      fullName: 'Service Test',
      email: 'servicetest@example.com',
      role: 'student',
    };
    
    const user = await userService.register(userData);
    console.log('✅ Đăng ký thành công:', user.id, user.username);

    // Test đăng nhập
    console.log('Testing login...');
    const loginResult = await userService.login('servicetest', 'Password123');
    console.log(`✅ Đăng nhập: ${loginResult.token ? 'Thành công' : 'Thất bại'}`);

    // Test lấy profile
    console.log('Testing getProfile...');
    const profile = await userService.getProfile(user.id);
    console.log(`✅ Lấy profile: ${profile.id === user.id ? 'Thành công' : 'Thất bại'}`);

    // Test cập nhật profile
    console.log('Testing updateProfile...');
    const updatedProfile = await userService.updateProfile(user.id, { fullName: 'Updated Service Name' });
    console.log(`✅ Cập nhật profile: ${updatedProfile.fullName === 'Updated Service Name' ? 'Thành công' : 'Thất bại'}`);

    // Xóa test data
    await User.destroy({ where: { id: user.id } });
    console.log('✅ Đã xóa dữ liệu test');

  } catch (error) {
    console.error('❌ Lỗi khi test User service:', error);
  } finally {
    await sequelize.close();
  }
}

testUserService();