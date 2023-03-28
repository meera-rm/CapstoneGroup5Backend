const db = require('../db/dbConfig.js');

const getAdmin = async (userId) => {
    try {
      const theAdmin = await db.any('SELECT * FROM firebase WHERE id = $1' , userId);
      return theAdmin;
    } catch (error) {
      return error;
    }
  };

module.exports = {
    getAdmin
}