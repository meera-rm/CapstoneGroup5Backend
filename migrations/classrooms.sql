-- Classrooms: one row per class per school year (keeps history across years)
CREATE TABLE IF NOT EXISTS classrooms (
  classroom_id  SERIAL PRIMARY KEY,
  teacher_id    INTEGER REFERENCES teachers(teacher_id) ON DELETE SET NULL,
  class_name    TEXT,
  grade         TEXT,
  academic_year VARCHAR(20) NOT NULL,      -- same format as students: '2025-2026'
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Enrollments: which student was in which classroom
CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  classroom_id  INTEGER NOT NULL REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, classroom_id)
);


INSERT INTO classrooms (teacher_id, class_name, grade, academic_year)
SELECT DISTINCT
  s.teachers_id,
  t.teacher_name || ' – ' || s.academic_year,   -- e.g. "Ms. Fundy – 2025-2026"
  t.teaching_grade,
  s.academic_year
FROM students s
JOIN teachers t ON t.teacher_id = s.teachers_id
WHERE s.teachers_id IS NOT NULL
   AND s.academic_year IS NOT NULL
   AND NOT EXISTS (
    SELECT 1 FROM classrooms c
    WHERE c.teacher_id = s.teachers_id
      AND c.academic_year = s.academic_year
  );


INSERT INTO enrollments (student_id, classroom_id)
SELECT s.student_id, c.classroom_id
FROM students s
JOIN classrooms c
  ON c.teacher_id = s.teachers_id
 AND c.academic_year = s.academic_year
ON CONFLICT (student_id, classroom_id) DO NOTHING;