// tests/users.test.js — API tests for /api/users, focused on who is allowed to do what.
const { users, authHeader } = require('./helpers');

jest.mock('../db/dbConfig', () => ({}));  // never open a real database connection
jest.mock('../queries/users');      // every query function becomes a jest.fn()

const request = require('supertest');
const queries = require('../queries/users');
const app = require('../app');

const asStudent = authHeader(users.student); // user_id 1
const asTeacher = authHeader(users.teacher); // user_id 2
const asAdmin = authHeader(users.admin);     // user_id 3

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------- GET /
describe('GET /api/users', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('403 for a student', async () => {
    const res = await request(app).get('/api/users').set(asStudent);
    expect(res.status).toBe(403);
    expect(queries.allUsers).not.toHaveBeenCalled();
  });

  test('200 for a teacher', async () => {
    queries.allUsers.mockResolvedValue(Object.values(users));

    const res = await request(app).get('/api/users').set(asTeacher);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(3);
  });

  test('pagination: ?page=2&limit=1 → offset 1 and correct metadata', async () => {
    queries.getUsersPage.mockResolvedValue({ users: [users.teacher], total: 3 });

    const res = await request(app).get('/api/users?page=2&limit=1').set(asAdmin);

    expect(res.status).toBe(200);
    expect(queries.getUsersPage).toHaveBeenCalledWith(1, 1); // (limit, offset)
    expect(res.body.pagination).toEqual({
      page: 2, limit: 1, total: 3, totalPages: 3, hasNext: true, hasPrev: true,
    });
  });
});

// ---------------------------------------------------------------- GET /:id
describe('GET /api/users/:id', () => {
  test('400 for an id that is not a number', async () => {
    const res = await request(app).get('/api/users/abc').set(asAdmin);
    expect(res.status).toBe(400);
  });

  test('a student can see themselves', async () => {
    queries.oneUser.mockResolvedValue(users.student);
    const res = await request(app).get('/api/users/1').set(asStudent);
    expect(res.status).toBe(200);
  });

  test("a student can't see someone else", async () => {
    const res = await request(app).get('/api/users/2').set(asStudent);
    expect(res.status).toBe(403);
    expect(queries.oneUser).not.toHaveBeenCalled();
  });

  test('a teacher can see anyone', async () => {
    queries.oneUser.mockResolvedValue(users.student);
    const res = await request(app).get('/api/users/1').set(asTeacher);
    expect(res.status).toBe(200);
  });

  test('404 when the user does not exist', async () => {
    queries.oneUser.mockResolvedValue(null);
    const res = await request(app).get('/api/users/999').set(asAdmin);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------- PUT /:id
describe('PUT /api/users/:id', () => {
  test('a student can edit their own name', async () => {
    queries.upDateUser.mockResolvedValue({ ...users.student, user_name: 'New Name' });

    const res = await request(app).put('/api/users/1').set(asStudent).send({ user_name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.user.user_name).toBe('New Name');
  });

  test("a student can't edit someone else", async () => {
    const res = await request(app).put('/api/users/2').set(asStudent).send({ user_name: 'Hacked' });
    expect(res.status).toBe(403);
    expect(queries.upDateUser).not.toHaveBeenCalled();
  });

  test("a student can't make themselves admin", async () => {
    const res = await request(app).put('/api/users/1').set(asStudent).send({ user_role: 'admin' });
    expect(res.status).toBe(403);
    expect(queries.upDateUser).not.toHaveBeenCalled();
  });

  test('extra fields like user_password are ignored', async () => {
    queries.upDateUser.mockResolvedValue(users.student);

    await request(app).put('/api/users/1').set(asStudent)
      .send({ user_name: 'Sam', user_password: 'sneaky' });

    const fieldsSent = queries.upDateUser.mock.calls[0][0];
    expect(fieldsSent).not.toHaveProperty('user_password');
  });

  test('an admin can change a role', async () => {
    queries.upDateUser.mockResolvedValue({ ...users.student, user_role: 'teacher' });

    const res = await request(app).put('/api/users/1').set(asAdmin).send({ user_role: 'teacher' });

    expect(res.status).toBe(200);
    expect(queries.upDateUser).toHaveBeenCalledWith(expect.objectContaining({ user_role: 'teacher' }), 1);
  });

  test('400 for a role that does not exist', async () => {
    const res = await request(app).put('/api/users/1').set(asAdmin).send({ user_role: 'superuser' });
    expect(res.status).toBe(400);
  });

  test("an admin can't remove their own admin role", async () => {
    const res = await request(app).put('/api/users/3').set(asAdmin).send({ user_role: 'student' });
    expect(res.status).toBe(400);
  });

  test('409 when the email is taken (Postgres unique error 23505)', async () => {
    const duplicate = Object.assign(new Error('duplicate key'), { code: '23505' });
    queries.upDateUser.mockRejectedValue(duplicate);

    const res = await request(app).put('/api/users/1').set(asStudent).send({ user_email: 'tia@test.com' });

    expect(res.status).toBe(409);
  });
});

// ---------------------------------------------------------------- DELETE /:id
describe('DELETE /api/users/:id', () => {
  test('403 for a teacher', async () => {
    const res = await request(app).delete('/api/users/1').set(asTeacher);
    expect(res.status).toBe(403);
    expect(queries.deleteUser).not.toHaveBeenCalled();
  });

  test("an admin can't delete their own account", async () => {
    const res = await request(app).delete('/api/users/3').set(asAdmin);
    expect(res.status).toBe(400);
  });

  test('404 when the user does not exist', async () => {
    queries.deleteUser.mockResolvedValue(null);
    const res = await request(app).delete('/api/users/999').set(asAdmin);
    expect(res.status).toBe(404);
  });

  test('200 when an admin deletes another user', async () => {
    queries.deleteUser.mockResolvedValue(users.student);
    const res = await request(app).delete('/api/users/1').set(asAdmin);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(users.student);
  });
});
