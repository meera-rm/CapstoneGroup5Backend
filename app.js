const express = require('express');

const app = express();
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(cors());

const bookController = require('./controllers/bookController.js');
const teachersController = require('./controllers/teachersController.js');
const logController = require('./controllers/logController.js');
const studentController = require('./controllers/studentController.js');
const commentController = require('./controllers/commentController.js');
const userController = require('./controllers/userController.js');
const subscriptionController = require('./controllers/subscriptionController.js');
const dictionaryController = require('./controllers/dictionaryController.js');
const noteController = require('./controllers/noteController.js');

app.get('/', (req, res) => {
  res.status(200).send('Welcome to Scholar Sheep!');
});
app.use('/api/users', userController);
app.use('/api/books', bookController);
app.use('/api/teachers', teachersController);
app.use('/api/logs', logController);
app.use('/api/students', studentController);
app.use('/api/comments', commentController);
app.use('/api/subscriptions', subscriptionController);
app.use('/api/dictionary', dictionaryController);
app.use('/api/notes', noteController);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

// render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.get('*', (req, res) => {
  res.status(404).send('Not found');
});

module.exports = app;
