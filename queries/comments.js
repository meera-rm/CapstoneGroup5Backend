const db = require('../db/dbConfig.js');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

const getCommentsPage = async (logId, limit, offset) => {
  const where = logId ? 'WHERE logs_id = $/logId/' : '';
  const params = { logId, limit, offset };
  const comments = await db.any(
    `SELECT * FROM comments ${where} ORDER BY comment_id DESC LIMIT $/limit/ OFFSET $/offset/`,
    params
  );
  const { total } = await db.one(`SELECT COUNT(*)::int AS total FROM comments ${where}`, params);
  return { comments, total };
};

// Get all: a list (all comments, or one log's comments)
const getAllComments = (logId) =>
  logId
    ? db.any('SELECT * FROM comments WHERE logs_id=$1 ORDER BY comment_id', logId)
    : db.any('SELECT * FROM comments ORDER BY comment_id');

// All teacher comments on one student's logs (one query), with the log they belong to
const getCommentsForStudent = (studentId) =>
  db.any(
    `SELECT c.logs_id, c.teacher_comments FROM comments c
     JOIN logs l ON l.log_id = c.logs_id
     WHERE l.students_id = $1
     ORDER BY c.comment_id`,
    studentId
  );

// Get one: the comment, or null
const getComment = (id) => db.oneOrNone('SELECT * FROM comments WHERE comment_id=$1', id);

// The first comment on a log, or null
const getCommentByLogId = (logId) =>
  db.oneOrNone('SELECT * FROM comments WHERE logs_id=$1 ORDER BY comment_id LIMIT 1', logId);

// Create: always exactly one new row
const newComment = (comment) => {
  const { teacher_comments, logs_id, teachers_id } = comment;
  return db.one(
    'INSERT INTO comments (teacher_comments, logs_id, teachers_id) VALUES ($1, $2, $3) RETURNING *',
    [teacher_comments, logs_id, teachers_id]
  );
};

// Delete: the deleted comment, or null
const deleteComment = (id) =>
  db.oneOrNone('DELETE FROM comments WHERE comment_id=$1 RETURNING *', id);

// Update: the updated comment, or null
const updateComment = (comment, commentId) => {
  const { teacher_comments, logs_id, teachers_id } = comment;
  return db.oneOrNone(
    'UPDATE comments SET teacher_comments=$1, logs_id=$2, teachers_id=$3 WHERE comment_id=$4 RETURNING *',
    [teacher_comments, logs_id, teachers_id, commentId]
  );
};

module.exports = {
  getCommentsForStudent,
  getCommentsPage,
  getAllComments,
  getComment,
  newComment,
  deleteComment,
  updateComment,
  getCommentByLogId,
};
