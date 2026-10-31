const db = require('../db/dbConfig.js');

// Errors throw to the route; the route decides the HTTP status.
const getAdmin = (userId) => db.any('SELECT * FROM firebase WHERE id = $1', userId);

module.exports = {
  getAdmin,
};
