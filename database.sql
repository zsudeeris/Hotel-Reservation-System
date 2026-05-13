CREATE DATABASE IF NOT EXISTS hotel_reservation;

USE hotel_reservation;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  description TEXT,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  room_id INT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INT NOT NULL,
  total_price DECIMAL(10,2),
  status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
  reservation_source ENUM('MANUAL', 'CHATBOT') DEFAULT 'MANUAL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

INSERT IGNORE INTO users (id, name, email, password, role)
VALUES
(1, 'Test User', 'test@test.com', '123456', 'USER');

INSERT IGNORE INTO rooms 
(id, room_number, room_type, capacity, price_per_night, description, status)
VALUES
(1, '101', 'Standard', 2, 1500.00, 'Standard room for 2 guests', 'ACTIVE'),
(2, '102', 'Deluxe', 3, 2500.00, 'Deluxe room for 3 guests', 'ACTIVE'),
(3, '201', 'Suite', 4, 4000.00, 'Suite room for 4 guests', 'ACTIVE');

SELECT * FROM rooms;