const express = require('express');

const teachers = express.Router();

const { sendDbError } = require('../utils/dbErrors');
const { getPagination, buildMeta } = require('../utils/pagination');
const studentController = require('./studentController');
teachers.use('/:teacherId/students', studentController);

const { authenticate, authorize } = require('../middleware/auth');
teachers.use(authenticate)



const {
  getTeachersPage,
  getAllTeachers,
  oneTeacher,
  deleteTeacher,
  createTeacher,
  updateTeacher,
  getTeacherByEmail,
  studentsForTeacherYear,
  getTeacherByUserId
} = require('../queries/teachers.js');

// Sends a real 500 when the database fails, instead of a fake success
const serverError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ success: false, message });
};

const teacherStaffOnly = (req, res, next) =>
  ['teacher', 'admin'].includes(req.user.role)
    ? next()
    : res.status(403).json({ success: false, message: 'You do not have permission to do this' });

teachers.get('/', teacherStaffOnly, async (req, res) => { /* existing body */ });
teachers.get('/:id', teacherStaffOnly, async (req, res) => { /* existing body */ });


// get all teachers
// Without ?page: every teacher. With ?page=&limit=: one page plus pagination info.
teachers.get('/', async (req, res) => {
  try {
    if (!req.query.page) {
      const all = await getAllTeachers();
      return res.status(200).json({ success: true, payload: all });
    }
    const { page, limit, offset } = getPagination(req.query, 10);
    const { teachers: rows, total } = await getTeachersPage(limit, offset);
    res.status(200).json({
      success: true,
      payload: rows,
      pagination: buildMeta(page, limit, total),
    });
  } catch (error) {
    sendDbError(res, error, 'Could not load teachers');
  }
});

teachers.get('/me', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const teacher = await getTeacherByUserId(req.user.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'No teacher record is linked to this login.',
      });
    }
    const academicYear = req.query.academicYear || '2025-2026';
    const students = await studentsForTeacherYear(teacher.teacher_id, academicYear);
    res.status(200).json({ success: true, payload: { teacher, academicYear, students } });
  } catch (error) {
    sendDbError(res, error, 'Could not load your class');
  }
});


// get single teacher
teachers.get('/:id', async (req, res) => {
  try {
    const teacher = await oneTeacher(req.params.id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: 'This particular teacher cannot be found.' });
    }
    res.status(200).json({ success: true, payload: teacher });
  } catch (error) {
    sendDbError(res, error, 'Could not load teacher');
  }
});

// creating a teacher (new)
teachers.post('/new', authorize('admin'), async (req, res) => {
  try {
    const added = await createTeacher(req.body);
    res.status(200).json({ success: true, payload: added });
  } catch (error) {
    sendDbError(res, error, 'Teacher cannot be added');
  }
});

// updating a teacher
teachers.put('/:teacherId', authorize('admin'), async (req, res) => {
  try {
    const updated = await updateTeacher(req.body, req.params.teacherId);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, payload: updated });
  } catch (error) {
    sendDbError(res, error, 'Teacher cannot be updated');
  }
});

// deleting a teacher
teachers.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const deleted = await deleteTeacher(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, payload: { id: undefined } });
    }
    res.status(200).json({ success: true, payload: deleted });
  } catch (error) {
    sendDbError(res, error, 'Teacher cannot be deleted');
  }
});

module.exports = teachers;
