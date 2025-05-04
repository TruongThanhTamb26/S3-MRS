const { create } = require('../repositories/reservation.repository');
const userService = require('../services/user.service');

class UserController {
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await userService.register(userData);
      
      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await userService.login(username, password);
      
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const userProfile = await userService.getProfile(userId);
      
      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const userData = req.body;
      const updatedUser = await userService.updateProfile(userId, userData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      await userService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin endpoints
  async getAllUsers(req, res) {
    try {
      const { role } = req.query;
      const users = await userService.getAllUsers(role);
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const userProfile = await userService.getProfile(parseInt(id));
      
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async updateUserById(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // Gọi service để cập nhật thông tin người dùng
      const updatedUser = await userService.updateUserById(parseInt(id), userData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin người dùng thành công',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Gọi service để xóa người dùng
      const deleted = await userService.deleteUserById(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();