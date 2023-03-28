const db = require('../db/dbConfig');

// display all teachers not sure if we need this route but here it is anyway

const allTeachers = async () => {
  try {
    return await db.any('SELECT * FROM teachers');
  } catch (error) {
    return error;
  }
};

// get one teacher
const oneTeacher = async (id) => {
  try {
    return await db.one('SELECT * FROM teachers WHERE teacher_id=$1', id);
  } catch (error) {
    return error;
  }
};

// delete a teacher
const deleteTeacher = async (id) => {
  try {
    return await db.one(
      'DELETE FROM teachers WHERE id=$1 RETURNING *',
      teacher_id
    );
  } catch (error) {
    return error;
  }
};

// creating new teacher acct

const createTeacher = async (teacher) => {
  let {
    teacher_name,
    school_name,
    school_district,
    school_address,
    zipcode,
    state_name,
    class_subject,
    teaching_grade,
  } = teacher;
  
  try {
    const newTeacher = await db.one(
      'INSERT INTO teachers(teacher_name, school_name, school_district, school_address, zipcode, state_name, class_subject, teaching_grade) VALUES ($1, $2, $3, $4, $5, $6, $7 , $8 ) RETURNING *',
      [
        teacher_name,
        school_name,
        school_district,
        school_address,
        zipcode,
        state_name,
        class_subject,
        teaching_grade,
      ]
    );

    return newTeacher;
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

// update/edit teacher acct

const upDateTeacher = async (teacher, teacherId) => {
  let [
    teacher_name,
    school_name,
    school_district,
    school_address,
    zipcode,
    state_name,
    class_subject,
    teaching_grade,
  ] = teacher;
  try {
    return await db.one(
      'UPDATE teachers SET teacher_name = $1, school_name = $2, school_district = $3, school_address = $4, zipcode = $5, state_name = $6, class_subject = $7, teaching_grade=$8 WHERE teacher_id = $9 RETURNING *',
      [
        teacher_name,
        school_name,
        school_district,
        school_address,
        zipcode,
        state_name,
        class_subject,
        teaching_grade,
        teacherId,
      ]
    );
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

module.exports = {
  allTeachers,
  oneTeacher,
  deleteTeacher,
  createTeacher,
  upDateTeacher,
};
