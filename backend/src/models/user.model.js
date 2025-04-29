const db = require('../config/database');

class User {
  static async findAll() {
    const [rows] = await db.query('SELECT id, name, email, role FROM users');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'user']
    );
    return result.insertId;
  }
  
  // Thêm các phương thức khác như update, delete, etc.
}

module.exports = User;