//controls the routes the way it goes for
const express = require('express');

//access to being able to things like get or set, update or delete
const logs = express.Router({ mergeParams: true });

const commentController = require('./commentController');
const { getPagination, buildMeta } = require('../utils/pagination');
const { authenticate, authorize } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');
const { canViewStudent } = require('../utils/access');
const { getAStudent, getStudentByUserId } = require('../queries/students');
const { getTeacherByUserId } = require('../queries/teachers');

  
const {
  getAllLogs,
  getLogsPage,
  getALog,
  createLog,
  updateLog,
  deleteLog,
  getLogsForTeacher,
  getLogsPageForTeacher
} = require('../queries/logs');

logs.use(authenticate);
logs.use('/:logId/comments', commentController);

// Index
// Without ?page: a plain array (unchanged). With ?page: { success, payload, pagination }.
logs.get('/', async (req, res) => {
  const { studentId } = req.params;
  try {
    if (studentId) {
      // One student: the student must be visible to this user
      const student = await getAStudent(studentId);
      if (!student) return res.status(404).json({ error: 'Student with given id not found' });
      if (!(await canViewStudent(req.user, student))) {
        return res.status(403).json({ error: 'You can only view logs for students you are allowed to see' });
      }
      if (!req.query.page) {
        return res.status(200).json(await getAllLogs(studentId));
      }
      const { page, limit, offset } = getPagination(req.query, 6);
      const { logs: pageLogs, total } = await getLogsPage(studentId, limit, offset);
      return res.status(200).json({ success: true, payload: pageLogs, pagination: buildMeta(page, limit, total) });
    }

    // No student given: the all-logs list
    if (req.user.role === 'admin') {
      return res.status(200).json(await getAllLogs());
    }
    if (req.user.role === 'teacher') {
      const teacher = await getTeacherByUserId(req.user.id);
      if (!teacher) return res.status(200).json([]);
      if (!req.query.page) {
        return res.status(200).json(await getLogsForTeacher(teacher.teacher_id));
      }
      const { page, limit, offset } = getPagination(req.query, 6);
      const { logs: pageLogs, total } = await getLogsPageForTeacher(teacher.teacher_id, limit, offset);
      return res.status(200).json({ success: true, payload: pageLogs, pagination: buildMeta(page, limit, total) }); 
    }
 } catch (error) {
    sendDbError(res, error, 'Could not load logs');
  }
});

// Show (returns the log object itself, unchanged)
logs.get('/:logId', async (req, res) => {
  try {
    const log = await getALog(req.params.logId);
    if (!log) return res.status(404).json({ error: 'Log with given id not found' });
    const student = await getAStudent(log.students_id);
    if (!(await canViewStudent(req.user, student))) {
      return res.status(403).json({ error: 'You can only view logs for students you are allowed to see' });
    }
    res.json(log);
  } catch (error) {
    sendDbError(res, error, 'Could not load log');
  }
});

// Create
logs.post('/new', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const body = { reading_inference: '', books_id: null, ...req.body };
    if (req.user.role === 'student') {
      // A student can only log reading for their own record, never someone else's
      const me = await getStudentByUserId(req.user.id);
      if (!me) {
        return res.status(404).json({ success: false, message: 'No student record is linked to this login.' });
      }
      body.students_id = me.student_id;
    }
    const addLog = await createLog(body);
    res.status(200).json({ success: true, payload: addLog });
  } catch (error) {
    sendDbError(res, error, 'Log cannot be added');
  }
});

// Update
logs.put('/:logId', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const updatedLog = await updateLog(req.body, req.params.logId);
    if (!updatedLog) return res.status(404).json({ success: false, message: 'Log not found' });
    res.status(200).json({ success: true, payload: updatedLog });
  } catch (error) {
    sendDbError(res, error, 'Log cannot be updated');
  }
});

// Delete
logs.delete('/:logId', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const deletedLog = await deleteLog(req.params.logId);
    if (!deletedLog) return res.status(404).json({ success: false, payload: 'not found' });
    res.status(200).json({ success: true, payload: deletedLog });
  } catch (error) {
    sendDbError(res, error, 'Log cannot be deleted');
  }
});

module.exports = logs;
