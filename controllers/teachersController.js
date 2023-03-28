const express = require('express');

const teachers = express.Router();

const db = require('../db/dbConfig');

const studentController = require('./studentController');
teachers.use('/:teacherId/students', studentController);

const {
  allTeachers,
  oneTeacher,
  deleteTeacher,
  createTeacher,
  upDateTeacher,
} = require('../queries/teachers.js');

// get all teachers
teachers.get('/', async (req, res) => {
  const getAllTeachers = await allTeachers();
  if (getAllTeachers) {
    res.status(200).json({
      success: true,
      payload: getAllTeachers,
    });
  } else {
    res.status(404).send('There are no teachers.');
  }
});

// get single teacher
teachers.get('/:id', async (req, res) => {
  const { id } = req.params;
  const singleTeacher = await oneTeacher(id);
  if (singleTeacher) {
    res.status(200).json({
      success: true,
      payload: singleTeacher,
    });
  } else {
    res.status(404).send('This particular teacher cannot be found.');
  }
});

// creating a teacher (new)
teachers.post('/new', async (req, res) => {
  const newTeacher = req.body;

  try {
    const addTeacher = await createTeacher(newTeacher);
    console.log(addTeacher);
    res.status(200).json({
      success: true,
      payload: addTeacher[0],
    });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: 'Teacher cannot be added' });
  }
});

teachers.put('/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const updatedTeacher = await updateTeacher(req.body, teacherId);
    console.log('inupdate query', updatedTeacher);
    res.status(200).json({ success: true, payload: updatedTeacher });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ success: false, message: 'Teacher cannot be updated' });
  }
});

// deleting a teacher
teachers.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleting = await deleteTeacher(id);
  if (deleting.id) {
    res.status(200).json({ success: true, payload: deleting });
  } else {
    res.status(404).json({ success: false, payload: { id: undefined } });
  }
});

module.exports = teachers;
