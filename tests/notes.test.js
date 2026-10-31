// tests/notes.test.js — notes are private: each user sees only their own, admin sees all.
const { users, authHeader } = require('./helpers');

jest.mock('../db/dbConfig', () => ({}));  // never open a real database connection
jest.mock('../queries/notes');            // every query function becomes a jest.fn()

const request = require('supertest');
const queries = require('../queries/notes');
const app = require('../app');

const asStudent = authHeader(users.student); // user_id 1
const asTeacher = authHeader(users.teacher); // user_id 2
const asAdmin = authHeader(users.admin);     // user_id 3

const samsNote = { note_id: 10, note_title: 'Sam', textnotes: 'mine', users_id: 1 };

beforeEach(() => jest.clearAllMocks());

describe('GET /api/notes', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });

  test('a student gets only their own notes', async () => {
    queries.getNotesByUser.mockResolvedValue([samsNote]);
    const res = await request(app).get('/api/notes').set(asStudent);
    expect(res.status).toBe(200);
    expect(queries.getNotesByUser).toHaveBeenCalledWith(1);
    expect(queries.getAllNotes).not.toHaveBeenCalled();
    expect(res.body.payload).toEqual([samsNote]);
  });

  test('a teacher also gets only their own notes', async () => {
    queries.getNotesByUser.mockResolvedValue([]);
    const res = await request(app).get('/api/notes').set(asTeacher);
    expect(res.status).toBe(200);
    expect(queries.getNotesByUser).toHaveBeenCalledWith(2);
    expect(queries.getAllNotes).not.toHaveBeenCalled();
  });

  test('an admin gets every note', async () => {
    queries.getAllNotes.mockResolvedValue([samsNote]);
    const res = await request(app).get('/api/notes').set(asAdmin);
    expect(res.status).toBe(200);
    expect(queries.getAllNotes).toHaveBeenCalled();
    expect(queries.getNotesByUser).not.toHaveBeenCalled();
  });
});

describe('GET /api/notes/:noteId', () => {
  test('the owner can read their note', async () => {
    queries.getANote.mockResolvedValue(samsNote);
    const res = await request(app).get('/api/notes/10').set(asStudent);
    expect(res.status).toBe(200);
    expect(res.body.payload).toEqual(samsNote);
  });

  test("403 when reading someone else's note", async () => {
    queries.getANote.mockResolvedValue(samsNote);
    const res = await request(app).get('/api/notes/10').set(asTeacher);
    expect(res.status).toBe(403);
    expect(res.body.payload).toBeUndefined(); // the note text never leaks
  });

  test("an admin can read anyone's note", async () => {
    queries.getANote.mockResolvedValue(samsNote);
    const res = await request(app).get('/api/notes/10').set(asAdmin);
    expect(res.status).toBe(200);
  });

  test('404 when the note does not exist', async () => {
    queries.getANote.mockResolvedValue(null);
    const res = await request(app).get('/api/notes/999').set(asStudent);
    expect(res.status).toBe(404);
  });
});
