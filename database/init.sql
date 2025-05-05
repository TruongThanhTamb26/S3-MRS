-- Tạo database
CREATE DATABASE IF NOT EXISTS s3_mrs;
USE s3_mrs;

-- Tạo bảng User
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('student', 'admin', 'technician') DEFAULT 'student',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng Room
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 1,
  location VARCHAR(100) NOT NULL,
  status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  equipment JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng Reservation
CREATE TABLE IF NOT EXISTS reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  roomId INT NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  status ENUM('confirmed', 'checked-in', 'completed', 'cancelled') DEFAULT 'confirmed',
  notes TEXT,
  capacity INT NOT NULL DEFAULT 1,
  checkInTime DATETIME NULL,
  checkOutTime DATETIME NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (roomId) REFERENCES rooms(id)
);

-- Thêm 10 phòng mẫu với thiết bị khác nhau
INSERT INTO rooms (name, capacity, location, status, equipment) VALUES
(
  'H1.101', 
  30, 
  'CS1', 
  'available',
  '{"Mic": 2, "Projector": 1, "AirCon": 1}'
),
(
  'H1.102', 
  40, 
  'CS1', 
  'available',
  '{"Mic": 1, "Projector": 1, "AirCon": 2}'
),
(
  'H1.103', 
  60, 
  'CS1', 
  'available',
  '{"Mic": 3, "Projector": 2, "AirCon": 2}'
),
(
  'B1.101', 
  25, 
  'CS2', 
  'maintenance',
  '{"Mic": 1, "Projector": 1, "AirCon": 1}'
),
(
  'B1.102', 
  50, 
  'CS2', 
  'available',
  '{"Mic": 2, "Projector": 1, "AirCon": 2}'
),
(
  'B1.103', 
  30, 
  'CS2', 
  'available',
  '{"Mic": 1, "Projector": 1, "AirCon": 1}'
),
(
  'B2.101', 
  100, 
  'CS2', 
  'available',
  '{"Mic": 4, "Projector": 2, "AirCon": 4}'
),
(
  'B2.102', 
  45, 
  'CS2', 
  'occupied',
  '{"Mic": 2, "Projector": 1, "AirCon": 2}'
),
(
  'B3.101', 
  70, 
  'CS2', 
  'available',
  '{"Mic": 3, "Projector": 2, "AirCon": 3}'
),
(
  'B3.102', 
  120, 
  'CS2', 
  'available',
  '{"Mic": 5, "Projector": 3, "AirCon": 6}'
);