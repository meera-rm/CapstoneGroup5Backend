//controls the routes the way it goes for
const express = require('express');
//access to being able to things like get or set, update or delete
const comments = express.Router({ mergeParams: true });

const { getPagination, buildMeta } = require('../utils/pagination');
const { authenticate, authorize } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');

comments.use(authenticate);

const {
  getCommentsPage,
  getAllComments,
  getComment,
  newComment,
  deleteComment,
  updateComment,
  getCommentByLogId,
} = require('../queries/comments');

// Index
comments.get('/', async (req, res) => {
  const { logId } = req.params;
  try {
    if (!req.query.page) {
      return res.json({ success: true, payload: await getAllComments(logId) });
    }
    const { page, limit, offset } = getPagination(req.query, 10);
    const { comments: rows, total } = await getCommentsPage(logId, limit, offset);
    res.json({ success: true, payload: rows, pagination: buildMeta(page, limit, total) });
  } catch (error) {
    sendDbError(res, error, 'Could not load comments');
  }
});

// Show
comments.get('/:commentId', async (req, res) => {
  try {
    const commentFound = await getComment(req.params.commentId);
    if (!commentFound) {
      return res.status(404).json({ success: false, message: 'Cannot find the comment with the given id' });
    }
    res.status(200).json({ success: true, payload: commentFound });
  } catch (error) {
    sendDbError(res, error, 'Could not load comment');
  }
});

// Get the comment for a log (payload is null if the log has no comment yet)
comments.get('/logs/:logId', async (req, res) => {
  try {
    const commentFound = await getCommentByLogId(req.params.logId);
    res.status(200).json({ success: true, payload: commentFound });
  } catch (error) {
    sendDbError(res, error, 'Could not load comment');
  }
});

// Create
comments.post('/new', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const addcomment = await newComment(req.body);
    res.status(200).json({ success: true, payload: addcomment });
  } catch (error) {
    sendDbError(res, error, 'Comment cannot be added');
  }
});

// Update
comments.put('/:commentId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const updatedcomment = await updateComment(req.body, req.params.commentId);
    if (!updatedcomment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, payload: updatedcomment });
  } catch (error) {
    sendDbError(res, error, 'Comment cannot be updated');
  }
});

// Delete
comments.delete('/:commentId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const deletedcomment = await deleteComment(req.params.commentId);
    if (!deletedcomment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, payload: deletedcomment });
  } catch (error) {
    sendDbError(res, error, 'Comment cannot be deleted');
  }
});

module.exports = comments;
