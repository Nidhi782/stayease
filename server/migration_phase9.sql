-- ── Phase 9 DB Migration ──────────────────────────────────────────────────────
-- Run this in MySQL (XAMPP Shell or phpMyAdmin) for local dev
-- Then also run on Railway via the Query tab

USE stayease;

-- 1. Add role to users (warden_boys, warden_girls, student)
ALTER TABLE users
  ADD COLUMN role ENUM('student','warden_boys','warden_girls') NOT NULL DEFAULT 'student';

-- Set your admin accounts manually after running:
-- UPDATE users SET role = 'warden_boys'  WHERE email = 'boywarden@yourhostel.com';
-- UPDATE users SET role = 'warden_girls' WHERE email = 'girlwarden@yourhostel.com';

-- 2. Add parent + college fields to students
ALTER TABLE students
  ADD COLUMN parent_name   VARCHAR(100),
  ADD COLUMN parent_phone  VARCHAR(15),
  ADD COLUMN parent_email  VARCHAR(150),
  ADD COLUMN parent2_name  VARCHAR(100),
  ADD COLUMN parent2_phone VARCHAR(15),
  ADD COLUMN college_name  VARCHAR(200),
  ADD COLUMN college_year  ENUM('1st Year','2nd Year','3rd Year','4th Year','PG'),
  ADD COLUMN session_start DATE,
  ADD COLUMN session_end   DATE,
  ADD COLUMN total_fee     INT NOT NULL DEFAULT 135000,
  ADD COLUMN plan          ENUM('Full','3-Installment') NOT NULL DEFAULT '3-Installment',
  ADD COLUMN extended_stay BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Add AC flag to rooms
ALTER TABLE rooms
  ADD COLUMN ac BOOLEAN NOT NULL DEFAULT TRUE;

-- 4. Create outpasses table
CREATE TABLE IF NOT EXISTS outpasses (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  reason         TEXT NOT NULL,
  destination    VARCHAR(255) NOT NULL,
  departure_date DATE NOT NULL,
  return_date    DATE NOT NULL,
  status         ENUM('Pending','Approved','Rejected','Returned') NOT NULL DEFAULT 'Pending',
  admin_note     TEXT,
  returned_at    DATETIME,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date       DATE NOT NULL,
  status     ENUM('Present','Absent','On-Leave') NOT NULL DEFAULT 'Absent',
  marked_by  ENUM('Student','Admin') NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_att (student_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
