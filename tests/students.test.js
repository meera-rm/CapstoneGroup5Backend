// tests/students.test.js — parents see only their own children.
const { users, authHeader } = require('./helpers');

jest.mock('../db/dbConfig', () => ({}));
jest.mock('../queries/students');
jest.mock('../queries/teachers');
const teachersQ = require('../queries/teachers');

const request = require('supertest');
const queries = require('../queries/students');
const app = require('../app');

const parent = { user_id: 4, user_name: 'Pat Parent', user_role: 'parent', user_avatar: '', user_email: 'Pat@Test.com' };
const asParent = authHeader(parent);
const asTeacher = authHeader(users.teacher);
const asStudent = authHeader(users.student);

const myKid = { student_id: 1, student_name: 'Kim', parent_email: 'pat@test.com' };
const otherKid = { student_id: 2, student_name: 'Lee', parent_email: 'someone@else.com' };

beforeEach(() => jest.clearAllMocks());

describe('GET /api/students/mine', () => {
  test("returns the parent's children, matched by login email", async () => {
    queries.getStudentsByParentEmail.mockResolvedValue([myKid]);
    const res = await request(app).get('/api/students/mine').set(asParent);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([myKid]);
    expect(queries.getStudentsByParentEmail).toHaveBeenCalledWith('Pat@Test.com');
  });

  test('403 for a teacher or student', async () => {
    expect((await request(app).get('/api/students/mine').set(asTeacher)).status).toBe(403);
    expect((await request(app).get('/api/students/mine').set(asStudent)).status).toBe(403);
  });

  test('401 with no token', async () => {
    expect((await request(app).get('/api/students/mine')).status).toBe(401);
  });
});

describe('GET /api/students as a parent', () => {
  test('the list only contains their own children', async () => {
    queries.getStudentsByParentEmail.mockResolvedValue([myKid]);
    const res = await request(app).get('/api/students').set(asParent);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([myKid]);
    expect(queries.getAllStudents).not.toHaveBeenCalled();
  });

  test('can open their own child (email match ignores case)', async () => {
    queries.getAStudent.mockResolvedValue(myKid);
    expect((await request(app).get('/api/students/1').set(asParent)).status).toBe(200);
  });

  test("403 opening someone else's child", async () => {
    queries.getAStudent.mockResolvedValue(otherKid);
    const res = await request(app).get('/api/students/2').set(asParent);
    expect(res.status).toBe(403);
    expect(res.body.student_name).toBeUndefined();
  });
});

describe('teachers see only their own class students', () => {
  test('a teacher gets the students in their classes, not all students', async () => {
    teachersQ.getTeacherByUserId.mockResolvedValue({ teacher_id: 1, user_id: 4 });
    queries.getStudentsInTeacherClasses.mockResolvedValue([myKid]);
    const res = await request(app).get('/api/students').set(asTeacher);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(queries.getAllStudents).not.toHaveBeenCalled();
  });
});


describe('students as a student', () => {
  test('the list contains only their own record', async () => {
    queries.getStudentByUserId.mockResolvedValue({ student_id: 1, user_id: 1, student_name: 'Kim' });
    const res = await request(app).get('/api/students').set(asStudent);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(queries.getAllStudents).not.toHaveBeenCalled();
  });

  test('can open their own record', async () => {
    queries.getAStudent.mockResolvedValue({ student_id: 1, user_id: 1, student_name: 'Kim' });
    expect((await request(app).get('/api/students/1').set(asStudent)).status).toBe(200);
  });

  test("403 opening someone else's record", async () => {
    queries.getAStudent.mockResolvedValue({ student_id: 2, user_id: 2, student_name: 'Lee' });
    const res = await request(app).get('/api/students/2').set(asStudent);
    expect(res.status).toBe(403);
    expect(res.body.student_name).toBeUndefined();
  });
});