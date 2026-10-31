const db = require('../db/dbConfig.js');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

// Get all: a list (admin only — every user's notes)
const getAllNotes = () => db.any('SELECT * FROM notes ORDER BY note_id');

// Get one user's notes: a list (empty if they have none)
const getNotesByUser = (userId) =>
  db.any('SELECT * FROM notes WHERE users_id=$1 ORDER BY note_id', userId);

// Get one: the note, or null
const getANote = (noteId) => db.oneOrNone('SELECT * FROM notes WHERE note_id=$1', noteId);

// Create: always exactly one new row
const createNote = (note) => {
  const { note_title, textnotes, users_id } = note;
  return db.one(
    'INSERT INTO notes (note_title, textnotes, users_id) VALUES ($1, $2, $3) RETURNING *',
    [note_title, textnotes, users_id]
  );
};

// Update: the updated note, or null
const updateNote = (note, noteId) => {
  const { note_title, textnotes, users_id } = note;
  return db.oneOrNone(
    'UPDATE notes SET note_title=$1, textnotes=$2, users_id=$3 WHERE note_id=$4 RETURNING *',
    [note_title, textnotes, users_id, noteId]
  );
};

// Delete: the deleted note, or null
const deleteNote = (noteId) =>
  db.oneOrNone('DELETE FROM notes WHERE note_id=$1 RETURNING *', noteId);

module.exports = {
  getAllNotes,
  getNotesByUser,
  getANote,
  createNote,
  updateNote,
  deleteNote,
};
