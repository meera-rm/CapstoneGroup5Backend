// tests/auth.test.js — API tests for /api/auth.
// The real Express app runs, but the database and Google are replaced with fakes (mocks).
const { users, authHeader, expiredAuthHeader } = require('./helpers');

jest.mock('../db/dbConfig', () => ({}));  // never open a real database connection
jest.mock('../queries/users');      // every query function becomes a jest.fn()
jest.mock('google-auth-library');
jest.mock('../queries/teachers');
jest.mock('../queries/students');   // no calls to Google

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const queries = require('../queries/users');
const teacherQ = require('../queries/teachers');
const studentQ = require('../queries/students');
const app = require('../app');

// Make the fake Google client return whatever payload a test sets
const verifyIdToken = jest.fn();
OAuth2Client.prototype.verifyIdToken = verifyIdToken;
function googleSays(payload) {
  verifyIdToken.mockResolvedValue({ getPayload: () => payload });
}

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------- register
describe('POST /api/auth/register', () => {
  const body = { user_name: 'Sam Student', user_email: 'sam@test.com', user_password: 'password123' };

  test('400 when a field is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ user_email: 'sam@test.com' });
    expect(res.status).toBe(400);
  });

  test('400 when the password is shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...body, user_password: 'short' });
    expect(res.status).toBe(400);
  });

  test('409 when the email is already registered', async () => {
    queries.emailExists.mockResolvedValue(true);

    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(409);
    expect(queries.createUser).not.toHaveBeenCalled();
  });

  test('201: hashes the password, forces role "student", returns tokens', async () => {
    queries.emailExists.mockResolvedValue(false);
    queries.createUser.mockResolvedValue(users.student);

    // Try to sneak in an admin role: it must be ignored
    const res = await request(app).post('/api/auth/register').send({ ...body, user_role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user).not.toHaveProperty('user_password');

    const saved = queries.createUser.mock.calls[0][0];
    expect(saved.user_role).toBe('student');
    expect(saved.user_password).not.toBe('password123');                    // not plain text
    expect(await bcrypt.compare('password123', saved.user_password)).toBe(true); // but a real hash
  });

  test.each(['teacher', 'parent'])('201: accepts an allowed self-signup role "%s"', async (role) => {
    queries.emailExists.mockResolvedValue(false);
    queries.createUser.mockResolvedValue({ ...users.student, user_role: role });

    const res = await request(app).post('/api/auth/register').send({ ...body, user_role: role });

    expect(res.status).toBe(201);
    expect(queries.createUser.mock.calls[0][0].user_role).toBe(role);
  });

  test('201: unknown or missing role falls back to "student"', async () => {
    queries.emailExists.mockResolvedValue(false);
    queries.createUser.mockResolvedValue(users.student);

    const res = await request(app).post('/api/auth/register').send({ ...body, user_role: 'superuser' });

    expect(res.status).toBe(201);
    expect(queries.createUser.mock.calls[0][0].user_role).toBe('student');
  });

  test('teacher signup with a matching teacher_email links that row instead of creating one', async () => {
    queries.emailExists.mockResolvedValue(false);
    queries.createUser.mockResolvedValue({ ...users.student, user_id: 9, user_role: 'teacher' });
    teacherQ.linkUnlinkedTeacherByEmail.mockResolvedValue({ teacher_id: 1 });

    const res = await request(app).post('/api/auth/register').send({ ...body, user_role: 'teacher' });

    expect(res.status).toBe(201);
    expect(teacherQ.linkUnlinkedTeacherByEmail).toHaveBeenCalledWith('sam@test.com', 9);
    expect(teacherQ.createTeacherForUser).not.toHaveBeenCalled();
  });

  test('teacher signup with no matching row creates a teachers row with the school', async () => {
    queries.emailExists.mockResolvedValue(false);
    queries.createUser.mockResolvedValue({ ...users.student, user_id: 9, user_role: 'teacher' });
    teacherQ.linkUnlinkedTeacherByEmail.mockResolvedValue(null);

    await request(app).post('/api/auth/register').send({ ...body, user_role: 'teacher', school_name: ' Lincoln ' });

    expect(teacherQ.createTeacherForUser).toHaveBeenCalledWith(9, 'Sam Student', 'Lincoln');
  });

  test('student signup claims a matching student_email row', async () => {
    queries.emailExists.mockResolvedValue(false);
    queries.createUser.mockResolvedValue({ ...users.student, user_id: 9 });

    await request(app).post('/api/auth/register').send(body);

    expect(studentQ.linkUnlinkedStudentByEmail).toHaveBeenCalledWith('sam@test.com', 9);
  });

  test('500 when the database fails', async () => {
    queries.emailExists.mockRejectedValue(new Error('db down'));
    jest.spyOn(console, 'error').mockImplementation(() => {}); // keep test output clean

    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------- login
describe('POST /api/auth/login', () => {
  let hash;
  beforeAll(async () => { hash = await bcrypt.hash('password123', 4); }); // 4 rounds = fast tests

  test('400 when email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ user_email: 'sam@test.com' });
    expect(res.status).toBe(400);
  });

  test('401 when the email is not registered', async () => {
    queries.getUserByEmailForLogin.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login')
      .send({ user_email: 'nobody@test.com', user_password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('401 with the SAME message when the password is wrong', async () => {
    queries.getUserByEmailForLogin.mockResolvedValue({ ...users.student, user_password: hash });

    const res = await request(app).post('/api/auth/login')
      .send({ user_email: 'sam@test.com', user_password: 'wrongpass1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('401 for a Google-only account (no password)', async () => {
    queries.getUserByEmailForLogin.mockResolvedValue({ ...users.student, user_password: null });

    const res = await request(app).post('/api/auth/login')
      .send({ user_email: 'sam@test.com', user_password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Google/);
  });

  test('200 with tokens, and never returns the password hash', async () => {
    queries.getUserByEmailForLogin.mockResolvedValue({ ...users.student, user_password: hash });

    const res = await request(app).post('/api/auth/login')
      .send({ user_email: 'SAM@test.com', user_password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toEqual(users.student);
  });
});

// ---------------------------------------------------------------- google
describe('POST /api/auth/google', () => {
  const googlePayload = { sub: 'g-123', email: 'gina@test.com', name: 'Gina', picture: 'pic.png', email_verified: true };

  test('400 when credential is missing', async () => {
    const res = await request(app).post('/api/auth/google').send({});
    expect(res.status).toBe(400);
  });

  test('401 when Google rejects the token', async () => {
    verifyIdToken.mockRejectedValue(new Error('bad token'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).post('/api/auth/google').send({ credential: 'fake' });

    expect(res.status).toBe(401);
  });

  test('401 when the Google email is not verified', async () => {
    googleSays({ ...googlePayload, email_verified: false });

    const res = await request(app).post('/api/auth/google').send({ credential: 'fake' });

    expect(res.status).toBe(401);
  });

  test('returning Google user → 200, no new account', async () => {
    googleSays(googlePayload);
    queries.getUserByGoogleId.mockResolvedValue(users.student);

    const res = await request(app).post('/api/auth/google').send({ credential: 'fake' });

    expect(res.status).toBe(200);
    expect(queries.createGoogleUser).not.toHaveBeenCalled();
  });

  test('existing email account → links Google instead of creating a duplicate', async () => {
    googleSays(googlePayload);
    queries.getUserByGoogleId.mockResolvedValue(null);
    queries.linkGoogleId.mockResolvedValue(users.student);

    const res = await request(app).post('/api/auth/google').send({ credential: 'fake' });

    expect(res.status).toBe(200);
    expect(queries.linkGoogleId).toHaveBeenCalledWith('gina@test.com', 'g-123');
    expect(queries.createGoogleUser).not.toHaveBeenCalled();
  });

  test('brand-new person → creates a student account', async () => {
    googleSays(googlePayload);
    queries.getUserByGoogleId.mockResolvedValue(null);
    queries.linkGoogleId.mockResolvedValue(null);
    queries.createGoogleUser.mockResolvedValue({ ...users.student, user_name: 'Gina' });

    const res = await request(app).post('/api/auth/google').send({ credential: 'fake' });

    expect(res.status).toBe(200);
    expect(queries.createGoogleUser).toHaveBeenCalledWith(
      expect.objectContaining({ user_email: 'gina@test.com', google_id: 'g-123' })
    );
  });
});

// ---------------------------------------------------------------- me
describe('GET /api/auth/me', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('401 with a fake token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('401 with an expired token, with a clear message', async () => {
    const res = await request(app).get('/api/auth/me').set(expiredAuthHeader(users.student));
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/expired/i);
  });

  test('200 returns the current user', async () => {
    queries.oneUser.mockResolvedValue(users.student);

    const res = await request(app).get('/api/auth/me').set(authHeader(users.student));

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(users.student);
    expect(queries.oneUser).toHaveBeenCalledWith(1); // id came from the token
  });
});
