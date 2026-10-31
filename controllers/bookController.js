//controls the routes the way it goes for
const express = require('express');
//access to being able to things like get or set, update or delete
const books = express.Router();

const { getPagination, buildMeta } = require('../utils/pagination');
const { sendDbError } = require('../utils/dbErrors');

const {
  getBooksPage,
  getAllBooks,
  getABook,
  createBook,
  updateBook,
  deleteBook,
} = require('../queries/books');

const { checkPicture } = require('../validations/checkBooks');

const logController = require('./logController.js');
books.use('/:bookId/logs', logController);
const { authenticate, authorize } = require('../middleware/auth');

// Index (public)
books.get('/', async (req, res) => {
  try {
    if (!req.query.page) return res.json({ success: true, payload: await getAllBooks() });

    const { page, limit, offset } = getPagination(req.query, 12);
    const { books: rows, total } = await getBooksPage({
      q: (req.query.q || '').trim(),
      readingLevel: req.query.level,
      limit,
      offset,
    });
    res.json({ success: true, payload: rows, pagination: buildMeta(page, limit, total) });
  } catch (error) {
    sendDbError(res, error, 'Could not load books');
  }
});

// Show (public)
books.get('/:bookId', async (req, res) => {
  try {
    const bookFound = await getABook(req.params.bookId);
    if (!bookFound) return res.status(404).json({ success: false, message: 'Book not found' });
    res.status(200).json({ success: true, payload: bookFound });
  } catch (error) {
    sendDbError(res, error, 'Could not load the book');
  }
});

// Create: any logged-in user
books.post('/new', authenticate, checkPicture, async (req, res) => {
  try {
    const addBook = await createBook(req.body);
    res.status(200).json({ success: true, payload: addBook });
  } catch (error) {
    sendDbError(res, error, 'Book cannot be added');
  }
});

// Update: teachers and admins
books.put('/:bookId', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const updatedBook = await updateBook(req.body, req.params.bookId);
    if (!updatedBook) return res.status(404).json({ success: false, message: 'Book not found' });
    res.status(200).json({ success: true, payload: updatedBook });
  } catch (error) {
    sendDbError(res, error, 'Book info cannot be updated');
  }
});

// Delete: teachers and admins
books.delete('/:bookId', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const deletedBook = await deleteBook(req.params.bookId);
    if (!deletedBook) return res.status(404).json({ success: false, message: 'Book not found' });
    res.status(200).json({ success: true, payload: deletedBook });
  } catch (error) {
    sendDbError(res, error, 'Book cannot be deleted');
  }
});

module.exports = books;
