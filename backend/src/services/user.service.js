const userRepository = require('../repositories/user.repository');
const jwt = require('jsonwebtoken');

class UserService {
  async register(userData) {
    // Kiểm tra username đã tồn tại
    const existingUser = await userRepository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username đã tồn tại');
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email đã tồn tại');
    }

    // Tạo người dùng mới
    return await userRepository.create(userData);
  }

  async login(username, password) {
    // Tìm người dùng theo username
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Tên người dùng không tồn tại');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Mật khẩu không đúng');
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Loại bỏ mật khẩu trước khi trả về
    const { password, ...userProfile } = user.toJSON();
    return userProfile;
  }

  async updateProfile(userId, userData) {
    // Không cho phép cập nhật mật khẩu qua API này
    if (userData.password) {
      delete userData.password;
    }

    // Không cho phép thay đổi vai trò
    if (userData.role) {
      delete userData.role;
    }

    return await userRepository.update(userId, userData);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    // Cập nhật mật khẩu mới
    return await userRepository.update(userId, { password: newPassword });
  }

  async getAllUsers(role = null) {
    const options = {
      attributes: ['id', 'username', 'fullName', 'email', 'role']
    };
    
    if (role) {
      options.where = { role };
    }
    
    return await userRepository.findAll(options);
  }
}

module.exports = new UserService();