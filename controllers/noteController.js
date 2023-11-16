//controls the routes the way it goes for
const express = require('express');
//access to being able to things like get or set, update or delete
const notes = express.Router();

const db = require('../db/dbConfig');
const userController = require('./userController');
notes.use('/:userId/notes', userController);

const {
  getAllNotes,
  getANote,
  createNote,
  updateNote,
  deleteNote,
} = require('../queries/notes');


//Index
notes.get('/', async (req, res) => {

  try {
    const allNotes = await getAllNotes();
    res.status(200).json({ success: true, payload: allNotes });
  } catch (error) {
    res.status(404).json({ sucess: false, message: 'no Notes found' });
  }
});

// //Show
notes.get('/:noteId', async (req, res) => {
  console.log('get one /:id');
  const { noteId } = req.params;
  try {
    const noteFound = await getANote(noteId);
    res.status(200).json({ success: true, payload: noteFound });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Cannot find the notes with the given id',
    });
  }
});

// //CREATE
notes.post('/new',  async (req, res) => {
  const newNote= req.body;
  console.log('newnote in controller',newNote)
  try {
    const addNote = await createNote(newNote);
    res.status(200).json({
      success: true,
      payload: addNote[0]
    });
    console.log(res.payload)
  } catch (error) {
    // console.log('Caught in error');
    console.log(error.message);
    res.status(404).json({ success: false, message: 'Note cannot be added' });
  }
});

// //update
notes.put('/:noteId', async (req, res) => {
  console.log('Put /:noteId',req.body);
  const { noteId } = req.params;

  try {
    const updatedNote = await updateNote(req.body, noteId);
    res.status(200).json({ success: true, payload: updatedNote });
  } catch (error) {
    //console.log(error);
    res
      .status(404)
      .json({ success: false, message: 'note info cannot be updated' });
  }
});

// //DELETE
notes.delete('/:noteId', async (req, res) => {
  console.log('Delete /:noteId', req.body, req.params);
  const { noteId } = req.params;
  try {
    const deletedNote = await deleteNote(noteId);
    res.status(200).json({ success: true, payload: deletedNote});
  } catch (error) {
    res.status(404).json({ success: false, message: 'Note not found' });
  }
});

module.exports = notes;
