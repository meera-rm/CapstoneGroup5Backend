//controls the routes the way it goes for
const express = require('express');
//access to being able to things like get or set, update or delete
const notes = express.Router();

const { authenticate } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');
const userController = require('./userController');

notes.use(authenticate); // every notes route needs a token
notes.use('/:userId/notes', userController);

const {
  getAllNotes,
  getANote,
  createNote,
  updateNote,
  deleteNote,
} = require('../queries/notes');

// Index
notes.get('/', async (req, res) => {
  try {
    res.status(200).json({ success: true, payload: await getAllNotes() });
  } catch (error) {
    sendDbError(res, error, 'Could not load notes');
  }
});

// Show
notes.get('/:noteId', async (req, res) => {
  try {
    const noteFound = await getANote(req.params.noteId);
    if (!noteFound) {
      return res.status(404).json({ success: false, message: 'Cannot find the note with the given id' });
    }
    res.status(200).json({ success: true, payload: noteFound });
  } catch (error) {
    sendDbError(res, error, 'Could not load note');
  }
});

// Create
notes.post('/new', async (req, res) => {
  try {
    const addNote = await createNote(req.body);
    res.status(200).json({ success: true, payload: addNote });
  } catch (error) {
    sendDbError(res, error, 'Note cannot be added');
  }
});

// Update
notes.put('/:noteId', async (req, res) => {
  try {
    const updatedNote = await updateNote(req.body, req.params.noteId);
    if (!updatedNote) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, payload: updatedNote });
  } catch (error) {
    sendDbError(res, error, 'Note cannot be updated');
  }
});

// Delete
notes.delete('/:noteId', async (req, res) => {
  try {
    const deletedNote = await deleteNote(req.params.noteId);
    if (!deletedNote) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, payload: deletedNote });
  } catch (error) {
    sendDbError(res, error, 'Note cannot be deleted');
  }
});

module.exports = notes;
