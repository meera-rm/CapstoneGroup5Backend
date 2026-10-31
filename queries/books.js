const db = require('../db/dbConfig.js');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

const getBooksPage = async ({ q, readingLevel, limit, offset }) => {
  const conditions = [];
  if (q) conditions.push('(book_title ILIKE $/search/ OR book_author ILIKE $/search/)');
  if (readingLevel && readingLevel !== 'All') conditions.push('reading_level = $/readingLevel/');
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const params = { search: `%${q}%`, readingLevel, limit, offset };

  const books = await db.any(
    `SELECT * FROM books ${where} ORDER BY book_title, book_id LIMIT $/limit/ OFFSET $/offset/`,
    params
  );
  const { total } = await db.one(`SELECT COUNT(*)::int AS total FROM books ${where}`, params);
  return { books, total };
};

// Get all: a list (empty list when there are none)
const getAllBooks = () => db.any('SELECT * FROM books ORDER BY book_id');

// Get one: the book, or null
const getABook = (bookId) => db.oneOrNone('SELECT * FROM books WHERE book_id=$1', bookId);

// Create: always exactly one new row
const createBook = (book) => {
  const {
    book_title,
    book_author,
    isbn_number,
    publication,
    book_picture,
    grade,
    reading_level,
  } = book;

  return db.one(
    'INSERT INTO books (book_title, book_author, isbn_number, publication, book_picture, grade, reading_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [book_title, book_author, isbn_number, publication, book_picture, grade, reading_level]
  );
};

// Update: the updated book, or null if the id doesn't exist
const updateBook = (book, bookId) => {
  const {
    book_title,
    book_author,
    isbn_number,
    publication,
    book_picture,
    grade,
    reading_level,
  } = book;

  return db.oneOrNone(
    'UPDATE books SET book_title=$1, book_author=$2, isbn_number=$3, publication=$4, book_picture=$5, grade=$6, reading_level=$7 WHERE book_id=$8 RETURNING *',
    [book_title, book_author, isbn_number, publication, book_picture, grade, reading_level, bookId]
  );
};

// Delete: the deleted book, or null
const deleteBook = (bookId) =>
  db.oneOrNone('DELETE FROM books WHERE book_id=$1 RETURNING *', bookId);

module.exports = {
  getBooksPage,
  getAllBooks,
  getABook,
  createBook,
  updateBook,
  deleteBook,
};
