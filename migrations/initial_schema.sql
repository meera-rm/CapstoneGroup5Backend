
-- ScholarSheep v2 — Full Database Schema
-- Run with: psql -d scholarsheep_v2 -f migrations/001_initial_schema.sql

-- ===== USERS =====
-- One users table that supports BOTH login methods.
--   Email/password users have password_hash set.
--   Google users have google_id set.
--   A person can have both (they signed up with email, later used Google).
 
CREATE TABLE IF NOT EXISTS users (
  user_id        SERIAL PRIMARY KEY,
  user_name      VARCHAR(100) NOT NULL,
  user_email          VARCHAR(255) NOT NULL UNIQUE,
  user_password  TEXT,                         -- NULL for Google-only users
  google_id      VARCHAR(255) UNIQUE,          -- NULL for email-only users
  user_role      VARCHAR(20)  NOT NULL DEFAULT 'student'
                 CHECK (user_role IN ('student', 'teacher', 'admin','parent')),
  user_avatar TEXT DEFAULT '',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
 
  -- Every user must have at least one way to log in
  CONSTRAINT has_login_method CHECK (user_password IS NOT NULL OR google_id IS NOT NULL)
);
 
-- Store emails lowercase so "Meera@X.com" and "meera@x.com" are the same person
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(user_email));
 




-- ===== TEACHERS =====
CREATE TABLE IF NOT EXISTS teachers (
  teacher_id SERIAL PRIMARY KEY,
  teacher_name VARCHAR(200) NOT NULL,
  school_name TEXT,
  school_district INTEGER,
  school_address TEXT,
  zipcode INTEGER,
  state_name TEXT,
  class_subject TEXT,
  teaching_grade TEXT,
  teacher_avatar TEXT,
  teacher_email VARCHAR(255),
  teacher_bio TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== STUDENTS =====
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  student_name VARCHAR(200) NOT NULL,
  parent_name TEXT,
  parent_email VARCHAR(255),
  student_email VARCHAR(255),
  grade TEXT,
  academic_year VARCHAR(20),
  reading_level TEXT,
  student_avatar TEXT,
  student_image TEXT,
  teachers_id INTEGER REFERENCES teachers(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
