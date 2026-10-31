const db = require('../db/dbConfig');

// Each query lets errors propagate (throw) so the controller can send a 500
// instead of returning the Error object as if it were data.


// One page of teachers plus the total count, for ?page=&limit=
const getTeachersPage = async (limit, offset) => {
  const teachers = await db.any(
    'SELECT * FROM teachers ORDER BY teacher_id LIMIT $/limit/ OFFSET $/offset/',
    { limit, offset }
  );
  const { total } = await db.one('SELECT COUNT(*)::int AS total FROM teachers');
  return { teachers, total };
};

const getAllTeachers = () => db.any('SELECT * FROM teachers ORDER BY teacher_id');

// oneOrNone: returns null (instead of throwing) when no teacher has this id
const oneTeacher = (id) =>
  db.oneOrNone('SELECT * FROM teachers WHERE teacher_id=$1', id);

const getTeacherByUserId = (userId) =>
  db.oneOrNone('SELECT * FROM teachers WHERE user_id = $1', userId);

const getTeacherByEmail = (userId) =>
  db.oneOrNone('SELECT * FROM teachers WHERE teacher_email=$1', userId);         

// Students in a teacher's classes for one school year (reads classrooms + enrollments)
const studentsForTeacherYear = (teacherId, academicYear) =>
  db.any(
    `SELECT s.student_id, s.student_name, s.grade, s.student_avatar,
            c.classroom_id, c.class_name
     FROM classrooms c
     JOIN enrollments e ON e.classroom_id = c.classroom_id
     JOIN students s    ON s.student_id = e.student_id
     WHERE c.teacher_id = $1 AND c.academic_year = $2
     ORDER BY s.student_name`,
    [teacherId, academicYear]
  );

const deleteTeacher = (id) =>
  db.oneOrNone('DELETE FROM teachers WHERE teacher_id=$1 RETURNING *', id);

const createTeacher = (teacher) => {
  const {
    teacher_name,
    school_name,
    school_district,
    school_address,
    zipcode,
    state_name,
    class_subject,
    teaching_grade,
    teacher_avatar,
  } = teacher;

  return db.one(
    'INSERT INTO teachers(teacher_name, school_name, school_district, school_address, zipcode, state_name, class_subject, teaching_grade, teacher_avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [
      teacher_name,
      school_name,
      school_district,
      school_address,
      zipcode,
      state_name,
      class_subject,
      teaching_grade,
      teacher_avatar,
    ]
  );
};

const updateTeacher = (teacher, teacherId) => {
  const {
    teacher_name,
    school_name,
    school_district,
    school_address,
    zipcode,
    state_name,
    class_subject,
    teaching_grade,
    teacher_avatar,
  } = teacher;

  return db.oneOrNone(
    'UPDATE teachers SET teacher_name=$1, school_name=$2, school_district=$3, school_address=$4, zipcode=$5, state_name=$6, class_subject=$7, teaching_grade=$8, teacher_avatar=COALESCE($9, teacher_avatar) WHERE teacher_id=$10 RETURNING *',
    [
      teacher_name,
      school_name,
      school_district,
      school_address,
      zipcode,
      state_name,
      class_subject,
      teaching_grade,
      teacher_avatar,
      teacherId,
    ]
  );
};

module.exports = {
  getTeachersPage,
  getAllTeachers,
  oneTeacher,
  deleteTeacher,
  createTeacher,
  updateTeacher,
  getTeacherByEmail,
  studentsForTeacherYear,
  getTeacherByUserId
};
