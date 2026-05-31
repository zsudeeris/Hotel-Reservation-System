-- ============================================================
-- HOTEL RESERVATION SYSTEM
-- Post-import schema migration for MySQL 9.x+
--
-- Run this after database.sql has already created the base schema.
-- This file is idempotent: it only adds missing columns.
-- ============================================================

USE hotel_reservation;

-- Helper pattern:
-- If a column already exists, run a harmless SELECT; otherwise add it.

-- Users table compatibility
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'hotel_id'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN hotel_id INT DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'phone'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'created_at'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE users
  MODIFY COLUMN role ENUM('USER','ADMIN','HOTEL_MANAGER') DEFAULT 'USER';

-- Reservations table compatibility
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'hotel_id'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN hotel_id INT DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'guest_name'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN guest_name VARCHAR(200) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'guest_email'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN guest_email VARCHAR(200) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'guest_phone'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN guest_phone VARCHAR(50) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'guest_nationality'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN guest_nationality VARCHAR(100) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'special_requests'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN special_requests TEXT DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'room_count'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN room_count INT DEFAULT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'total_adults'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN total_adults INT DEFAULT 0'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'total_children'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN total_children INT DEFAULT 0'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'room_allocations'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN room_allocations TEXT DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'is_deleted'
    ),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN is_deleted TINYINT(1) DEFAULT 0'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE reservations
  MODIFY COLUMN status ENUM('CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED';

-- Rooms table compatibility
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'rooms'
        AND COLUMN_NAME = 'hotel_id'
    ),
    'SELECT 1',
    'ALTER TABLE rooms ADD COLUMN hotel_id INT DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'rooms'
        AND COLUMN_NAME = 'amenities'
    ),
    'SELECT 1',
    'ALTER TABLE rooms ADD COLUMN amenities TEXT DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'rooms'
        AND COLUMN_NAME = 'img'
    ),
    'SELECT 1',
    'ALTER TABLE rooms ADD COLUMN img VARCHAR(500) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Hotels, payments, and reviews tables already exist in the base schema.
-- This migration intentionally avoids reseeding sample data so it can be
-- rerun safely without duplicating rows.
