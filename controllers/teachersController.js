const express = require('express');

const teachers = express.Router();

const studentController = require('./studentController');
teachers.use('/:teacherId/students', studentController);

const {
  allTeachers,
  oneTeacher,
  deleteTeacher,
  createTeacher,
  updateTeacher,
} = require('../queries/teachers.js');

// Sends a real 500 when the database fails, instead of a fake success
const serverError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ success: false, message });
};

// get all teachers
teachers.get('/', async (req, res) => {
  try {
    const all = await allTeachers();
    res.status(200).json({ success: true, payload: all });
  } catch (error) {
    serverError(res, error, 'Could not load teachers');
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
    serverError(res, error, 'Could not load teacher');
  }
});

// creating a teacher (new)
teachers.post('/new', async (req, res) => {
  try {
    const added = await createTeacher(req.body);
    res.status(200).json({ success: true, payload: added });
  } catch (error) {
    serverError(res, error, 'Teacher cannot be added');
  }
});

// updating a teacher
teachers.put('/:teacherId', async (req, res) => {
  try {
    const updated = await updateTeacher(req.body, req.params.teacherId);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, payload: updated });
  } catch (error) {
    serverError(res, error, 'Teacher cannot be updated');
  }
});

// deleting a teacher
teachers.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteTeacher(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, payload: { id: undefined } });
    }
    res.status(200).json({ success: true, payload: deleted });
  } catch (error) {
    serverError(res, error, 'Teacher cannot be deleted');
  }
});

module.exports = teachers;
