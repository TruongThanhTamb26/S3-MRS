const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Tạo kết nối Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Tên database
  process.env.DB_USER,      // Username
  process.env.DB_PASSWORD,  // Password
  {
    host: process.env.DB_HOST,  // Host
    dialect: 'mysql',           // Loại DB là MySQL
    // Thiết lập múi giờ GMT+7
    timezone: '+07:00',
    dialectOptions: {
      // Đảm bảo timezone được áp dụng cho truy vấn MySQL
      timezone: '+07:00',
    },
    // Cấu hình connection pool
    pool: {
      max: 10,     // Tối đa 10 connections
      min: 0,      // Tối thiểu 0 connections
      acquire: 30000,  // Timeout khi lấy connection (30s)
      idle: 10000      // Thời gian connection không dùng trước khi đóng (10s)
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Hàm kiểm tra kết nối
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');
  } catch (error) {
    console.error('Không thể kết nối đến database:', error);
  }
};

// Gọi hàm kiểm tra
testConnection();

module.exports = sequelize;