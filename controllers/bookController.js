//controls the routes the way it goes for
const express = require('express');
//access to being able to things like get or set, update or delete
const books = express.Router();

const db = require('../db/dbConfig');

const {
  getAllBooks,
  getABook,
  createBook,
  updateBook,
  deleteBook,
} = require('../queries/books');

const { checkPicture } = require('../validations/checkBooks');

const logController = require('./logController.js');
books.use('/:bookId/logs', logController);

//Index
books.get('/', async (req, res) => {
  console.log('get all /');
  try {
    const allBooks = await getAllBooks();
    res.status(200).json({ success: true, payload: allBooks });
  } catch (error) {
    res.status(404).json({ sucess: false, message: 'no Books found' });
  }
});

// //Show
books.get('/:bookId', async (req, res) => {
  console.log('get one /:id');
  const { bookId } = req.params;
  try {
    const bookFound = await getABook(bookId);
    res.status(200).json({ success: true, payload: bookFound });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Cannot find the book with the given id',
    });
  }
});

// //CREATE
books.post('/new', checkPicture, async (req, res) => {
  const newBook = req.body;
  try {
    const addBook = await createBook(newBook);
    res.status(200).json({
      success: true,
      payload: addBook[0],
    });
  } catch (error) {
    // console.log('Caught in error');
    console.log(error.message);
    res.status(404).json({ success: false, message: 'Book cannot be added' });
  }
});

// //update
books.put('/:bookId', async (req, res) => {
  console.log('Put /:bookId');
  const { bookId } = req.params;

  try {
    const updatedBook = await updateBook(req.body, bookId);
    res.status(200).json({ success: true, payload: updatedBook });
  } catch (error) {
    //console.log(error);
    res
      .status(404)
      .json({ success: false, message: 'Book info cannot be updated' });
  }
});

// //DELETE
books.delete('/:bookId', async (req, res) => {
  console.log('Delete /:bookId', req.body, req.params);
  const { bookId } = req.params;
  try {
    const deletedBook = await deleteBook(bookId);
    res.status(200).json({ success: true, payload: deletedBook });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Book not found' });
  }
});

module.exports = books;
