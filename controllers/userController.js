var express = require('express');
var users = express.Router();
const bcrypt = require('bcrypt');

const db = require('../db/dbConfig.js');
const jwtTokens = require('../utils/jwt-helpers.js');
const validateEmail = require('../utils/emailValidation.js');

/* GET users listing. */
users.get('/', async function (req, res, next) {
  try {
    const users = await db.any('SELECT * FROM users');
    res.json({ users: users });
  } catch (error) {
    res.send({
      status: 'error',
      message: error.message,
    });
  }
});

users.get('/:email', async function (req, res, next) {
  const { email } = req.params;
  try {
    const users = await db.any(
      'SELECT * FROM users where user_email = $1, email'
    );
    res.json({ users: users });
  } catch (error) {
    res.send({
      status: 'error',
      message: error.message,
    });
  }
});

users.post('/login', async (req, res) => {
  try {
    let { username, password } = req.body;

    const user = await db.one('SELECT * FROM users WHERE username=$1', [
      username,
    ]);

    if (!user) {
      res.status(401).send({ error: 'username is not correct' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res
        .status(401)
        .send({ status: 'error', message: 'Invalid password for this user.' });
      return;
    }

    if (user && validPassword) {
      let data = jwtTokens(user);

      res.json(data);
    }
  } catch (error) {
    res.send({
      status: 'error',
      message: error.message,
    });
  }
});

// create new user
users.post('/', async (req, res) => {
  try {
    // get data from request
    let { username, userrole, useravatar, email, password } = req.body;

    // validate data
    if (username.length < 4) {
      throw { message: 'Username must be 4 characters or more' };
    }

    if (password.length < 6) {
      throw { message: 'Password must be 6 characters or more' };
    }

    //validate email with validateemail function
    if (!validateEmail(email)) {
      throw { message: 'Please provide a valid email' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToLowerCase = email.toLowerCase();

    // insert data in users table
    const user = await db.one(
      'INSERT INTO users (username,user_role,user_avatar,email, password) VALUES ($1, $2, $3) RETURNING id, username, user_role, user_avatar,email,',
      [username, userrole, useravatar, emailToLowerCase, hashedPassword]
    );

    if (user) {
      // Generate JWT Token
      let data = jwtTokens(user);

      // send successful response
      res.json(data);
    }
  } catch (error) {
    res.send({
      status: 'error',
      message: error.message,
    });
  }
});

users.get('/authenticate', async (req, res) => {
  try {
    console.log(req.headers);

    console.log(accessToken);
    res.send({});
  } catch (error) {
    res.send('error');
  }
});

module.exports = users;
