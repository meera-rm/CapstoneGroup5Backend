const { users } = require('./helpers');
const { jwtTokens } = require('../utils/jwt-helpers');

jest.mock('../db/dbConfig', () => ({}));
jest.mock('../queries/users');

const request = require('supertest');
const queries = require('../queries/users');
const app = require('../app');

beforeEach(() => jest.clearAllMocks());

describe('POST /api/auth/refresh', () => {
  test('400 without a refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  test('401 for a garbage token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'nope' });
    expect(res.status).toBe(401);
  });

  test('401 when given an access token instead of a refresh token', async () => {
    const { accessToken } = jwtTokens(users.student);
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: accessToken });
    expect(res.status).toBe(401);
  });

  test('401 when the account no longer exists', async () => {
    const { refreshToken } = jwtTokens(users.student);
    queries.oneUser.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
  });

  test('200 with new tokens, using the current role from the database', async () => {
    const { refreshToken } = jwtTokens(users.student);
    queries.oneUser.mockResolvedValue({ ...users.student, user_role: 'teacher' });
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.user_role).toBe('teacher');
  });
});