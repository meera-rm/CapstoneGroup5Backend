// tests/middleware.test.js — unit tests: call the middleware directly, no server, no database.
const { users, authHeader } = require('./helpers');
const { authenticate, authorize } = require('../middleware/auth');

// A tiny fake `res` that records what the middleware sent
function fakeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('authenticate', () => {
  test('401 when there is no Authorization header', () => {
    const req = { headers: {} };
    const res = fakeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 when the header is not "Bearer <token>"', () => {
    const req = { headers: { authorization: 'Token abc' } };
    const res = fakeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('valid token → sets req.user and calls next()', () => {
    const req = { headers: { authorization: authHeader(users.teacher).Authorization } };
    const res = fakeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 2, role: 'teacher', email: 'tia@test.com' });
  });
});

describe('authorize', () => {
  test('lets an allowed role through', () => {
    const req = { user: { role: 'admin' } };
    const res = fakeRes();
    const next = jest.fn();

    authorize('teacher', 'admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('403 for a role that is not allowed', () => {
    const req = { user: { role: 'student' } };
    const res = fakeRes();
    const next = jest.fn();

    authorize('teacher', 'admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 if authenticate did not run first', () => {
    const req = {};
    const res = fakeRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
