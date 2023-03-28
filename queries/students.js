const db = require('../db/dbConfig.js');

const getAllStudents = async (teacherId) => {

  let allStudents;
  try {
    if (!teacherId) {
       allStudents = await db.any('SELECT * FROM students ');
    } else {
     allStudents = await db.any(
        'SELECT * FROM students where teachers_id=$1',
        teacherId
      );
    }
   

    return allStudents;
  } catch (error) {
    return error;
  }
};

const getAStudent = async (id) => {
  try {
    const oneStudent = await db.one(
      'SELECT * FROM students WHERE student_id=$1',
      id
    );
    return oneStudent;
  } catch (error) {
    return error;
  }
};


const createStudent = async (student) => {
  // console.log('instudetn query',student)
  let {
    student_name,
    parent_name,
    parent_email,
    student_email,
    grade,
    academic_year,
    reading_level,
    teachers_id
  } = student;

  try {
    const newStudent = await db.one(
      'INSERT INTO students (student_name,parent_name,parent_email, student_email,grade,academic_year,reading_level,teachers_id ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        student_name,
        parent_name,
        parent_email,
        student_email,
        grade,
        academic_year,
        reading_level,
        teachers_id,
      ]
    );
    // console.log('in student query2',newStudent)
    return newStudent;
  } catch (error) {
    console.log(error.message);
    // throw new Error(error.message);
    res.status(404).json({ success: false, message: 'Student cannot be added' });

  }
};

const deleteStudent = async (id) => {
  try {
    const deletedStudent = await db.one(
      'DELETE FROM students WHERE student_id = $1 RETURNING *',
      id
    );
    return deletedStudent;
  } catch (error) {
    return error;
  }
};

const updateStudent = async ( student, studentId) => {
  let {
    student_name,
    parent_name,
    parent_email,
    student_email,
    grade,
    academic_year,
    reading_level,
    teachers_id
  } = student;
  try {
   
    return await db.one(
      'UPDATE students SET student_name=$1,parent_name=$2,parent_email=$3,student_email=$4,grade=$5,academic_year=$6,reading_level=$7,teachers_id=$8  where student_id=$9 RETURNING *',
      [
        student_name,
        parent_name,
        parent_email,
        student_email,
        grade,
        academic_year,
        reading_level,
        teachers_id,
        studentId,
      ]
    );
    
  } catch (error) {
    return error;
  }
};

module.exports = {
  getAStudent,
  createStudent,
  deleteStudent,
  updateStudent,
  getAllStudents,
};
