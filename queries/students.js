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

module.exports = {
  getStudentsByParentEmail,
  getStudentsPage,
  getAStudent,
  createStudent,
  deleteStudent,
  updateStudent,
  getAllStudents,
};
