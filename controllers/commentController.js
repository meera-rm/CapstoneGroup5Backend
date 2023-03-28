//controls the routes the way it goes for
const express = require('express');
//access to being able to things like get or set, update or delete
const comments = express.Router({ mergeParams: true });

// const logController = require('./logController.js');
// comments.use('/logs/logid', logController);

const db = require('../db/dbConfig');

const {
  getAllComments,
  getComment,
  newComment,
  deleteComment,
  updateComment,
  getCommentByLogId
} = require('../queries/comments');

//Index
comments.get('/', async (req, res) => {

  const { logId }=req.params;

  console.log('get all /');
  try {
    const allcomments = await getAllComments(logId);
    res.status(200).json({ success: true, payload: allcomments });
  } catch (error) {
    res.status(404).json({ sucess: false, message: 'no comments found' });
  }
});

// //Show
comments.get('/:commentId', async (req, res) => {
  console.log('get one /:id');
  const { commentId } = req.params;
  try {
    const commentFound = await getComment(commentId);
    res.status(200).json({ success: true, payload: commentFound });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Cannot find the comment with the given id',
    });
  }
});


//get comment by logid
comments.get('/logs/:logId', async (req, res) => {

  const { logId } = req.params;

  try {
    const commentFound = await getCommentByLogId(logId);
    res.status(200).json({ success: true, payload: commentFound });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Cannot find the comment with the given id',
    });
  }
});

// CREATE

comments.post('/new',  async (req, res) => {

  const newcomment = req.body;
  try {
    const addcomment = await newComment(newcomment);
    res.status(200).json({
      success: true,
      payload: addcomment[0],
    });
  } catch (error) {
    // console.log('Caught in error');
    console.log(error.message);
    res
      .status(404)
      .json({ success: false, message: 'comment cannot be added' });
  }
});

// //update
comments.put('/:commentId', async (req, res) => {
  console.log('Put /:commentId');
  const { commentId } = req.params;

  try {
    const updatedcomment = await updateComment(req.body, commentId);
    res.status(200).json({ success: true, payload: updatedcomment });
  } catch (error) {
    //console.log(error);
    res
      .status(404)
      .json({ success: false, message: 'comment info cannot be updated' });
  }
});

// //DELETE
comments.delete('/:commentId', async (req, res) => {
  console.log('Delete /:commentId', req.body, req.params);
  const { commentId } = req.params;
  try {
    const deletedcomment = await deleteComment(commentId);
    res.status(200).json({ success: true, payload: deletedcomment });
  } catch (error) {
    res.status(404).json({ success: false, message: 'comment not found' });
  }
});

module.exports = comments;
