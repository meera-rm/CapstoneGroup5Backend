const db = require('../db/dbConfig.js');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

const getStudentsPage = async (teacherId, limit, offset) => {
  const where = teacherId ? 'WHERE teachers_id = $/teacherId/' : '';
  const params = { teacherId, limit, offset };
  const students = await db.any(
    `SELECT * FROM students ${where} ORDER BY student_id LIMIT $/limit/ OFFSET $/offset/`,
    params
  );
  const { total } = await db.one(`SELECT COUNT(*)::int AS total FROM students ${where}`, params);
  return { students, total };
};

// Get all: a list (all students, or one teacher's students)
const getAllStudents = (teacherId) =>
  teacherId
    ? db.any('SELECT * FROM students WHERE teachers_id=$1 ORDER BY student_id', teacherId)
    : db.any('SELECT * FROM students ORDER BY student_id');

// Get one: the student, or null
// A parent's children: students whose parent_email matches the parent's login email
const getStudentsByParentEmail = (email) =>
  db.any('SELECT * FROM students WHERE LOWER(parent_email) = LOWER($1) ORDER BY student_id', email);

const getAStudent = (id) => db.oneOrNone('SELECT * FROM students WHERE student_id=$1', id);


// A student's own record, found by their login
const getStudentByUserId = (userId) =>
  db.oneOrNone('SELECT * FROM students WHERE user_id = $1', userId);

// Students enrolled in any classroom this teacher teaches
const getStudentsInTeacherClasses = (teacherId) =>
  db.any(
    `SELECT DISTINCT s.* FROM students s
     JOIN enrollments e ON e.student_id = s.student_id
     JOIN classrooms c  ON c.classroom_id = e.classroom_id
     WHERE c.teacher_id = $1
     ORDER BY s.student_id`,
    teacherId
  );

// Is this student enrolled in a classroom this teacher teaches?
const isStudentInTeacherClass = (studentId, teacherId) =>
  db.oneOrNone(
    `SELECT 1 FROM enrollments e
     JOIN classrooms c ON c.classroom_id = e.classroom_id
     WHERE e.student_id = $1 AND c.teacher_id = $2
     LIMIT 1`,
    [studentId, teacherId]
  );



// Create: always exactly one new row
const createStudent = (student) => {
  const {
    student_name,
    parent_name,
    parent_email,
    student_email,
    grade,
    academic_year,
    reading_level,
    teachers_id,
  } = student;

  return db.one(
    'INSERT INTO students (student_name, parent_name, parent_email, student_email, grade, academic_year, reading_level, teachers_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [student_name, parent_name, parent_email, student_email, grade, academic_year, reading_level, teachers_id]
  );
};

// Delete: the deleted student, or null
const deleteStudent = (id) =>
  db.oneOrNone('DELETE FROM students WHERE student_id = $1 RETURNING *', id);

// Update: the updated student, or null
const updateStudent = (student, studentId) => {
  const {
    student_name,
    parent_name,
    parent_email,
    student_email,
    grade,
    academic_year,
    reading_level,
    teachers_id,
  } = student;

  return db.oneOrNone(
    'UPDATE students SET student_name=$1, parent_name=$2, parent_email=$3, student_email=$4, grade=$5, academic_year=$6, reading_level=$7, teachers_id=$8 WHERE student_id=$9 RETURNING *',
    [student_name, parent_name, parent_email, student_email, grade, academic_year, reading_level, teachers_id, studentId]
  );
};

// Signup helper: claim an unlinked student row whose student_email matches the new login
const linkUnlinkedStudentByEmail = (email, userId) =>
  db.oneOrNone(
    `UPDATE students SET user_id = $2
     WHERE student_id = (SELECT student_id FROM students
                         WHERE LOWER(student_email) = LOWER($1) AND user_id IS NULL
                         ORDER BY student_id LIMIT 1)
     RETURNING *`,
    [email, userId]
  );

module.exports = {
  linkUnlinkedStudentByEmail,
  getStudentsByParentEmail,
  getStudentsPage,
  getAStudent,
  createStudent,
  deleteStudent,
  updateStudent,
  getAllStudents,
  getStudentByUserId,
  isStudentInTeacherClass,
  getStudentsInTeacherClasses,
};
