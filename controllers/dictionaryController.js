const express = require('express');

const words = express.Router();

const db = require('../db/dbConfig');

const userController = require('./userController');
words.use('/:userId/dictionary', userController);

const {
  allWords,
  deleteWord,
  createWord,
  updateWord,
  getAWord
} = require('../queries/dictionary.js');

// get all words
words.get('/', async (req, res) => {
  const getAllWords = await allWords();
  console.log(getAllWords)
  if (getAllWords) {
    res.status(200).json({
      success: true,
      payload: getAllWords,
    });
  } else {
    res.status(404).send('There are no words.');
  }
});

// get single word

words.get('/:word', async (req, res) => {
  const { word } = req.params;

  try {
    const singleWord = await getAWord(word);
   
     res.status(200).json({ success: true, payload: singleWord });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error:', error.response);
    res.status(500).json({ message: error.message, code: error.code });
    
  }
});



// creating a word (new)
// words.post('/', async (req, res) => {
//   console.log(req.body);

//   const newWord = req.body;

//   try {
//     if (!newWord.synonyms) {
//       newWord.synonyms = [];
//     }

//     if (!newWord.antonyms) {
//       newWord.antonyms = [];
//     }

//     const addWord = await createWord(newWord);
//     console.log(addWord);
//     res.status(200).json({
//       success: true,
//       payload: addWord[0],
//     });
//   } catch (error) {
//     res.status(404).json({ success: false, message: 'word cannot be added' });
//   }
// });

// creating a word 
words.post('/addWordIfNotExists', async (req, res) => {
 
  const {checkIfWordExists} = req.body
  console.log(checkIfWordExists)
   try {

    if (!checkIfWordExists.synonyms) {
      checkIfWordExists.synonyms = [];
    }

    if (!checkIfWordExists.antonyms) {
      checkIfWordExists.antonyms = [];
    }
    const existsOrAddWord = await checkWord(checkIfWordExists);
   
    res.status(200).json({
      success: true,
      payload: existsOrAddWord,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: 'word cannot be added' });
  }

})


words.put('/:dictionaryId', async (req, res) => {
  const { dictionaryId } = req.params;

  try {
    const updatedWord = await updateWord(req.body, dictionaryId);
    console.log('inupdate query', updatedWord);
    res.status(200).json({ success: true, payload: updatedWord });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: 'Word cannot be updated' });
  }
});

// deleting a Word
words.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleting = await deleteWord(id);
  if (deleting.id) {
    res.status(200).json({ success: true, payload: deleting });
  } else {
    res.status(404).json({ success: false, payload: { id: undefined } });
  }
});

module.exports = words;
