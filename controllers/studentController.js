//controls the routes the way it goes for
const express = require('express');

//access to being able to things like get or set, update or delete
const students = express.Router({ mergeParams: true });

const { authenticate, authorize } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');
const { getPagination, buildMeta } = require('../utils/pagination');

students.use(authenticate); // every student route needs a token (before nested routes)

const logController = require('./logController.js');
students.use('/:studentId/logs', logController);

const { getAllLogs } = require('../queries/logs');

const {
  getStudentsByParentEmail,
  getAllStudents,
  getStudentsPage,
  getAStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentByUserId
} = require('../queries/students');

// Parents only ever see their own children (students.parent_email = their login email).
const isParent = (user) => user.role === 'parent';
const isParentOf = (user, student) =>
  !!student.parent_email && student.parent_email.toLowerCase() === (user.email || '').toLowerCase();

// My children: GET /api/students/mine  (parent dashboard)
// Must be above '/:studentId', or Express would treat "mine" as an id.
students.get('/mine', authorize('parent'), async (req, res) => {
  try {
    res.json(await getStudentsByParentEmail(req.user.email));
  } catch (error) {
    sendDbError(res, error, 'Could not load your children');
  }
});


students.get('/me', authorize('student'), async (req, res) => {
  ;
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'No student record is linked to this login.' });
    }
    const logs = await getAllLogs(student.student_id);
    const totals = logs.reduce(
      (sum, log) => ({
        minutes: sum.minutes + (log.reading_minutes || 0),
        pages: sum.pages + (log.pages_read || 0),
      }),
      { minutes: 0, pages: 0 }
    );

     // Distinct book titles from the student's logs
    const books = [...new Set(logs.map((log) => log.book_title).filter(Boolean))];

    res.json({
      student,
      totals: { logs: logs.length, ...totals },
      books,
      logs,
    });
  } catch (error) {
    sendDbError(res, error, 'Could not load your reading');
  }
  
});

// Index
// Without ?page: a plain array (unchanged). With ?page: { success, payload, pagination }.
students.get('/', async (req, res) => {
  const { teacherId } = req.params;
  try {
    if (isParent(req.user)) {
      return res.json(await getStudentsByParentEmail(req.user.email));
    }
    if (!req.query.page) {
      return res.json(await getAllStudents(teacherId));
    }
    const { page, limit, offset } = getPagination(req.query, 10);
    const { students: rows, total } = await getStudentsPage(teacherId, limit, offset);
    res.json({ success: true, payload: rows, pagination: buildMeta(page, limit, total) });
  } catch (error) {
    sendDbError(res, error, 'Could not load students');
  }
});


// Show (returns the student object itself, unchanged)
students.get('/:studentId', async (req, res) => {
  try {
    const student = await getAStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student with given id not found' });
    if (isParent(req.user) && !isParentOf(req.user, student)) {
      return res.status(403).json({ error: 'You can only view your own children' });
    }
    res.json(student);
  } catch (error) {
    sendDbError(res, error, 'Could not load student');
  }
});

// Create
students.post('/new', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const addStudent = await createStudent(req.body);
    res.status(200).json({ success: true, payload: addStudent });
  } catch (error) {
    sendDbError(res, error, 'Student cannot be added');
  }
});

// Update
students.put('/:studentId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const updatedStudent = await updateStudent(req.body, req.params.studentId);
    if (!updatedStudent) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, payload: updatedStudent });
  } catch (error) {
    sendDbError(res, error, 'Student info cannot be updated');
  }
});

// Delete
students.delete('/:studentId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const deletedStudent = await deleteStudent(req.params.studentId);
    if (!deletedStudent) return res.status(404).json({ success: false, payload: 'not found' });
    res.status(200).json({ success: true, payload: deletedStudent });
  } catch (error) {
    sendDbError(res, error, 'Student cannot be deleted');
  }
});

module.exports = students;
