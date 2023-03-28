const db = require('../db/dbConfig.js');

const getAllComments = async (logId) => {
  let allComments;
  try {
    if (!logId) {
      allComments = await db.any('SELECT * FROM comments ');
    } else {
      allComments = await db.any(
        'SELECT * FROM comments where logs_id=$1',
        logId
      );
    }

    return allComments;
  } catch (error) {
    return error;
  }
};

const getComment = async (id) => {
  try {
    const oneComment = await db.one(
      'SELECT * FROM comments WHERE comment_id=$1',
      id
    );
    return oneComment;
  } catch (error) {
    return error;
  }
};

const getCommentByLogId = async (id) => {
  try {
    const oneComment = await db.oneOrNone(
      'SELECT * FROM comments WHERE logs_id=$1',
      id
    );
    return oneComment;
  } catch (error) {
    return error;
  }
};

const newComment = async (comment) => {
  let { teacher_comments, logs_id, teachers_id } = comment;

  try {
    const newComment = await db.one(
      'INSERT INTO comments (teacher_comments, logs_id,teachers_id) VALUES($1, $2 ,$3) RETURNING *',
      [teacher_comments, logs_id, teachers_id]
    );
    // console.log('new Comment in queries',newComment)

    return newComment;
  } catch (error) {
    return error;
  }
};

const deleteComment = async (id) => {
  try {
    const deletedComment = await db.one(
      'DELETE FROM comments WHERE comment_id=$1 RETURNING *',
      id
    );
    return deletedComment;
  } catch (error) {
    return error;
  }
};

const updateComment = async (comment, commentId) => {
  let { teacher_comments, logs_id, teachers_id } = comment;

  try {
    const updatedComment = await db.one(
      'UPDATE comments SET teacher_comments=$1, logs_id=$2, teachers_id=$3 where comment_id=$4 RETURNING *',
      [teacher_comments, logs_id, teachers_id, commentId]
    );

    console.log('update comment', updatedComment);

    return updatedComment;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getAllComments,
  getComment,
  newComment,
  deleteComment,
  updateComment,
  getCommentByLogId,
};
