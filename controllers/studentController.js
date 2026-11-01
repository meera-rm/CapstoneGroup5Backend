//controls the routes the way it goes for
const express = require('express');

//access to being able to things like get or set, update or delete
const students = express.Router({ mergeParams: true });

const { authenticate, authorize } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');
const { getPagination, buildMeta } = require('../utils/pagination');

const { canViewStudent } = require('../utils/access');
const { getTeacherByUserId } = require('../queries/teachers');
const { findClassroom, enrollStudent } = require('../queries/classrooms');
const { CURRENT_ACADEMIC_YEAR, validAcademicYear } = require('../utils/academicYear');

const { getStudentsInTeacher }= require('../queries/students');
students.use(authenticate); // every student route needs a token (before nested routes)

const logController = require('./logController.js');
students.use('/:studentId/logs', logController);

const { getAllLogs } = require('../queries/logs');
const { getCommentsForStudent } = require('../queries/comments');

const {
  getStudentsByParentEmail,
  getAllStudents,
  getStudentsPage,
  getAStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentByUserId,
  isStudentInTeacherClass,
  getStudentsInTeacherClasses,
  getStudentClassForYear,
  getEnrolledYears,
} = require('../queries/students');

// Parents only ever see their own children (students.parent_email = their login email).
const isParent = (user) => user.role === 'parent';
const isParentOf = (user, student) =>
  !!student.parent_email && student.parent_email.toLowerCase() === (user.email || '').toLowerCase();


// Students see only their own record (students.user_id = their login id)
const isStudent = (user) => user.role === 'student';
const isOwnStudent = (user, student) =>
  student.user_id !== null &&
  student.user_id !== undefined &&
  Number(student.user_id) === Number(user.id);


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

    const enrolledYears = await getEnrolledYears(student.student_id);

    // Attach the teacher's comments to each log (one query for all of them)
    const comments = await getCommentsForStudent(student.student_id);
    const logsWithComments = logs.map((log) => ({
      ...log,
      teacher_comments: comments
        .filter((c) => c.logs_id === log.log_id)
        .map((c) => c.teacher_comments)
        .join(' '),
    }));

    res.json({
      student,
      totals: { logs: logs.length, ...totals },
      books,
      logs: logsWithComments,
      enrolledYears,
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
    if (isStudent(req.user)) {
      const me = await getStudentByUserId(req.user.id);
      return res.json(me ? [me] : []); // a student only ever gets their own record
    }

        if (req.user.role === 'teacher') {
      const teacher = await getTeacherByUserId(req.user.id);
      if (!teacher) return res.json([]);
      if (teacherId && Number(teacherId) !== Number(teacher.teacher_id)) {
        return res.status(403).json({ error: 'You can only view your own class' });
      }
      return res.json(await getStudentsInTeacherClasses(teacher.teacher_id, validAcademicYear(req.query.academicYear)));
    }

    // admin: everyone, as before

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


// The teacher a student had in one school year: GET /api/students/:studentId/class?academicYear=2025-2026
// Must be above '/:studentId'.
students.get('/:studentId/class', async (req, res) => {
  try {
    const student = await getAStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student with given id not found' });
    if (!(await canViewStudent(req.user, student))) {
      return res.status(403).json({ error: 'You can only view students you are allowed to see' });
    }
    const academicYear = validAcademicYear(req.query.academicYear);
    const teacher = await getStudentClassForYear(student.student_id, academicYear);
    res.json({ success: true, payload: { academicYear, teacher: teacher || null } });
  } catch (error) {
    sendDbError(res, error, 'Could not load the class for that year');
  }
});

// Show (returns the student object itself, unchanged)
students.get('/:studentId', async (req, res) => {
  try {
    const student = await getAStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student with given id not found' });

    if (!(await canViewStudent(req.user, student))) {
      return res.status(403).json({ error: 'You can only view students you are allowed to see' });
    }

    if (isParent(req.user) && !isParentOf(req.user, student)) {
      return res.status(403).json({ error: 'You can only view your own children' });
    }
    if (isStudent(req.user) && !isOwnStudent(req.user, student)) {
      return res.status(403).json({ error: 'You can only view your own record' });
    }
    res.json(student);
  } catch (error) {
    sendDbError(res, error, 'Could not load student');
  }
});

// Create
students.post('/new', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const body = { ...req.body, academic_year: validAcademicYear(req.body.academic_year) };
    let classroom = null;
    if (req.user.role === 'teacher') {
      // A teacher adds students to their own class only, and the class must exist first
      const me = await getTeacherByUserId(req.user.id);
      if (!me) return res.status(404).json({ success: false, message: 'No teacher record is linked to this login.' });
      body.teachers_id = me.teacher_id;
      classroom = await findClassroom(me.teacher_id, body.academic_year);
      if (!classroom) {
        return res.status(400).json({ success: false, message: 'Set your class name on your profile before adding students.' });
      }
    }
    const addStudent = await createStudent(body);
    if (classroom) await enrollStudent(addStudent.student_id, classroom.classroom_id);
    res.status(200).json({ success: true, payload: addStudent });
  } catch (error) {
    sendDbError(res, error, 'Student cannot be added');
  }
});

// Update

// Teachers can change or delete only students in their own class (admins can change any)
async function teacherOwnsStudent(req, studentId) {
  if (req.user.role !== 'teacher') return true;
  const me = await getTeacherByUserId(req.user.id);
  return !!me && !!(await isStudentInTeacherClass(studentId, me.teacher_id));
}

students.put('/:studentId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    if (!(await teacherOwnsStudent(req, req.params.studentId))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to do this' });
    }
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
    if (!(await teacherOwnsStudent(req, req.params.studentId))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to do this' });
    }
    const deletedStudent = await deleteStudent(req.params.studentId);
    if (!deletedStudent) return res.status(404).json({ success: false, payload: 'not found' });
    res.status(200).json({ success: true, payload: deletedStudent });
  } catch (error) {
    sendDbError(res, error, 'Student cannot be deleted');
  }
});

module.exports = students;
