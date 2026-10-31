
require('dotenv').config();
const express = require('express');

const app = express();
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');


// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//
const userController = require('./controllers/userController.js');
const healthController =require('./controllers/healthController.js')

//legacy controllers
const bookController = require('./controllers/bookController.js');
const teachersController = require('./controllers/teachersController.js');
const logController = require('./controllers/logController.js');
const studentController = require('./controllers/studentController.js');
const commentController = require('./controllers/commentController.js');
const subscriptionController = require('./controllers/subscriptionController.js');
const dictionaryController = require('./controllers/dictionaryController.js');
const noteController = require('./controllers/noteController.js');


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ScholarSheep v2 API!',
    version: '2.0.0',
    endpoints: {
      auth: [
        'POST   /api/auth/register',
        'POST   /api/auth/login',
        'POST   /api/auth/google',
        'GET    /api/auth/me',
      ],
      users: [
        'GET    /api/users            (teacher, admin)   add ?page=1&limit=20 to paginate',
        'GET    /api/users/:id        (self, teacher, admin)',
        'PUT    /api/users/:id        (self, admin)',
        'DELETE /api/users/:id        (admin)',
      ],
    },
  });
});


app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', userController);


app.use('/api/health',healthController);
app.use('/api/books', bookController);
app.use('/api/teachers', teachersController);
app.use('/api/logs', logController);
app.use('/api/students', studentController);
app.use('/api/comments', commentController);
app.use('/api/subscriptions', subscriptionController);
app.use('/api/dictionary', dictionaryController);
app.use('/api/notes', noteController);



// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});


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



module.exports = app;
