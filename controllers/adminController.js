const express = require('express');
const admin = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const { oneUser } = require('../queries/users');
const { getLinkData, linkTeacher, linkStudent } = require('../queries/admin');

admin.use(authenticate, authorize('admin'));

// Everything the link page needs
admin.get('/links', async (req, res) => {
  try {
    res.json(await getLinkData());
  } catch (err) {
    console.error('getLinkData failed:', err);
    res.status(500).json({ error: 'Could not load link data' });
  }
});

// Shared checks: user_id must be a number (or null to unlink) and the login must have the right role
async function checkLogin(userId, expectedRole) {
  if (userId === null) return { ok: true };
  if (!Number.isInteger(userId)) return { status: 400, error: 'user_id must be a number or null' };
  const user = await oneUser(userId);
  if (!user) return { status: 404, error: 'User not found' };
  if (user.user_role !== expectedRole) {
    return { status: 400, error: `That account is a ${user.user_role}, not a ${expectedRole}` };
  }
  return { ok: true };
}

admin.put('/links/teacher/:teacherId', async (req, res) => {
  try {
    const userId = req.body.user_id ?? null;
    const check = await checkLogin(userId, 'teacher');
    if (!check.ok) return res.status(check.status).json({ error: check.error });

    const row = await linkTeacher(Number(req.params.teacherId), userId);
    if (!row) return res.status(404).json({ error: 'Teacher not found' });
    res.json(row);
  } catch (err) {
    console.error('linkTeacher failed:', err);
    res.status(500).json({ error: 'Could not update link' });
  }
});

admin.put('/links/student/:studentId', async (req, res) => {
  try {
    const userId = req.body.user_id ?? null;
    const check = await checkLogin(userId, 'student');
    if (!check.ok) return res.status(check.status).json({ error: check.error });

    const row = await linkStudent(Number(req.params.studentId), userId);
    if (!row) return res.status(404).json({ error: 'Student not found' });
    res.json(row);
  } catch (err) {
    console.error('linkStudent failed:', err);
    res.status(500).json({ error: 'Could not update link' });
  }
});

module.exports = admin;
