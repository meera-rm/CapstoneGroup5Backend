const db = require('../db/dbConfig.js');

const getAllNotes = async () => {
  try {
    const allNotes = await db.any('SELECT * FROM notes');
    return allNotes;
  } catch (error) {
    return error;
  }
};

const getANote = async (noteId) => {
  try {
    const note = await db.one('SELECT * FROM notes WHERE note_id=$1', noteId);
    return note;
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `Cannot find the note with the given id"`,
    });
    // return error;
  }
};

const createNote = async (note) => {
  console.log('in createnote',note)
  let {
    note_title,
    textnotes,
    users_id
  } = note;

  try {
    return await db.any(
      'INSERT INTO notes (note_title , textnotes,users_id) VALUES ($1, $2, $3) RETURNING *',
      [
        note_title,
        textnotes,
        users_id
      ]
    );
  } catch (error) {
    console.log(error.message);
    // throw new Error(error.message);
    res.status(404).json({ success: false, message: 'Note cannot be added' });
  }
};

const updateNote = async (note, noteId) => {
  let {
    note_title,
    textnotes,
    users_id
  } = note;
  try {
    return await db.one(
      'UPDATE notes SET note_title=$1, textnotes=$2, users_id=$3  where note_id=$4 RETURNING *',
      [
        note_title,
        textnotes,
        users_id,
        noteId,
      ]
    );
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: 'Book Info cannot be edited' });
  }
};

const deleteNote = async (noteId) => {
  try {
    return await db.one(
      'DELETE FROM notes WHERE note_id=$1 RETURNING *',
      noteId
    );
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

module.exports = {
  getAllNotes,
  getANote,
  createNote,
  updateNote,
  deleteNote,
};
