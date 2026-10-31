const express = require('express');

const words = express.Router();

const { authenticate } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');
const { canModify } = require('../utils/ownership');

// Reading words is public (Vocabulary + Flashcards pages work logged out).
// Adding needs a login; editing/deleting is owner or admin only.
const userController = require('./userController');
words.use('/:userId/dictionary', userController);

const {
  allWords,
  deleteWord,
  createWord,
  updateWord,
  getAWord,
  getWordById,
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

// Create a word: it always belongs to the logged-in user (users_id in the body is ignored)
words.post('/', authenticate, async (req, res) => {
  try {
    const addWord = await createWord({ ...req.body, users_id: req.user.id });
    res.status(200).json({ success: true, payload: addWord });
  } catch (error) {
    sendDbError(res, error, 'Word cannot be added');
  }
});

// Update a word: only the owner or an admin
words.put('/:dictionaryId', authenticate, async (req, res) => {
  try {
    const existing = await getWordById(req.params.dictionaryId);
    if (!existing) return res.status(404).json({ success: false, message: 'Word not found' });
    if (!canModify(req.user, existing.users_id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own words' });
    }
    // keep the original owner even if the body sends a different users_id
    const updatedWord = await updateWord({ ...req.body, users_id: existing.users_id }, req.params.dictionaryId);
    if (!updatedWord) return res.status(404).json({ success: false, message: 'Word not found' });
    res.status(200).json({ success: true, payload: updatedWord });
  } catch (error) {
    sendDbError(res, error, 'Word cannot be updated');
  }
});

// Delete a word: only the owner or an admin
words.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await getWordById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, payload: { id: undefined } });
    if (!canModify(req.user, existing.users_id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own words' });
    }
    const deleting = await deleteWord(req.params.id);
    if (!deleting) return res.status(404).json({ success: false, payload: { id: undefined } });
    res.status(200).json({ success: true, payload: deleting });
  } catch (error) {
    sendDbError(res, error, 'Word cannot be deleted');
  }
});

module.exports = words;
