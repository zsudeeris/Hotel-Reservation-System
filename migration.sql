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
UPDATE rooms SET
  amenities = CASE room_type
    WHEN 'Standard' THEN 'WiFi,AC,TV,Minibar'
    WHEN 'Deluxe' THEN 'WiFi,AC,TV,Minibar,Sea View,Balcony'
    WHEN 'Suite' THEN 'WiFi,AC,TV,Minibar,Sea View,Balcony,Jacuzzi,Living Room'
    ELSE 'WiFi,AC,TV'
  END,
  img = CASE room_type
    WHEN 'Standard' THEN 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
    WHEN 'Deluxe' THEN 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'
    WHEN 'Suite' THEN 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80'
    ELSE 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
  END
WHERE img IS NULL;

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

-- ── 10. Rooms for new hotels (3 rooms each) ──────────────
INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT '101', 'Standard', 2, ROUND(h.price_from * 0.85, 2), CONCAT('Standard room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
FROM hotels h WHERE h.id >= 9 AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Standard');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT '201', 'Deluxe', 3, ROUND(h.price_from * 1.25, 2), CONCAT('Deluxe room at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'
FROM hotels h WHERE h.id >= 9 AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Deluxe');

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, status, hotel_id, amenities, img)
SELECT '301', 'Suite', 4, ROUND(h.price_from * 2.00, 2), CONCAT('Suite at ', h.hotel_name), 'ACTIVE', h.id,
       'WiFi,AC,TV,Sea View,Balcony,Jacuzzi,Living Room', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80'
FROM hotels h WHERE h.id >= 9 AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Suite');

SELECT CONCAT('Total hotels: ', COUNT(*)) AS result FROM hotels WHERE status='ACTIVE';
SELECT 'Migration completed successfully!' AS result;
