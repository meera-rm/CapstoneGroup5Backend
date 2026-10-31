const db = require('../db/dbConfig.js');

const getBooksPage = async ({ q, readingLevel, limit, offset }) => {
  try {
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
  } catch (error) {
    console.error('getBooksPage failed:', error.message);
    throw error; // let the route's catch send a 500
  }
};

const getAllBooks = async () => {
  try {
    const allBooks = await db.any('SELECT * FROM books');
    return allBooks;
  } catch (error) {
    return error;
  }
};

const getABook = async (bookId) => {
  try {
    const book = await db.one('SELECT * FROM books WHERE book_id=$1', bookId);
    return book;
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `Cannot find the book with the given id"`,
    });
    // return error;
  }
};

const createBook = async (book) => {
  let {
    book_title,
    book_author,
    isbn_number,
    publication,
    book_picture,
    grade,
    reading_level,
  } = book;

  try {
    return await db.any(
      'INSERT INTO books (book_title, book_author, isbn_number, publication, book_picture,grade,reading_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        book_title,
        book_author,
        isbn_number,
        publication,
        book_picture,
        grade,
        reading_level,
      ]
    );
  } catch (error) {
    console.log(error.message);
    // throw new Error(error.message);
    res.status(404).json({ success: false, message: 'Book cannot be added' });
  }
};

const updateBook = async (book, bookId) => {
  let {
    book_title,
    book_author,
    isbn_number,
    publication,
    book_picture,
    grade,
    reading_level,
  } = book;
  try {
    return await db.one(
      'UPDATE books SET book_title=$1, book_author=$2, isbn_number=$3, publication=$4, book_picture=$5,grade=$6,reading_level=$7 where book_id=$8 RETURNING *',
      [
        book_title,
        book_author,
        isbn_number,
        publication,
        book_picture,
        grade,
        reading_level,
        bookId,
      ]
    );
  } catch (error) {
    //console.log(error.message || error);
    // return error;
    res
      .status(404)
      .json({ success: false, message: 'Book Info cannot be edited' });
  }
};

const deleteBook = async (bookId) => {
  try {
    return await db.one(
      'DELETE FROM books WHERE book_id=$1 RETURNING *',
      bookId
    );
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

module.exports = {
  getBooksPage,
  getAllBooks,
  getABook,
  createBook,
  updateBook,
  deleteBook,
};
