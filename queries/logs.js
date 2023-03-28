const db = require('../db/dbConfig.js');

const getAllLogs = async (studentId) => {

  let allLogs;
  try {
    if (!studentId) {
      allLogs = await db.any('SELECT * FROM logs');
    } else {
      allLogs = await db.any(
        'SELECT * FROM logs where students_id=$1',
        studentId
      );
    }

    return allLogs;
  } catch (error) {
    return error;
  }
};

const getALog = async (id) => {
  try {
    const oneLog = await db.one('SELECT * FROM logs WHERE log_id=$1', id);
    return oneLog;
  } catch (error) {
    return error;
  }
};

const createLog = async (log) => {
  let {
    reading_inference,
    book_title,
    reading_minutes,
    pages_read,
    books_id,
    students_id,
  } = log;

  try {
    const newLog = await db.one(
      'INSERT INTO logs ( reading_inference,book_title,reading_minutes,pages_read,books_id,students_id ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        reading_inference,
        book_title,
        reading_minutes,
        pages_read,
        books_id,
        students_id,
      ]
    );
    console.log('newlog', newLog);
    return newLog;
  } catch (error) {
    return error;
  }
};

const deleteLog = async (id) => {
  try {
    const deletedLog = await db.one(
      'DELETE FROM logs WHERE log_id = $1 RETURNING *',
      id
    );
    return deletedLog;
  } catch (error) {
    return error;
  }
};

const updateLog = async (log, logId) => {
  let {
    reading_inference,
    book_title,
    reading_minutes,
    pages_read,
    books_id,
    students_id,
  } = log;
  try {
    const updatedLog = await db.one(
      'UPDATE logs SET reading_inference=$1,book_title=$2,reading_minutes=$3,pages_read=$4,books_id=$5,students_id=$6 where log_id=$7 RETURNING *',
      [
        reading_inference,
        book_title,
        reading_minutes,
        pages_read,
        books_id,
        students_id,
        logId,
      ]
    );
    return updatedLog;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getAllLogs,
  getALog,
  createLog,
  deleteLog,
  updateLog,
};
