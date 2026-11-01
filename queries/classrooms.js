const db = require('../db/dbConfig');

// The teacher's classroom for one school year, if they have one
const findClassroom = (teacherId, academicYear) =>
  db.oneOrNone(
    'SELECT * FROM classrooms WHERE teacher_id = $1 AND academic_year = $2 ORDER BY classroom_id LIMIT 1',
    [teacherId, academicYear]
  );

// Create the classroom, or rename the existing one for that year
const saveClassroom = async (teacherId, academicYear, className) => {
  const existing = await findClassroom(teacherId, academicYear);
  if (existing) {
    return db.one('UPDATE classrooms SET class_name = $2 WHERE classroom_id = $1 RETURNING *', [existing.classroom_id, className]);
  }
  return db.one(
    'INSERT INTO classrooms (teacher_id, class_name, academic_year) VALUES ($1, $2, $3) RETURNING *',
    [teacherId, className, academicYear]
  );
};

// Enroll a student in a classroom (running it twice is safe)
const enrollStudent = (studentId, classroomId) =>
  db.none(
    'INSERT INTO enrollments (student_id, classroom_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [studentId, classroomId]
  );

module.exports = { findClassroom, saveClassroom, enrollStudent };
