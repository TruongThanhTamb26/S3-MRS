-- Create database
DROP DATABASE IF EXISTS smart_study_space_db;
CREATE DATABASE IF NOT EXISTS smart_study_space_db;
USE smart_study_space_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  fullName VARCHAR(100),
  email VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Chỉ mục username để đăng nhập và tránh trùng
  CONSTRAINT username_unique UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 4,
  status VARCHAR(20) DEFAULT 'available',
  description TEXT,
  
  -- Tên phòng có thể unique nếu phòng có mã riêng (VD: B1-101).
  CONSTRAINT room_name_unique UNIQUE (room_name)
);

CREATE INDEX idx_room_status ON rooms(status);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status VARCHAR(20) DEFAULT 'booked',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_reservation_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_reservation_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_reservation_start ON reservations(start_time);
CREATE INDEX idx_reservation_end ON reservations(end_time);
CREATE INDEX idx_reservation_status ON reservations(status);
CREATE INDEX idx_reservation_room ON reservations(room_id);
CREATE INDEX idx_reservation_user ON reservations(user_id);

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_name VARCHAR(100) NOT NULL,
  room_id INT,
  status VARCHAR(20) DEFAULT 'working',
  description TEXT,
  
  CONSTRAINT fk_device_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX idx_device_status ON devices(status);

-- Create sample data
-- Admin user with password: admin123
INSERT INTO users (username, password, role, fullName, email) VALUES 
('admin', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'admin', 'Admin User', 'admin@example.com');

-- Regular student users
INSERT INTO users (username, password, role, fullName, email) VALUES 
('student1', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'student', 'Student One', 'student1@example.com'),
('student2', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'student', 'Student Two', 'student2@example.com');

-- Demo rooms
INSERT INTO rooms (room_name, capacity, status, description) VALUES 
('B1-101', 10, 'available', 'A small meeting room suitable for team discussions'),
('B2-201', 30, 'available', 'Computer lab with 30 workstations'),
('C3-301', 4, 'available', 'Small quiet study room for group work');

-- Demo devices
INSERT INTO devices (device_name, room_id, status, description) VALUES 
('Projector LG-P750', 1, 'working', 'HD projector with HDMI connection'),
('Smart Board SB-2000', 2, 'working', 'Interactive whiteboard with touch screen'),
('Air Conditioner Daikin', 3, 'working', 'Split AC unit 12000 BTU'),
('Desktop PC i5-10600', 2, 'working', '16GB RAM, 512GB SSD, Windows 11');

-- Sample reservations
INSERT INTO reservations (user_id, room_id, start_time, end_time, status) VALUES 
(2, 1, '2023-10-15 09:00:00', '2023-10-15 11:00:00', 'completed'),
(3, 2, '2023-10-16 13:00:00', '2023-10-16 15:00:00', 'booked'),
(2, 3, '2023-10-17 10:00:00', '2023-10-17 12:00:00', 'checked_in');