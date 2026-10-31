
const db = require('../db/dbConfig');



// Never SELECT *: that would include password hashes
const USER_COLUMNS = 'user_id, user_name, user_role, user_avatar, user_email';

// One page of users + total count
const getUsersPage = async (limit, offset) => {
  try {
    const users = await db.any(
      `SELECT ${USER_COLUMNS} FROM users ORDER BY user_id LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { total } = await db.one('SELECT COUNT(*)::int AS total FROM users');
    return { users, total };
  } catch (error) {
    console.error('getUsersPage failed:', error.message);
    throw error;
  }
};



// display all teachers not sure if we need this route but here it is anyway

const allUsers = async () => {
  try {
    return await db.any(`SELECT ${USER_COLUMNS} FROM users ORDER BY user_id`);
  } catch (error) {
    throw error;
  }
};

// get one teacher
const oneUser = async (id) => {
  try {
    return await db.oneOrNone(`SELECT ${USER_COLUMNS} FROM users WHERE user_id=$1`, id);
  } catch (error) {
    console.error('oneUser failed:', error.message);
    throw error;
  }
};

// delete a teacher
const deleteUser = async (id) => {
  try {
    return await db.oneOrNone(
      `DELETE FROM users WHERE user_id=$1 RETURNING ${USER_COLUMNS}`,
      [id]
    );
  } catch (error) {
    console.error('deleteUser failed:', error.message);
    throw error;
  }
};


// user_password must ALREADY be a bcrypt hash — hash it in the route, never store plain text

const createUser = async (user) => {
  let {
    user_name,
    user_role='student',
    user_avatar='',
    user_email,
    user_password,
   
  } = user;
  
  try {
    return await db.one(
      `INSERT INTO users(user_name, user_role, user_avatar, user_email, user_password) VALUES ($1, $2, $3, LOWER($4), $5 ) RETURNING  ${USER_COLUMNS}`,
      [
        user_name,
        user_role,
        user_avatar,
        user_email,
        user_password
      ]
    );
  } catch (error) {
    console.error('createUser failed:', error.message);
    throw error;
  }
};

// update/edit teacher acct

const upDateUser = async (user, userId) => {
  
  const { user_name, user_role, user_avatar, user_email } = user;
  try {
    return await db.oneOrNone(
      `UPDATE users SET
         user_name   = COALESCE($1, user_name),
         user_role   = COALESCE($2, user_role),
         user_avatar = COALESCE($3, user_avatar),
         user_email  = COALESCE(LOWER($4), user_email)
       WHERE user_id = $5
       RETURNING ${USER_COLUMNS}`,
      [user_name, user_role, user_avatar, user_email, userId]
    );
  } catch (error) {
    console.error('upDateUser failed:', error.message);
    throw error;
  }
};



// ---------- Used ONLY by auth routes ----------

 
// The one place we read the password hash — only for checking a login.
const getUserByEmailForLogin = async (email) => {
  try {
    return await db.oneOrNone(
      `SELECT ${USER_COLUMNS}, user_password FROM users WHERE LOWER(user_email) = LOWER($1)`,
      [email]
    );
  } catch (error) {
    console.error('getUserByEmailForLogin failed:', error.message);
    throw error;
  }
};
 
const emailExists = async (email) => {
  try {
    const row = await db.oneOrNone('SELECT 1 FROM users WHERE LOWER(user_email) = LOWER($1)', [email]);
    return !!row;
  } catch (error) {
    console.error('emailExists failed:', error.message);
    throw error;
  }
};
 
const getUserByGoogleId = async (googleId) => {
  try {
    return await db.oneOrNone(`SELECT ${USER_COLUMNS} FROM users WHERE google_id = $1`, [googleId]);
  } catch (error) {
    console.error('getUserByGoogleId failed:', error.message);
    throw error;
  }
};
 
// Existing email/password user signs in with Google for the first time → link the accounts
const linkGoogleId = async (email, googleId) => {
  try {
    return await db.oneOrNone(
      `UPDATE users SET google_id = $2
       WHERE LOWER(user_email) = LOWER($1) AND google_id IS NULL
       RETURNING ${USER_COLUMNS}`,
      [email, googleId]
    );
  } catch (error) {
    console.error('linkGoogleId failed:', error.message);
    throw error;
  }
};
 
// Brand-new Google user: no password, always starts as a student
const createGoogleUser = async ({ user_name, user_email, user_avatar = '', google_id }) => {
  try {
    return await db.one(
      `INSERT INTO users (user_name, user_role, user_avatar, user_email, google_id)
       VALUES ($1, 'student', $2, LOWER($3), $4)
       RETURNING ${USER_COLUMNS}`,
      [user_name, user_avatar, user_email, google_id]
    );
  } catch (error) {
    console.error('createGoogleUser failed:', error.message);
    throw error;
  }
};
 
module.exports = {
  getUsersPage,
  allUsers,
  oneUser,
  deleteUser,
  createUser,
  upDateUser,
  getUserByEmailForLogin,
  emailExists,
  getUserByGoogleId,
  linkGoogleId,
  createGoogleUser,
};
 