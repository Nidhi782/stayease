-- ============================================================
--  StayEase — Phase 7 Database Schema
--  Run this once to create all tables in your `stayease` DB.
--  mysql -u root -p stayease < schema.sql
-- ============================================================

-- Table 1: Users (authentication)
CREATE TABLE IF NOT EXISTS users (
  id            INT          AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id        INT          AUTO_INCREMENT PRIMARY KEY,
  number    VARCHAR(20)  NOT NULL UNIQUE,
  type      ENUM('Single','Double','Triple') NOT NULL,
  hostel    ENUM('Boys','Girls')             NOT NULL,
  floor     INT          NOT NULL DEFAULT 1,
  capacity  INT          NOT NULL,
  occupied  INT          NOT NULL DEFAULT 0,
  status    ENUM('Full','Available','Vacant') NOT NULL DEFAULT 'Vacant',
  amenities JSON         NOT NULL DEFAULT ('[]')
);

-- Table 3: Students
CREATE TABLE IF NOT EXISTS students (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  room       VARCHAR(20)  NOT NULL,
  hostel     ENUM('Boys','Girls') NOT NULL,
  fee_status ENUM('Paid','Pending','Partial') NOT NULL DEFAULT 'Pending'
);

-- Table 4: Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id     INT          AUTO_INCREMENT PRIMARY KEY,
  title  VARCHAR(255) NOT NULL,
  room   VARCHAR(20)  NOT NULL,
  hostel ENUM('Boys','Girls') NOT NULL,
  status ENUM('Open','Resolved') NOT NULL DEFAULT 'Open',
  date   DATE         NOT NULL
);
