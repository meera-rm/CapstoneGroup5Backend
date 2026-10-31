
// routes/auth.js
//   POST /api/auth/register  → email + password sign-up
//   POST /api/auth/login     → email + password login
//   POST /api/auth/google    → Google sign-in (frontend sends Google's ID token)
//   GET  /api/auth/me        → who am I? (used on page refresh)
//
// No SQL in this file — it all lives in queries/users.js.
// Every login path ends the same way: sendAuth(res, user)
const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
 
const {
  oneUser,
  createUser,
  emailExists,
  getUserByEmailForLogin,
  getUserByGoogleId,
  linkGoogleId,
  createGoogleUser,
} = require('../queries/users');

const {jwtTokens} = require('../utils/jwt-helpers');
const { authenticate } = require('../middleware/auth');
 
const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 10;

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 10,                  // 10 attempts per IP per window
  message: { error: 'Too many attempts, please try again in 15 minutes' },
  // Jest sets NODE_ENV=test; the auth tests send many requests from one "visitor"
  skip: () => process.env.NODE_ENV === 'test',
});
 
// Same response for every login method → same JWT → RBAC works the same way
function sendAuth(res, user, status = 200) {
  const { user_password, ...safeUser } = user; // make sure the hash never leaves the server
  return res.status(status).json({ ...jwtTokens(safeUser), user: safeUser });
}
 
// ---------- 1. Email + password: REGISTER ----------
router.post('/register',  authLimiter, async (req, res) => {
  try {
    const { user_name, user_email, user_password } = req.body;
 
    if (!user_name || !user_email || !user_password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (user_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
 
    const email = user_email.trim();
    if (await emailExists(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
 
    const hash = await bcrypt.hash(user_password, SALT_ROUNDS);
 
    // Role is NOT taken from req.body — otherwise anyone could sign up as admin.
    const user = await createUser({
      user_name: user_name.trim(),
      user_email: email,
      user_password: hash,
      user_role: 'student',
      user_avatar: req.body.user_avatar || '',
    });
 
    return sendAuth(res, user, 201);
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Could not create account' });
  }
});
 
// ---------- 2. Email + password: LOGIN ----------
router.post('/login',  authLimiter, async (req, res) => {
  try {
    const { user_email, user_password } = req.body;
    if (!user_email || !user_password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
 
    const user = await getUserByEmailForLogin(user_email.trim());
 
    // Same message whether the email or the password is wrong
    const INVALID = 'Invalid email or password';
    if (!user) return res.status(401).json({ error: INVALID });
 
    if (!user.user_password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Click "Sign in with Google".' });
    }
 
    const ok = await bcrypt.compare(user_password, user.user_password);
    if (!ok) return res.status(401).json({ error: INVALID });
 
    return sendAuth(res, user);
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Could not log in' });
  }
});
 
// ---------- 3. Google sign-in ----------
router.post('/google',  authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }
 
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: google_id, email, name, picture, email_verified } = ticket.getPayload();
 
    if (!email_verified) {
      return res.status(401).json({ error: 'Google email is not verified' });
    }
 
    // a) returning Google user → b) link existing email account → c) brand-new user
    const user =
      (await getUserByGoogleId(google_id)) ||
      (await linkGoogleId(email, google_id)) ||
      (await createGoogleUser({
        user_name: name || email.split('@')[0],
        user_email: email,
        user_avatar: picture || '',
        google_id,
      }));
 
    return sendAuth(res, user);
  } catch (err) {
    console.error('google auth error:', err);
    return res.status(401).json({ error: 'Google sign-in failed' });
  }
});
 
// ---------- 4. Who am I? ----------
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await oneUser(req.user.id); // `id` comes from the JWT payload
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ error: 'Could not load user' });
  }
});
 
module.exports = router;
 