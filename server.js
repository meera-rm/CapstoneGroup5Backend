const express = require('express');
const app = require('./app');

require('dotenv').config();

const { PORT } = process.env || 3010;

const message = 'Listening on port';

console.log(message);

app.listen(PORT, () => {
  console.log(`${message} ${PORT}` );
});
