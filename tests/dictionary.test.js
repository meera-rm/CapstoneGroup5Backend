// tests/dictionary.test.js — words are shared: anyone can read, logged-in users can add,
// only the owner or an admin can edit/delete.
const { users, authHeader } = require('./helpers');

jest.mock('../db/dbConfig', () => ({}));
jest.mock('../queries/dictionary.js');

const request = require('supertest');
const queries = require('../queries/dictionary.js');
const app = require('../app');

const asStudent = authHeader(users.student); // user_id 1 (owner below)
const asTeacher = authHeader(users.teacher); // user_id 2
const asAdmin = authHeader(users.admin);     // user_id 3

const samsWord = { dictionary_id: 7, word: 'brave', users_id: 1 };

beforeEach(() => jest.clearAllMocks());

describe('reading is public', () => {
  test('GET /api/dictionary works with no token', async () => {
    queries.allWords.mockResolvedValue([samsWord]);
    const res = await request(app).get('/api/dictionary');
    expect(res.status).toBe(200);
    expect(res.body.payload).toEqual([samsWord]);
  });

  test('GET /api/dictionary/:word works with no token', async () => {
    queries.getAWord.mockResolvedValue(samsWord);
    const res = await request(app).get('/api/dictionary/brave');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/dictionary', () => {
  test('401 with no token', async () => {
    const res = await request(app).post('/api/dictionary').send({ word: 'kind' });
    expect(res.status).toBe(401);
    expect(queries.createWord).not.toHaveBeenCalled();
  });

  test('any logged-in user can add; owner comes from the token, not the body', async () => {
    queries.createWord.mockResolvedValue({ dictionary_id: 8, word: 'kind', users_id: 2 });
    const res = await request(app)
      .post('/api/dictionary')
      .set(asTeacher)
      .send({ word: 'kind', users_id: 999 });
    expect(res.status).toBe(200);
    expect(queries.createWord).toHaveBeenCalledWith(expect.objectContaining({ users_id: 2 }));
  });
});

describe('edit and delete: owner or admin only', () => {
  test('401 with no token', async () => {
    expect((await request(app).put('/api/dictionary/7').send({})).status).toBe(401);
    expect((await request(app).delete('/api/dictionary/7')).status).toBe(401);
  });

  test("403 editing someone else's word", async () => {
    queries.getWordById.mockResolvedValue(samsWord);
    const res = await request(app).put('/api/dictionary/7').set(asTeacher).send({ word: 'x' });
    expect(res.status).toBe(403);
    expect(queries.updateWord).not.toHaveBeenCalled();
  });

  test("403 deleting someone else's word", async () => {
    queries.getWordById.mockResolvedValue(samsWord);
    const res = await request(app).delete('/api/dictionary/7').set(asTeacher);
    expect(res.status).toBe(403);
    expect(queries.deleteWord).not.toHaveBeenCalled();
  });

  test('the owner can edit and delete their own word', async () => {
    queries.getWordById.mockResolvedValue(samsWord);
    queries.updateWord.mockResolvedValue(samsWord);
    queries.deleteWord.mockResolvedValue(samsWord);
    expect((await request(app).put('/api/dictionary/7').set(asStudent).send({ word: 'bold' })).status).toBe(200);
    expect((await request(app).delete('/api/dictionary/7').set(asStudent)).status).toBe(200);
  });

  test("an admin can delete anyone's word", async () => {
    queries.getWordById.mockResolvedValue(samsWord);
    queries.deleteWord.mockResolvedValue(samsWord);
    expect((await request(app).delete('/api/dictionary/7').set(asAdmin)).status).toBe(200);
  });
});
