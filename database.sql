CREATE DATABASE IF NOT EXISTS hotel_reservation;
USE hotel_reservation;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER','ADMIN','HOTEL_MANAGER') DEFAULT 'USER',
  phone VARCHAR(20) DEFAULT NULL,
  two_factor_code VARCHAR(6) DEFAULT NULL,
  two_factor_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE hotels (
  id INT NOT NULL AUTO_INCREMENT,
  hotel_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) DEFAULT NULL,
  score DECIMAL(3,1) DEFAULT 8.0,
  label VARCHAR(50) DEFAULT 'Good',
  reviews VARCHAR(100) DEFAULT '0 reviews',
  review_count INT DEFAULT 0,
  price VARCHAR(100) DEFAULT NULL,
  price_from DECIMAL(10,2) DEFAULT 0,
  img VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  amenities TEXT DEFAULT NULL,
  stars INT DEFAULT 4,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rooms (
  id INT NOT NULL AUTO_INCREMENT,
  room_number VARCHAR(20) NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  description TEXT,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  hotel_id INT DEFAULT NULL,
  amenities TEXT DEFAULT NULL,
  img VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY hotel_id (hotel_id),
  CONSTRAINT rooms_ibfk_1 FOREIGN KEY (hotel_id) REFERENCES hotels (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reservations (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  hotel_id INT DEFAULT NULL,
  room_id INT DEFAULT NULL,
  guest_name VARCHAR(200) DEFAULT NULL,
  guest_email VARCHAR(200) DEFAULT NULL,
  guest_phone VARCHAR(50) DEFAULT NULL,
  special_requests TEXT DEFAULT NULL,
  room_count INT DEFAULT 1,
  total_adults INT DEFAULT 0,
  total_children INT DEFAULT 0,
  room_allocations TEXT DEFAULT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INT NOT NULL,
  total_price DECIMAL(10,2) DEFAULT NULL,
  status ENUM('CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED',
  reservation_source ENUM('MANUAL','CHATBOT') DEFAULT 'MANUAL',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY hotel_id (hotel_id),
  KEY room_id (room_id),
  CONSTRAINT reservations_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT reservations_ibfk_2 FOREIGN KEY (hotel_id) REFERENCES hotels (id),
  CONSTRAINT reservations_ibfk_3 FOREIGN KEY (room_id) REFERENCES rooms (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payments (
  id INT NOT NULL AUTO_INCREMENT,
  reservation_id INT DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  method VARCHAR(50) DEFAULT 'credit_card',
  status ENUM('SUCCESS','FAILED') DEFAULT 'FAILED',
  transaction_ref VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY reservation_id (reservation_id),
  CONSTRAINT payments_ibfk_1 FOREIGN KEY (reservation_id) REFERENCES reservations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reviews (
  id INT NOT NULL AUTO_INCREMENT,
  hotel_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  reviewer_name VARCHAR(100) DEFAULT 'Guest',
  rating DECIMAL(3,1) DEFAULT NULL,
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY hotel_id (hotel_id),
  CONSTRAINT reviews_ibfk_1 FOREIGN KEY (hotel_id) REFERENCES hotels (id),
  CONSTRAINT reviews_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO users (id, name, email, password, role, phone, two_factor_code, two_factor_expires, created_at) VALUES
  (1, 'Test User', 'test@test.com', '123456', 'USER', NULL, '296442', '2026-05-13 15:03:49', CURRENT_TIMESTAMP),
  (2, 'Demo Guest', 'demo@bookhotel.com', 'scrypt:32768:8:1$278nicAeLJJ1zdXU$b7e1cef33343bef205b0c9c81395d4efb889dfd815e7cde99527fa61d0839d73f489f92da7c61862ceac51ad2260fdd007bcf51cb3818cd4d89c4163a59fdc21', 'USER', NULL, NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO hotels (id, hotel_name, city, district, score, label, reviews, review_count, price, price_from, img, description, amenities, stars, status) VALUES
  (1, 'Merit Park Hotel – Casino & Spa', 'Girne', 'Kyrenia', 9.0, 'Excellent', '491 reviews', 491, 'Price from EUR 748', 748, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', 'One of Northern Cyprus most iconic resort hotels, Merit Park offers luxury accommodation, a world-class casino, and a full-service spa on the shores of Kyrenia.', 'Beach,Casino,Spa,Pool,Gym,Restaurant', 5, 'ACTIVE'),
  (2, 'Cratos Premium Hotel – Casino & Spa', 'Girne', 'Kyrenia', 9.0, 'Excellent', '413 reviews', 413, 'Starting from EUR 760', 760, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', 'A premium beachfront resort in Kyrenia featuring luxury suites, an expansive casino, and multiple restaurants and bars.', 'Beach,Casino,Spa,Pool,Gym,Kids,Restaurant', 5, 'ACTIVE'),
  (3, 'The Landmark Nicosia – Autograph Collection', 'Lefkoşa', 'Nicosia', 9.4, 'Exceptional', '54 reviews', 54, 'Price from EUR 303', 303, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', 'Located in the heart of Nicosia, this boutique hotel combines historic architecture with modern luxury. Perfect for business and leisure travelers.', 'Spa,Restaurant,Gym,Business Center', 5, 'ACTIVE'),
  (4, 'Salamis Bay Conti Hotel – Resort & Casino & Spa', 'Gazimağusa', 'Famagusta', 8.7, 'Very Good', '2169 reviews', 2169, 'Starting from EUR 292', 292, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', 'Set along the beautiful coastline of Famagusta, Salamis Bay Conti is a sprawling all-inclusive resort with a private beach, casino, and water sports.', 'Beach,Casino,Spa,Pool,Kids,Restaurant,Waterpark', 5, 'ACTIVE'),
  (5, 'The Arkın İskele Hotel', 'İskele', 'Famagusta', 9.4, 'Exceptional', '312 reviews', 312, 'Price from EUR 420', 420, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', 'Located in the Gazimağusa region of Cyprus, The Arkın İskele Hotel offers guests a full and enjoyable holiday experience with its Ultra All-Inclusive concept.', 'Beach,Spa,Pool,Kids,Restaurant,Gym', 5, 'ACTIVE'),
  (6, 'Acapulco Resort & Convention & Spa', 'Girne', 'Kyrenia', 8.5, 'Very Good', '876 reviews', 876, 'Starting from EUR 215', 215, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', 'A popular family-friendly resort in Kyrenia with extensive facilities including multiple pools, a water park, and a private beach.', 'Beach,Pool,Kids,Restaurant,Waterpark,Gym', 4, 'ACTIVE'),
  (7, 'Lord Palace Hotel & Casino & Spa', 'Girne', 'Kyrenia', 8.8, 'Excellent', '223 reviews', 223, 'Price from EUR 380', 380, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', 'An elegant hotel overlooking the Mediterranean with a rooftop pool, casino entertainment, and fine dining experiences.', 'Casino,Spa,Pool,Restaurant,Gym', 5, 'ACTIVE'),
  (8, 'Concorde Luxury Resort Hotel', 'İskele', 'Bafra', 9.1, 'Excellent', '1024 reviews', 1024, 'Starting from EUR 510', 510, 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80', 'An all-inclusive mega resort in Bafra featuring 12 restaurants, 6 pools, a beach club, and full entertainment facilities for families and couples.', 'Beach,Pool,Kids,Casino,Spa,Restaurant,Waterpark,Gym', 5, 'ACTIVE');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img) VALUES
  ('101', 'Standard Room', 2, 1500.00, 'Standard room for 2 guests', 'ACTIVE', 1, 'WiFi,AC,TV', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'),
  ('102', 'Deluxe Room', 3, 2500.00, 'Deluxe room for 3 guests', 'ACTIVE', 1, 'WiFi,AC,TV,Sea View,Balcony', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'),
  ('103', 'Sea View Room', 4, 4000.00, 'Sea view room for 4 guests', 'ACTIVE', 1, 'WiFi,AC,TV,Sea View,Balcony,Jacuzzi,Living Room', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '04'), 'Standard Sea View Room', 2, ROUND(h.price_from * 0.92, 2), CONCAT('Sea view standard room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Standard Sea View Room');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '05'), 'Deluxe Sea View Room', 3, ROUND(h.price_from * 1.18, 2), CONCAT('Sea view deluxe room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Deluxe Sea View Room');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '06'), 'Family Room', 4, ROUND(h.price_from * 1.32, 2), CONCAT('Family room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Living Room', 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Family Room');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '07'), 'Family Sea View Room', 4, ROUND(h.price_from * 1.45, 2), CONCAT('Family sea view room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony,Living Room', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Family Sea View Room');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '08'), 'Junior Suite', 4, ROUND(h.price_from * 1.60, 2), CONCAT('Junior suite at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony,Jacuzzi', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Junior Suite');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '09'), 'Executive Suite', 5, ROUND(h.price_from * 1.85, 2), CONCAT('Executive suite at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony,Living Room,Jacuzzi', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Executive Suite');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '10'), 'Connecting Family Suite', 6, ROUND(h.price_from * 2.05, 2), CONCAT('Connecting family suite at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony,Living Room,Two Bedrooms', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Connecting Family Suite');

INSERT INTO reviews (hotel_id, reviewer_name, rating, comment, created_at)
SELECT
  h.id,
  ELT(MOD(n.n + h.id, 12) + 1, 'A. Johnson', 'M. Demir', 'S. Kaya', 'N. Brown', 'L. Smith', 'E. Clark', 'D. Martin', 'C. Lewis', 'P. Taylor', 'R. Wilson', 'J. Patel', 'T. Hughes'),
  ROUND(
    LEAST(9.8, GREATEST(7.6,
      h.score + CASE MOD(n.n, 8)
        WHEN 0 THEN -0.5 WHEN 1 THEN -0.3 WHEN 2 THEN -0.1 WHEN 3 THEN 0.0
        WHEN 4 THEN 0.1 WHEN 5 THEN 0.2 WHEN 6 THEN 0.35 ELSE 0.45 END
    )), 1
  ),
  CASE MOD(n.n, 10)
    WHEN 0 THEN CONCAT('The room was spotless and very comfortable. Staff were helpful throughout the stay at ', h.hotel_name, '.')
    WHEN 1 THEN CONCAT('Great location and beautiful pool area at ', h.hotel_name, '.')
    WHEN 2 THEN CONCAT('Breakfast was strong and check-in was fairly quick at ', h.hotel_name, '.')
    WHEN 3 THEN CONCAT('Excellent service, spacious rooms, and very good value at ', h.hotel_name, '.')
    WHEN 4 THEN CONCAT('Loved the sea view and calm atmosphere at ', h.hotel_name, '.')
    WHEN 5 THEN CONCAT('The spa facilities were a real highlight at ', h.hotel_name, '.')
    WHEN 6 THEN CONCAT('Friendly staff and a smooth overall experience at ', h.hotel_name, '.')
    WHEN 7 THEN CONCAT('Very family-friendly and well organized at ', h.hotel_name, '.')
    WHEN 8 THEN CONCAT('Parking was convenient and the lobby was welcoming at ', h.hotel_name, '.')
    ELSE CONCAT('A relaxing stay with good food and attentive service at ', h.hotel_name, '.')
  END,
  DATE_SUB(NOW(), INTERVAL n.n DAY)
FROM hotels h
JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
  UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25
  UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
) n
WHERE h.status = 'ACTIVE'
  AND n.n <= (10 + MOD(h.id * 7, 21))
  AND NOT EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.hotel_id = h.id
      AND r.reviewer_name = ELT(MOD(n.n + h.id, 12) + 1, 'A. Johnson', 'M. Demir', 'S. Kaya', 'N. Brown', 'L. Smith', 'E. Clark', 'D. Martin', 'C. Lewis', 'P. Taylor', 'R. Wilson', 'J. Patel', 'T. Hughes')
      AND r.comment = CASE MOD(n.n, 10)
        WHEN 0 THEN CONCAT('The room was spotless and very comfortable. Staff were helpful throughout the stay at ', h.hotel_name, '.')
        WHEN 1 THEN CONCAT('Great location and beautiful pool area at ', h.hotel_name, '.')
        WHEN 2 THEN CONCAT('Breakfast was strong and check-in was fairly quick at ', h.hotel_name, '.')
        WHEN 3 THEN CONCAT('Excellent service, spacious rooms, and very good value at ', h.hotel_name, '.')
        WHEN 4 THEN CONCAT('Loved the sea view and calm atmosphere at ', h.hotel_name, '.')
        WHEN 5 THEN CONCAT('The spa facilities were a real highlight at ', h.hotel_name, '.')
        WHEN 6 THEN CONCAT('Friendly staff and a smooth overall experience at ', h.hotel_name, '.')
        WHEN 7 THEN CONCAT('Very family-friendly and well organized at ', h.hotel_name, '.')
        WHEN 8 THEN CONCAT('Parking was convenient and the lobby was welcoming at ', h.hotel_name, '.')
        ELSE CONCAT('A relaxing stay with good food and attentive service at ', h.hotel_name, '.')
      END
  );

UPDATE hotels h
LEFT JOIN (
  SELECT hotel_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
  FROM reviews
  GROUP BY hotel_id
) r ON r.hotel_id = h.id
SET
  h.score = COALESCE(r.avg_rating, h.score),
  h.review_count = COALESCE(r.review_count, h.review_count),
  h.reviews = CONCAT(COALESCE(r.review_count, h.review_count), ' reviews'),
  h.label = CASE
    WHEN COALESCE(r.avg_rating, h.score) >= 9.5 THEN 'Exceptional'
    WHEN COALESCE(r.avg_rating, h.score) >= 8.5 THEN 'Excellent'
    WHEN COALESCE(r.avg_rating, h.score) >= 7.5 THEN 'Very Good'
    ELSE 'Good'
  END
WHERE h.status='ACTIVE';

SET FOREIGN_KEY_CHECKS = 1;
