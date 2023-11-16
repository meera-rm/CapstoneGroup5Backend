
const db = require('../db/dbConfig');

// display all teachers not sure if we need this route but here it is anyway

const allUsers = async () => {
  try {
    return await db.any('SELECT * FROM users');
  } catch (error) {
    return error;
  }
};

// get one teacher
const oneUser = async (id) => {
  try {
    return await db.one('SELECT * FROM users WHERE user_id=$1', id);
  } catch (error) {
    return error;
  }
};

// delete a teacher
const deleteUser = async (id) => {
  try {
    return await db.one(
      'DELETE FROM users WHERE id=$1 RETURNING *',
      user_id
    );
  } catch (error) {
    return error;
  }
};


// creating new teacher acct

const createUser = async (user) => {
  let {
    user_name,
    user_role,
    user_avatar,
    user_email,
    user_password,
   
  } = user;
  
  try {
    const newUser = await db.one(
      'INSERT INTO teachers(user_name, user_role, user_avatar, user_email, user_password) VALUES ($1, $2, $3, $4, $5 ) RETURNING *',
      [
        user_name,
        user_role,
        user_avatar,
        user_email,
        user_password
      ]
    );

    return newUser;
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

// update/edit teacher acct

const upDateUser = async (user, userId) => {
  let [
    user_name,
    user_role,
    user_avatar,
    user_email,
    user_password
    
  ] = user;
  try {
    return await db.one(
      'UPDATE users SET user_name = $1,  user_role= $2, user_avatar = $3, user_email = $4, user_password = $5 RETURNING *',
      [
        user_name,
        user_role,
        user_avatar,
        user_email,
        user_password
      ]
    );
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

module.exports = {
  allUsers,
  oneUser,
  deleteUser,
  createUser,
  upDateUser,
};
