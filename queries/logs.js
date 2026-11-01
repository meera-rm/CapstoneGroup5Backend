const db = require('../db/dbConfig.js');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

const getLogsPage = async (studentId, limit, offset) => {
  const where = studentId ? 'WHERE students_id = $/studentId/' : '';
  const params = { studentId, limit, offset };
  const logs = await db.any(
    `SELECT * FROM logs ${where} ORDER BY log_id DESC LIMIT $/limit/ OFFSET $/offset/`,
    params
  );
  const { total } = await db.one(`SELECT COUNT(*)::int AS total FROM logs ${where}`, params);
  return { logs, total };
};

// Get all: a list (all logs, or one student's logs)
const getAllLogs = (studentId) =>
  studentId
    ? db.any('SELECT * FROM logs WHERE students_id=$1 ORDER BY log_id', studentId)
    : db.any('SELECT * FROM logs ORDER BY log_id');

// Get one: the log, or null
const getALog = (id) => db.oneOrNone('SELECT * FROM logs WHERE log_id=$1', id);


// Logs for every student enrolled in a classroom this teacher teaches
const getLogsForTeacher = (teacherId) =>
  db.any(
    `SELECT l.* FROM logs l
     JOIN enrollments e ON e.student_id = l.students_id
     JOIN classrooms c  ON c.classroom_id = e.classroom_id
     WHERE c.teacher_id = $1
     ORDER BY l.log_id`,
    teacherId
  );

// One page of logs for a teacher's class, plus the total count
const getLogsPageForTeacher = async (teacherId, limit, offset) => {
  const logs = await db.any(
    `SELECT l.* FROM logs l
     JOIN enrollments e ON e.student_id = l.students_id
     JOIN classrooms c  ON c.classroom_id = e.classroom_id
     WHERE c.teacher_id = $1
     ORDER BY l.log_id DESC
     LIMIT $2 OFFSET $3`,
    [teacherId, limit, offset]
  );
  const { total } = await db.one(
    `SELECT COUNT(*)::int AS total FROM logs l
     JOIN enrollments e ON e.student_id = l.students_id
     JOIN classrooms c  ON c.classroom_id = e.classroom_id
     WHERE c.teacher_id = $1`,
    [teacherId]
  );
  return { logs, total };
};

// Create: always exactly one new row
const createLog = (log) => {
  const {
    reading_inference,
    book_title,
    reading_minutes,
    pages_read,
    books_id,
    students_id,
  } = log;

  return db.one(
    'INSERT INTO logs (reading_inference, book_title, reading_minutes, pages_read, books_id, students_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [reading_inference, book_title, reading_minutes, pages_read, books_id, students_id]
  );
};

// Delete: the deleted log, or null
const deleteLog = (id) => db.oneOrNone('DELETE FROM logs WHERE log_id = $1 RETURNING *', id);

// Update: the updated log, or null
const updateLog = (log, logId) => {
  const {
    reading_inference,
    book_title,
    reading_minutes,
    pages_read,
    books_id,
    students_id,
  } = log;

  return db.oneOrNone(
    'UPDATE logs SET reading_inference=$1, book_title=$2, reading_minutes=$3, pages_read=$4, books_id=$5, students_id=$6 WHERE log_id=$7 RETURNING *',
    [reading_inference, book_title, reading_minutes, pages_read, books_id, students_id, logId]
  );
};

module.exports = {
  getLogsPage,
  getAllLogs,
  getALog,
  createLog,
  deleteLog,
  updateLog,
  getLogsForTeacher,
  getLogsPageForTeacher,
};
