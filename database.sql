CREATE DATABASE IF NOT EXISTS hotel_reservation;
USE hotel_reservation;

DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  role ENUM('USER', 'ADMIN', 'HOTEL_MANAGER') DEFAULT 'USER',
  two_factor_code VARCHAR(6),
  two_factor_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  manager_id INT,
  hotel_name VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  district VARCHAR(120),
  address VARCHAR(255),
  description TEXT,
  score DECIMAL(3,1) DEFAULT 9.0,
  label VARCHAR(40) DEFAULT 'Excellent',
  reviews VARCHAR(60) DEFAULT '100 reviews',
  price VARCHAR(60) DEFAULT 'Price from EUR 250',
  img VARCHAR(500),
  status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  room_number VARCHAR(20),
  room_type VARCHAR(80) NOT NULL,
  capacity INT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  total_rooms INT DEFAULT 1,
  description TEXT,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INT NOT NULL,
  total_price DECIMAL(10,2),
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
  reservation_source ENUM('MANUAL', 'CHATBOT') DEFAULT 'MANUAL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

INSERT INTO users (id, name, email, password, phone, role)
VALUES
(1, 'Test User', 'test@test.com', 'scrypt:32768:8:1$Gw6S3vLozbXDVqSq$ff053f8a2bbd8690d1652de1e80707462e6bda8707bf1bdd7d59a99f7c033d1524ca384e38374a726ca7acdabc01bea294ef053978cfd12fed7b6b597f05e289', '+905551112233', 'USER'),
(2, 'Admin User', 'admin@hotel.com', 'scrypt:32768:8:1$rqkSnC2A5kuRoTHf$0d9ed0184d671d47de44ba21ed25cccd6a232ea74f3929d9bfe31e2739e9fc4748f3d355d1659f4355455aa5281ce8d8d3f5de2d3a4dca81c44312c1e3ad4048', '+905551112244', 'ADMIN'),
(3, 'Hotel Manager', 'manager@hotel.com', 'scrypt:32768:8:1$KQKrJA9MEs2TVIcl$d988e656a98f0c531c311b59a616745dc82a716801250c844ccdbff7838a40d66b6c61f0be7f35d0a7538f85ad60e6969e498aac56470ae5f694aefce1644dfb', '+905551112255', 'HOTEL_MANAGER');

INSERT INTO hotels (id, manager_id, hotel_name, city, district, address, description, score, label, reviews, price, img, status)
VALUES
(1, 3, 'The Landmark Nicosia - Autograph Collection', 'Lefkosa', 'Merkez', 'Lefkosa, Cyprus', 'Luxury city hotel in Cyprus.', 9.4, 'Excellent', '54 reviews', 'Price from EUR 303', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70', 'ACTIVE'),
(2, 3, 'Merit Park Hotel - Casino & Spa', 'Girne', 'Karaoglanoglu', 'Girne, Cyprus', 'Casino and spa resort hotel.', 9.0, 'Excellent', '491 reviews', 'Price from EUR 748', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70', 'ACTIVE'),
(3, 3, 'Cratos Premium Hotel - Casino & Spa', 'Girne', 'Catalkoy', 'Girne, Cyprus', 'Premium seaside resort.', 9.0, 'Excellent', '413 reviews', 'Starting from EUR 760', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=70', 'ACTIVE'),
(4, 3, 'Salamis Bay Conti Hotel', 'Famagusta', 'Yeni Bogazici', 'Famagusta, Cyprus', 'Beachfront resort hotel.', 8.7, 'Good', '2,169 reviews', 'Starting from EUR 292', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=70', 'ACTIVE');

INSERT INTO rooms (id, hotel_id, room_number, room_type, capacity, price_per_night, total_rooms, description, status)
VALUES
(1, 1, '101', 'Standard', 2, 1500.00, 10, 'Standard room for 2 guests', 'ACTIVE'),
(2, 1, '102', 'Deluxe', 3, 2500.00, 6, 'Deluxe room for 3 guests', 'ACTIVE'),
(3, 2, '201', 'Suite', 4, 4000.00, 4, 'Suite room for 4 guests', 'ACTIVE');