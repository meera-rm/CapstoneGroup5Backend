// tests/helpers.js — shared setup for API tests.
// Set fake secrets BEFORE the app loads, so tests never use your real .env values.
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';

const jwt = require('jsonwebtoken');

// Fake users shaped like rows from queries/users.js (safe columns only)
const users = {
  student: { user_id: 1, user_name: 'Sam Student', user_role: 'student', user_avatar: '', user_email: 'sam@test.com' },
  teacher: { user_id: 2, user_name: 'Tia Teacher', user_role: 'teacher', user_avatar: '', user_email: 'tia@test.com' },
  admin:   { user_id: 3, user_name: 'Ada Admin',   user_role: 'admin',   user_avatar: '', user_email: 'ada@test.com' },
};

// Build an "Authorization: Bearer ..." header for one of the fake users
function authHeader(user) {
  const { jwtTokens } = require('../utils/jwt-helpers');
  return { Authorization: `Bearer ${jwtTokens(user).accessToken}` };
}

// A token that expired an hour ago
function expiredAuthHeader(user) {
  const token = jwt.sign(
    { id: user.user_id, role: user.user_role, exp: Math.floor(Date.now() / 1000) - 3600 },
    process.env.ACCESS_TOKEN_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

module.exports = { users, authHeader, expiredAuthHeader };
