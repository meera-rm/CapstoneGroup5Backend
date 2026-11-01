const { getTeacherByUserId } = require('../queries/teachers');
const { isStudentInTeacherClass, getAStudent } = require('../queries/students');
const { getALog } = require('../queries/logs');

// Can this logged-in user see this student's data (record and logs)?
async function canViewStudent(user, student) {
  if (!user || !student) return false;
  if (user.role === 'admin') return true;

  if (user.role === 'parent') {
    return !!student.parent_email &&
      student.parent_email.toLowerCase() === (user.email || '').toLowerCase();
  }

  if (user.role === 'student') {
    return student.user_id != null && Number(student.user_id) === Number(user.id);
  }

  if (user.role === 'teacher') {
    const teacher = await getTeacherByUserId(user.id);
    if (!teacher) return false;
    return !!(await isStudentInTeacherClass(student.student_id, teacher.teacher_id));
  }

  return false;
}

// Can this user see a log? Same rule as the student the log belongs to.
async function canViewLog(user, logId) {
  const log = await getALog(logId);
  if (!log) return false;
  const student = await getAStudent(log.students_id);
  return canViewStudent(user, student);
}

module.exports = { canViewStudent, canViewLog };