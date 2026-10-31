//controls the routes the way it goes for
const express = require('express');

//access to being able to things like get or set, update or delete
const logs = express.Router({ mergeParams: true });

const commentController = require('./commentController');
const { getPagination, buildMeta } = require('../utils/pagination');
const { authenticate, authorize } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');

const {
  getAllLogs,
  getLogsPage,
  getALog,
  createLog,
  updateLog,
  deleteLog,
} = require('../queries/logs');

logs.use(authenticate);
logs.use('/:logId/comments', commentController);

// Index
// Without ?page: a plain array (unchanged). With ?page: { success, payload, pagination }.
logs.get('/', async (req, res) => {
  const { studentId } = req.params;
  try {
    if (!req.query.page) {
      return res.status(200).json(await getAllLogs(studentId));
    }
    const { page, limit, offset } = getPagination(req.query, 6);
    const { logs: pageLogs, total } = await getLogsPage(studentId, limit, offset);
    res.status(200).json({ success: true, payload: pageLogs, pagination: buildMeta(page, limit, total) });
  } catch (error) {
    sendDbError(res, error, 'Could not load logs');
  }
});

// Show (returns the log object itself, unchanged)
logs.get('/:logId', async (req, res) => {
  try {
    const log = await getALog(req.params.logId);
    if (!log) return res.status(404).json({ error: 'Log with given id not found' });
    res.json(log);
  } catch (error) {
    sendDbError(res, error, 'Could not load log');
  }
});

// Create
logs.post('/new', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const addLog = await createLog(req.body);
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
