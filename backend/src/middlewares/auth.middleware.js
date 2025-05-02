const jwt = require('jsonwebtoken');

const authMiddleware = {
  verifyToken: (req, res, next) => {
    try {
      // Lấy token từ header
      const bearerHeader = req.headers['authorization'];
      if (!bearerHeader) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy token xác thực'
        });
      }

      // Kiểm tra định dạng Bearer token
      const bearer = bearerHeader.split(' ');
      if (bearer.length !== 2 || bearer[0] !== 'Bearer') {
        return res.status(401).json({
          success: false,
          message: 'Định dạng token không hợp lệ'
        });
      }

      const token = bearer[1];

      // Xác thực token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn'
          });
        }

        // Lưu thông tin người dùng vào request để sử dụng trong các middleware khác
        req.user = decoded;
        next();
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác thực',
        error: error.message
      });
    }
  },

  isAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }
    next();
  },

  isTechnician: (req, res, next) => {
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }
    next();
  }
};

module.exports = authMiddleware;