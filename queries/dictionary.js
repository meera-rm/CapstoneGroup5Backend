const db = require('../db/dbConfig');

// display all words not sure if we need this route but here it is anyway

const allWords = async () => {
  try {
    return await db.any('SELECT * FROM personal_dictionary');
  } catch (error) {
    return error;
  }
};

// get one word
const getAWord = async (word) => {
  try {
    const dictionary = await db.one(
      'SELECT * FROM personal_dictionary WHERE word=$1',
      word
    );
    return dictionary;
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `Cannot find the subscription with the given id"`,
    });
    // return error;
  }
};

// delete a word
const deleteWord = async (dicitonaryId) => {
  try {
    return await db.one(
      'DELETE FROM personal_dictionary WHERE dictionary_id=$1 RETURNING *',
      dicitonaryId
    );
  } catch (error) {
    return error;
  }
};

// creating new word

const createWord = async (wordDict) => {
  console.log('wordDict',wordDict);
  let {
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

  try {
    const newWord = await db.one(
      'INSERT INTO personal_dictionary(word, grade,partsofSpeech, phonetic,definitions,example, synonyms,antonyms,users_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9) RETURNING *',
      [
        word,
        grade,
        partsofSpeech,
        phonetic,
        definitions,
        example,
        synonyms,
        antonyms,
        users_id,
      ]
    );
   console.log(newWord)
    return newWord;
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

//check if word exists in the dictionary
const checkWord = async (words) => {
  console.log('worddict', words);
  let {
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

  try {
    const insertWord = await db.one(
      `INSERT INTO personal_dictionary
         (word, grade, partsofSpeech,phonetic, definitions, example, synonyms, antonyms, users_id)
         SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9
         WHERE NOT EXISTS (
           SELECT dictionary_id FROM personal_dictionary
           WHERE word = $1 AND users_id = $2
         )
         RETURNING *`,
      // 'INSERT INTO personal_dictionary(word, grade,partsofSpeech,definitions,example, synonyms,antonyms,users_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ) RETURNING *',
      [
        word,
        grade,
        partsofSpeech,
        phonetic,
        definitions,
        example,
        synonyms,
        antonyms,
        users_id,
      ]
    );
    return insertWord;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

// update/edit teacher acct
const updateWord = async (dictionary, dicitonaryId) => {
  let {
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

  try {
    return await db.one(
      'UPDATE personal_dictionary SET word = $1, grade=$2, partsofSpeech = $3, phonetic = $4 , definitions = $5, example = $6, synonyms = $7,antonyms = $8, users_id = $9 where dictionary_id = $10 RETURNING *',
      [
        word,
        grade,
        partsofSpeech,
        phonetic,
        definitions,
        example,
        synonyms,
        antonyms,
        users_id,
        dicitonaryId,
      ]
    );
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

module.exports = {
  allWords,
  getAWord,
  deleteWord,
  createWord,
  checkWord,
  updateWord,
};
