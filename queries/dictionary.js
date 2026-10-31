const db = require('../db/dbConfig');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

// Get all: a list
const allWords = () => db.any('SELECT * FROM personal_dictionary ORDER BY dictionary_id');

// Get one: the first entry for this word, or null
// (the same word can be saved by several users, so LIMIT 1 keeps oneOrNone from failing)
const getAWord = (word) =>
  db.oneOrNone(
    'SELECT * FROM personal_dictionary WHERE word=$1 ORDER BY dictionary_id LIMIT 1',
    word
  );

// Get one by id: the word, or null (used for ownership checks)
const getWordById = (dictionaryId) =>
  db.oneOrNone('SELECT * FROM personal_dictionary WHERE dictionary_id=$1', dictionaryId);

// Delete: the deleted word, or null
const deleteWord = (dictionaryId) =>
  db.oneOrNone('DELETE FROM personal_dictionary WHERE dictionary_id=$1 RETURNING *', dictionaryId);

// Create: always exactly one new row
const createWord = (wordDict) => {
  const {
    word,
    grade,
    partsofSpeech,
    phonetic,
    definitions,
    example,
    synonyms,
    antonyms,
    users_id,
  } = wordDict;

  return db.one(
    'INSERT INTO personal_dictionary (word, grade, partsofSpeech, phonetic, definitions, example, synonyms, antonyms, users_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [word, grade, partsofSpeech, phonetic, definitions, example, synonyms, antonyms, users_id]
  );
};

// Insert the word only if this user hasn't saved it yet.
// Returns the new row, or null if it already exists.
const checkWord = (words) => {
  const {
    word,
    grade,
    partsofSpeech,
    phonetic,
    definitions,
    example,
    synonyms,
    antonyms,
    users_id,
  } = words;

  return db.oneOrNone(
    `INSERT INTO personal_dictionary
       (word, grade, partsofSpeech, phonetic, definitions, example, synonyms, antonyms, users_id)
     SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9
     WHERE NOT EXISTS (
       SELECT dictionary_id FROM personal_dictionary
       WHERE word = $1 AND users_id = $9
     )
     RETURNING *`,
    [word, grade, partsofSpeech, phonetic, definitions, example, synonyms, antonyms, users_id]
  );
};

// Update: the updated word, or null
const updateWord = (dictionary, dictionaryId) => {
  const {
    word,
    grade,
    partsofSpeech,
    phonetic,
    definitions,
    example,
    synonyms,
    antonyms,
    users_id,
  } = dictionary;

  return db.oneOrNone(
    'UPDATE personal_dictionary SET word=$1, grade=$2, partsofSpeech=$3, phonetic=$4, definitions=$5, example=$6, synonyms=$7, antonyms=$8, users_id=$9 WHERE dictionary_id=$10 RETURNING *',
    [word, grade, partsofSpeech, phonetic, definitions, example, synonyms, antonyms, users_id, dictionaryId]
  );
};

module.exports = {
  allWords,
  getAWord,
  getWordById,
  deleteWord,
  createWord,
  checkWord,
  updateWord,
};
