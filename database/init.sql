-- Create database
DROP DATABASE IF EXISTS smart_study_space_db;
CREATE DATABASE IF NOT EXISTS smart_study_space_db;
USE smart_study_space_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  role ENUM('student', 'admin', 'technician') DEFAULT 'student',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT username_unique UNIQUE (username),
  CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  location VARCHAR(100) NOT NULL,
  status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  equipment JSON,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT room_name_unique UNIQUE (name)
);

CREATE INDEX idx_room_status ON rooms(status);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  roomId INT,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
  notes TEXT,
  capacity INT NOT NULL DEFAULT 1,
  checkInTime DATETIME,
  checkOutTime DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_reservation_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_reservation_room
    FOREIGN KEY (roomId) REFERENCES rooms(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_reservation_start ON reservations(startTime);
CREATE INDEX idx_reservation_end ON reservations(endTime);
CREATE INDEX idx_reservation_status ON reservations(status);
CREATE INDEX idx_reservation_room ON reservations(roomId);
CREATE INDEX idx_reservation_user ON reservations(userId);

-- Create sample data
-- Admin user with password: admin123 (hashed)
INSERT INTO users (username, password, fullName, email, role) VALUES 
('admin', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'Admin User', 'admin@example.com', 'admin');

-- Regular student users
INSERT INTO users (username, password, fullName, email, role) VALUES 
('student1', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'Student One', 'student1@example.com', 'student'),
('student2', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'Student Two', 'student2@example.com', 'student'),
('technician1', '$2a$10$XuFPtbJiiuzs7L1yXG7vEO8SBRvCGbxe5qOqJW/63rh6lR56c9SMC', 'Tech Support', 'tech@example.com', 'technician');

-- Demo rooms with equipment as JSON 
INSERT INTO rooms (name, capacity, location, status, equipment) VALUES 
('B1-101', 10, 'CS2', 'available', '{"Projector": 1, "AirCon": 1, "Mic": 1}'),
('B2-201', 30, 'CS2', 'available', '{"Projector": 1, "AirCon": 1, "Mic": 1}'),
('C3-301', 4, 'CS1', 'available', '{"Projector": 0, "AirCon": 3, "Mic": 2}');

-- Sample reservations
INSERT INTO reservations (userId, roomId, startTime, endTime, status, capacity, checkInTime, checkOutTime) VALUES 
(2, 1, '2023-10-15 09:00:00', '2023-10-15 11:00:00', 'completed', 5, '2023-10-15 08:55:00', '2023-10-15 11:05:00'),
(3, 2, '2023-10-16 13:00:00', '2023-10-16 15:00:00', 'confirmed', 20, '2023-10-16 12:55:00', NULL),
(2, 3, '2023-10-17 10:00:00', '2023-10-17 12:00:00', 'confirmed', 3, NULL, NULL);