const db = require('../db/dbConfig');

// Everything the admin link page needs, in one call
const getLinkData = async () => ({
  users: await db.any(
    `SELECT user_id, user_name, user_email, user_role FROM users
     WHERE user_role IN ('teacher', 'student') ORDER BY user_name`
  ),
  teachers: await db.any(
    'SELECT teacher_id, teacher_name, school_name, teacher_email, user_id FROM teachers ORDER BY teacher_name'
  ),
  students: await db.any(
    'SELECT student_id, student_name, student_email, parent_email, user_id FROM students ORDER BY student_name'
  ),
});

// A login can belong to only one record, so clear it from any other row first (one transaction)
const linkTeacher = (teacherId, userId) =>
  db.tx(async (t) => {
    if (userId) {
      await t.none('UPDATE teachers SET user_id = NULL WHERE user_id = $1 AND teacher_id <> $2', [userId, teacherId]);
    }
    return t.oneOrNone('UPDATE teachers SET user_id = $2 WHERE teacher_id = $1 RETURNING *', [teacherId, userId]);
  });

const linkStudent = (studentId, userId) =>
  db.tx(async (t) => {
    if (userId) {
      await t.none('UPDATE students SET user_id = NULL WHERE user_id = $1 AND student_id <> $2', [userId, studentId]);
    }
    return t.oneOrNone('UPDATE students SET user_id = $2 WHERE student_id = $1 RETURNING *', [studentId, userId]);
  });

module.exports = { getLinkData, linkTeacher, linkStudent };
