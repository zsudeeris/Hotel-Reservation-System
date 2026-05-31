-- ============================================================
-- HOTEL RESERVATION SYSTEM — FULL SCHEMA MIGRATION
-- Run this in MySQL Workbench after importing database.sql
-- ============================================================

USE hotel_reservation;

-- ── 1. Fix users table ────────────────────────────────────
ALTER TABLE users
  MODIFY COLUMN role ENUM('USER','ADMIN','HOTEL_MANAGER') DEFAULT 'USER',
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ── 2. Fix rooms table ────────────────────────────────────
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS hotel_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS amenities TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS img VARCHAR(500) DEFAULT NULL;

-- ── 3. Fix reservations table ────────────────────────────
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS hotel_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_name VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_nationality VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS special_requests TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS room_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_adults INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_children INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS room_allocations TEXT DEFAULT NULL,
  MODIFY COLUMN status ENUM('CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED';

-- ── 4. Create hotels table ───────────────────────────────
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hotel_name` VARCHAR(200) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `score` DECIMAL(3,1) DEFAULT 8.0,
  `label` VARCHAR(50) DEFAULT 'Good',
  `reviews` VARCHAR(100) DEFAULT '0 reviews',
  `review_count` INT DEFAULT 0,
  `price` VARCHAR(100) DEFAULT NULL,
  `price_from` DECIMAL(10,2) DEFAULT 0,
  `img` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `amenities` TEXT DEFAULT NULL,
  `stars` INT DEFAULT 4,
  `status` ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── 5. Create payments table ─────────────────────────────
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reservation_id` INT DEFAULT NULL,
  `amount` DECIMAL(10,2) DEFAULT NULL,
  `method` VARCHAR(50) DEFAULT 'credit_card',
  `status` ENUM('SUCCESS','FAILED') DEFAULT 'FAILED',
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reservation_id` (`reservation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── 6. Create reviews table ──────────────────────────────
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hotel_id` INT DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `reviewer_name` VARCHAR(100) DEFAULT 'Guest',
  `rating` DECIMAL(3,1) DEFAULT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hotel_id` (`hotel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── 7. Sample hotel data (Cyprus hotels) ─────────────────
INSERT IGNORE INTO hotels (hotel_name, city, district, score, label, reviews, review_count, price, price_from, img, description, amenities, stars, status) VALUES
('Merit Park Hotel – Casino & Spa', 'Girne', 'Kyrenia', 9.0, 'Excellent', '491 reviews', 491, 'Price from EUR 748', 748, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', 'One of Northern Cyprus most iconic resort hotels, Merit Park offers luxury accommodation, a world-class casino, and a full-service spa on the shores of Kyrenia.', 'Beach,Casino,Spa,Pool,Gym,Restaurant', 5, 'ACTIVE'),
('Cratos Premium Hotel – Casino & Spa', 'Girne', 'Kyrenia', 9.0, 'Excellent', '413 reviews', 413, 'Starting from EUR 760', 760, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', 'A premium beachfront resort in Kyrenia featuring luxury suites, an expansive casino, and multiple restaurants and bars.', 'Beach,Casino,Spa,Pool,Gym,Kids,Restaurant', 5, 'ACTIVE'),
('The Landmark Nicosia – Autograph Collection', 'Lefkoşa', 'Nicosia', 9.4, 'Exceptional', '54 reviews', 54, 'Price from EUR 303', 303, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', 'Located in the heart of Nicosia, this boutique hotel combines historic architecture with modern luxury. Perfect for business and leisure travelers.', 'Spa,Restaurant,Gym,Business Center', 5, 'ACTIVE'),
('Salamis Bay Conti Hotel – Resort & Casino & Spa', 'Gazimağusa', 'Famagusta', 8.7, 'Very Good', '2169 reviews', 2169, 'Starting from EUR 292', 292, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', 'Set along the beautiful coastline of Famagusta, Salamis Bay Conti is a sprawling all-inclusive resort with a private beach, casino, and water sports.', 'Beach,Casino,Spa,Pool,Kids,Restaurant,Waterpark', 5, 'ACTIVE'),
('The Arkın İskele Hotel', 'İskele', 'Famagusta', 9.4, 'Exceptional', '312 reviews', 312, 'Price from EUR 420', 420, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', 'Located in the Gazimağusa region of Cyprus, The Arkın İskele Hotel offers guests a full and enjoyable holiday experience with its Ultra All-Inclusive concept.', 'Beach,Spa,Pool,Kids,Restaurant,Gym', 5, 'ACTIVE'),
('Acapulco Resort & Convention & Spa', 'Girne', 'Kyrenia', 8.5, 'Very Good', '876 reviews', 876, 'Starting from EUR 215', 215, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', 'A popular family-friendly resort in Kyrenia with extensive facilities including multiple pools, a water park, and a private beach.', 'Beach,Pool,Kids,Restaurant,Waterpark,Gym', 4, 'ACTIVE'),
('Lord Palace Hotel & Casino & Spa', 'Girne', 'Kyrenia', 8.8, 'Excellent', '223 reviews', 223, 'Price from EUR 380', 380, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', 'An elegant hotel overlooking the Mediterranean with a rooftop pool, casino entertainment, and fine dining experiences.', 'Casino,Spa,Pool,Restaurant,Gym', 5, 'ACTIVE'),
('Concorde Luxury Resort Hotel', 'İskele', 'Bafra', 9.1, 'Excellent', '1024 reviews', 1024, 'Starting from EUR 510', 510, 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80', 'An all-inclusive mega resort in Bafra featuring 12 restaurants, 6 pools, a beach club, and full entertainment facilities for families and couples.', 'Beach,Pool,Kids,Casino,Spa,Restaurant,Waterpark,Gym', 5, 'ACTIVE');

-- ── 8. Update rooms to link to hotels ────────────────────
UPDATE rooms SET hotel_id = 1 WHERE hotel_id IS NULL;
UPDATE rooms r
JOIN hotels h ON h.id = 1
SET
  r.room_type = 'Standard Room',
  r.room_number = '101',
  r.capacity = 2,
  r.price_per_night = ROUND(h.price_from * 0.85, 2),
  r.description = CONCAT('Standard room at ', h.hotel_name),
  r.status = 'ACTIVE',
  r.hotel_id = h.id,
  r.amenities = 'WiFi,AC,TV',
  r.img = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
WHERE r.id = 1;
UPDATE rooms r
JOIN hotels h ON h.id = 1
SET
  r.room_type = 'Deluxe Room',
  r.room_number = '102',
  r.capacity = 3,
  r.price_per_night = ROUND(h.price_from * 1.10, 2),
  r.description = CONCAT('Deluxe room at ', h.hotel_name),
  r.status = 'ACTIVE',
  r.hotel_id = h.id,
  r.amenities = 'WiFi,AC,TV,Sea View,Balcony',
  r.img = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'
WHERE r.id = 2;
UPDATE rooms r
JOIN hotels h ON h.id = 1
SET
  r.room_type = 'Sea View Room',
  r.room_number = '103',
  r.capacity = 4,
  r.price_per_night = ROUND(h.price_from * 1.45, 2),
  r.description = CONCAT('Sea view room at ', h.hotel_name),
  r.status = 'ACTIVE',
  r.hotel_id = h.id,
  r.amenities = 'WiFi,AC,TV,Sea View,Balcony,Jacuzzi,Living Room',
  r.img = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80'
WHERE r.id = 3;

-- ── 9. Additional hotels for filter/sort testing ─────────
INSERT IGNORE INTO hotels (hotel_name, city, district, score, label, reviews, review_count, price, price_from, img, description, amenities, stars, status) VALUES

-- Girne / Kyrenia
('Elexus Hotel Resort & Casino',       'Girne', 'Kyrenia',  8.8, 'Excellent',  '638 reviews',   638, 'Starting from EUR 340', 340, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', 'A stunning 5-star resort on the Kyrenia coast featuring a full casino, private beach, and multiple dining outlets.', 'Beach,Casino,Pool,Spa,Gym,Restaurant', 5, 'ACTIVE'),
('Rocks Hotel & Casino',               'Girne', 'Kyrenia',  8.6, 'Very Good',  '319 reviews',   319, 'Starting from EUR 260', 260, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', 'Built dramatically into the cliffs above the sea, Rocks Hotel offers panoramic Mediterranean views and casino entertainment.', 'Beach,Casino,Pool,Restaurant,Gym', 4, 'ACTIVE'),
('Dome Hotel',                         'Girne', 'Kyrenia',  8.1, 'Very Good',  '412 reviews',   412, 'Price from EUR 155',     155, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', 'A historic Kyrenia landmark, the Dome Hotel has hosted guests since 1938 with gracious service and seaside charm.', 'Beach,Pool,Restaurant', 4, 'ACTIVE'),
('Colony Hotel Kyrenia',               'Girne', 'Kyrenia',  8.3, 'Very Good',  '187 reviews',   187, 'Price from EUR 185',     185, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', 'A charming boutique hotel in the heart of Kyrenia offering personalised service, garden pool, and easy access to the harbour.', 'Pool,Spa,Restaurant,Gym', 4, 'ACTIVE'),
('Jasmine Court Hotel & Casino',       'Girne', 'Kyrenia',  8.4, 'Very Good',  '256 reviews',   256, 'Price from EUR 225',     225, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', 'Set on a hilltop overlooking Kyrenia, Jasmine Court blends traditional Cypriot architecture with modern resort amenities.', 'Casino,Pool,Spa,Restaurant,Gym', 4, 'ACTIVE'),

-- Lefkoşa / Nicosia
('Hilton Park Nicosia',                'Lefkoşa', 'Nicosia', 8.9, 'Excellent',  '521 reviews',   521, 'Price from EUR 280',     280, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', 'The Hilton Park is Nicosia''s premier business hotel, offering sleek modern rooms, a rooftop pool, and award-winning dining.', 'Pool,Spa,Restaurant,Gym,Business Center', 5, 'ACTIVE'),
('Classic Hotel Nicosia',              'Lefkoşa', 'Nicosia', 7.8, 'Good',       '98 reviews',     98, 'Price from EUR 95',       95, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', 'A comfortable 3-star city hotel offering clean rooms and friendly service in central Nicosia at an affordable price.', 'Restaurant,Gym', 3, 'ACTIVE'),
('City Royal Hotel',                   'Lefkoşa', 'Nicosia', 8.0, 'Very Good',  '143 reviews',   143, 'Price from EUR 120',     120, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', 'A well-situated hotel in the heart of Nicosia with comfortable rooms, an outdoor pool, and a popular rooftop bar.', 'Pool,Restaurant,Bar', 3, 'ACTIVE'),

-- Gazimağusa / Famagusta
('Palm Beach Hotel & Bungalows',       'Gazimağusa', 'Famagusta', 8.3, 'Very Good', '387 reviews',  387, 'Starting from EUR 180', 180, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', 'A relaxed beachfront property near the ancient walled city of Famagusta, ideal for families and history lovers.', 'Beach,Pool,Restaurant,Kids', 3, 'ACTIVE'),
('Arkin Colony Hotel Famagusta',       'Gazimağusa', 'Famagusta', 8.6, 'Very Good', '204 reviews',  204, 'Starting from EUR 210', 210, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', 'Nestled beside an ancient monastery in Famagusta, Arkin Colony offers a unique mix of history, luxury, and tranquillity.', 'Pool,Spa,Restaurant,Gym', 4, 'ACTIVE'),
('Salamis Sun Hotel & Beach',          'Gazimağusa', 'Famagusta', 7.9, 'Good',      '275 reviews',  275, 'Starting from EUR 140', 140, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', 'A budget-friendly beachside hotel with direct access to the turquoise waters of Famagusta Bay.', 'Beach,Pool,Restaurant', 3, 'ACTIVE'),

-- İskele / Bafra
('Kaya Palazzo Golf Resort',           'İskele', 'Bafra',    8.9, 'Excellent',  '462 reviews',   462, 'Starting from EUR 580', 580, 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80', 'A luxury golf and spa resort in Bafra with a championship 18-hole course, multiple pools, and gourmet dining.', 'Pool,Spa,Restaurant,Golf,Gym,Beach', 5, 'ACTIVE'),
('Mimoza Beach Hotel',                 'İskele', 'Famagusta', 7.7, 'Good',       '165 reviews',   165, 'Starting from EUR 115', 115, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', 'A small, friendly beachfront hotel in İskele offering simple but comfortable rooms with sea views.', 'Beach,Pool,Restaurant,Kids', 3, 'ACTIVE'),

-- Baf / Paphos (South Cyprus)
('Almyra Hotel Paphos',                'Baf', 'Paphos',    9.0, 'Excellent',  '743 reviews',   743, 'Starting from EUR 420', 420, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', 'A sleek design hotel overlooking Paphos harbour with stylish rooms, an infinity pool, and gourmet cuisine.', 'Beach,Pool,Spa,Restaurant,Gym,Kids', 5, 'ACTIVE'),
('Annabelle Hotel Paphos',             'Baf', 'Paphos',    9.2, 'Excellent',  '892 reviews',   892, 'Starting from EUR 380', 380, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', 'One of Paphos''s finest hotels, Annabelle is set in lush tropical gardens beside the sea with superb dining and spa.', 'Beach,Pool,Spa,Restaurant,Gym', 5, 'ACTIVE'),
('Alexander the Great Beach Hotel',    'Baf', 'Paphos',    8.5, 'Very Good',  '534 reviews',   534, 'Price from EUR 220',     220, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', 'A popular 4-star beach hotel in Paphos with extensive facilities, a large pool area, and varied entertainment.', 'Beach,Pool,Restaurant,Kids,Gym', 4, 'ACTIVE'),

-- Larnaca
('Sun Hall Hotel Larnaca',             'Larnaca', 'Larnaca', 8.2, 'Very Good', '308 reviews',   308, 'Price from EUR 175',     175, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', 'A landmark on Larnaca''s seafront promenade, Sun Hall offers sea-view rooms, a rooftop pool, and Mediterranean dining.', 'Pool,Restaurant,Beach,Gym', 4, 'ACTIVE'),
('Radisson Blu Larnaka',               'Larnaca', 'Larnaca', 8.7, 'Excellent', '427 reviews',   427, 'Price from EUR 240',     240, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80', 'A modern upscale hotel in Larnaca with elegant rooms, a full-service spa, and superb access to the beach and airport.', 'Pool,Spa,Restaurant,Gym,Beach', 5, 'ACTIVE'),
('Golden Bay Beach Hotel',             'Larnaca', 'Larnaca', 8.8, 'Excellent', '612 reviews',   612, 'Starting from EUR 310', 310, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', 'Perched above its own private sandy cove, Golden Bay offers stylish suites, a thalassotherapy spa, and breathtaking sunsets.', 'Beach,Pool,Spa,Restaurant,Kids,Gym', 5, 'ACTIVE'),

-- Limassol
('Four Seasons Hotel Limassol',        'Limassol', 'Limassol', 9.3, 'Exceptional', '1105 reviews', 1105, 'Starting from EUR 680', 680, 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80', 'Consistently rated among the best hotels in Cyprus, the Four Seasons Limassol offers unparalleled luxury on a private beach.', 'Beach,Pool,Spa,Restaurant,Gym,Kids,Honeymoon', 5, 'ACTIVE'),
('Parklane Resort & Spa',              'Limassol', 'Limassol', 9.1, 'Excellent',  '834 reviews',   834, 'Starting from EUR 520', 520, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', 'A five-star beachfront resort in Limassol offering spectacular sea views, a world-class spa, and exclusive beach access.', 'Beach,Pool,Spa,Restaurant,Gym', 5, 'ACTIVE'),
('Amathus Beach Hotel Limassol',       'Limassol', 'Limassol', 8.8, 'Excellent',  '698 reviews',   698, 'Starting from EUR 380', 380, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', 'A well-established luxury beach hotel in Limassol, known for its warm hospitality, beautiful gardens, and fine dining.', 'Beach,Pool,Spa,Restaurant,Gym,Kids', 5, 'ACTIVE');

-- ── 10. Rooms for all hotels (3 rooms each) ──────────────
INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '01'), 'Standard Room', 2, ROUND(h.price_from * 0.85, 2), CONCAT('Standard room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Standard Room');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '02'), 'Deluxe Room', 3, ROUND(h.price_from * 1.10, 2), CONCAT('Deluxe room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Deluxe Room');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT CONCAT(h.id, '03'), 'Sea View Room', 4, ROUND(h.price_from * 1.45, 2), CONCAT('Sea view room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony,Jacuzzi,Living Room', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80'
FROM hotels h
WHERE h.status = 'ACTIVE'
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Sea View Room');

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

SELECT CONCAT('Total hotels: ', COUNT(*)) AS result FROM hotels WHERE status='ACTIVE';
SELECT 'Migration completed successfully!' AS result;
