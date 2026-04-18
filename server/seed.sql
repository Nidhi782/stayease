-- ============================================================
--  StayEase — Phase 7 Seed Data
--  Run AFTER schema.sql to pre-populate the database.
--  mysql -u root -p stayease < seed.sql
-- ============================================================

-- ── Rooms ────────────────────────────────────────────────────
INSERT INTO rooms (number, type, hostel, floor, capacity, occupied, status, amenities) VALUES
  ('A-101', 'Double', 'Boys',  1, 2, 2, 'Full',      '["WiFi","AC","Attached Bath"]'),
  ('A-102', 'Triple', 'Boys',  1, 3, 2, 'Available', '["WiFi","Fan","Common Bath"]'),
  ('A-103', 'Single', 'Boys',  1, 1, 1, 'Full',      '["WiFi","AC","Attached Bath"]'),
  ('A-201', 'Double', 'Boys',  2, 2, 0, 'Vacant',    '["WiFi","Fan","Common Bath"]'),
  ('G-101', 'Double', 'Girls', 1, 2, 2, 'Full',      '["WiFi","AC","Attached Bath"]'),
  ('G-102', 'Triple', 'Girls', 1, 3, 1, 'Available', '["WiFi","Fan","Common Bath"]'),
  ('G-201', 'Single', 'Girls', 2, 1, 0, 'Vacant',    '["WiFi","AC","Attached Bath"]'),
  ('G-204', 'Double', 'Girls', 2, 2, 2, 'Full',      '["WiFi","Fan","Attached Bath"]');

-- ── Students ─────────────────────────────────────────────────
INSERT INTO students (name, room, hostel, fee_status) VALUES
  ('Rahul Sharma',  'A-101', 'Boys',  'Paid'),
  ('Priya Singh',   'G-204', 'Girls', 'Partial'),
  ('Amit Kumar',    'A-103', 'Boys',  'Pending'),
  ('Sneha Patel',   'G-101', 'Girls', 'Partial'),
  ('Vikram Yadav',  'A-205', 'Boys',  'Paid');

-- ── Complaints ───────────────────────────────────────────────
INSERT INTO complaints (title, room, hostel, status, date) VALUES
  ('Leaking pipe in bathroom', 'A-101', 'Boys',  'Open',     '2026-04-10'),
  ('AC not working',           'G-101', 'Girls', 'Resolved', '2026-04-09'),
  ('Broken window latch',      'A-102', 'Boys',  'Open',     '2026-04-11'),
  ('Water heater issue',       'G-102', 'Girls', 'Resolved', '2026-04-12'),
  ('WiFi connectivity problem','A-201', 'Boys',  'Resolved', '2026-04-08'),
  ('Ceiling fan making noise', 'G-204', 'Girls', 'Open',     '2026-04-13'),
  ('AC Servicing',             'G-204', 'Girls', 'Resolved', '2026-04-14');
