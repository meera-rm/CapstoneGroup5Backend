const express = require('express');

const words = express.Router();

const { authenticate } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');

words.use(authenticate); // every dictionary route needs a token
const userController = require('./userController');
words.use('/:userId/dictionary', userController);

const {
  allWords,
  deleteWord,
  createWord,
  updateWord,
  getAWord,
} = require('../queries/dictionary.js');

// Get all words
words.get('/', async (req, res) => {
  try {
    res.status(200).json({ success: true, payload: await allWords() });
  } catch (error) {
    sendDbError(res, error, 'Could not load words');
  }
});

// Get a single word
words.get('/:word', async (req, res) => {
  try {
    const singleWord = await getAWord(req.params.word);
    if (!singleWord) return res.status(404).json({ success: false, message: 'Word not found' });
    res.status(200).json({ success: true, payload: singleWord });
  } catch (error) {
    sendDbError(res, error, 'Could not load word');
  }
});

// Create a word
words.post('/', async (req, res) => {
  try {
    const addWord = await createWord(req.body);
    res.status(200).json({ success: true, payload: addWord });
  } catch (error) {
    sendDbError(res, error, 'Word cannot be added');
  }
});

// Update a word
words.put('/:dictionaryId', async (req, res) => {
  try {
    const updatedWord = await updateWord(req.body, req.params.dictionaryId);
    if (!updatedWord) return res.status(404).json({ success: false, message: 'Word not found' });
    res.status(200).json({ success: true, payload: updatedWord });
  } catch (error) {
    sendDbError(res, error, 'Word cannot be updated');
  }
});

// Delete a word
words.delete('/:id', async (req, res) => {
  try {
    const deleting = await deleteWord(req.params.id);
    if (!deleting) return res.status(404).json({ success: false, payload: { id: undefined } });
    res.status(200).json({ success: true, payload: deleting });
  } catch (error) {
    sendDbError(res, error, 'Word cannot be deleted');
  }
});

module.exports = words;
