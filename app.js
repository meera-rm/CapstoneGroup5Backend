const express = require('express');

const app = express();
const cors = require('cors');

const bookController = require('./controllers/bookController.js');
const teachersController = require('./controllers/teachersController.js');
const logController = require('./controllers/logController.js');
const studentController = require('./controllers/studentController.js');
const commentController = require('./controllers/commentController.js');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.status(200).send('Welcome to Scholar Sheep!');
});


app.use('/api/books', bookController);
app.use('/api/teachers', teachersController);
app.use('/api/logs', logController);
app.use('/api/students', studentController);
app.use('/api/comments', commentController);

app.get('*', (req, res) => {
	res.status(403).send('Not Found!');
});

module.exports = app;
