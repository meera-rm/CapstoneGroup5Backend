const db = require('../db/dbConfig');

// Each query lets errors propagate (throw) so the controller can send a 500
// instead of returning the Error object as if it were data.

const allTeachers = () => db.any('SELECT * FROM teachers');

// oneOrNone: returns null (instead of throwing) when no teacher has this id
const oneTeacher = (id) =>
  db.oneOrNone('SELECT * FROM teachers WHERE teacher_id=$1', id);

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
  allTeachers,
  oneTeacher,
  deleteTeacher,
  createTeacher,
  updateTeacher,
};
