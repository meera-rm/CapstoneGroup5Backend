DROP DATABASE IF EXISTS reading_log;

CREATE DATABASE reading_log;

\c reading_log;

DROP TABLE IF EXISTS books;

CREATE TABLE books(
    book_id SERIAL PRIMARY KEY,
    book_title TEXT NOT NULL,
    book_author TEXT NOT NULL,
    isbn_number TEXT NOT NULL,
    publication TEXT NOT NULL,
    book_picture TEXT NOT NULL,
    grade TEXT NOT NULL,
    reading_level TEXT NOT NULL
);
    

DROP TABLE IF EXISTS teachers;

CREATE TABLE teachers(
    teacher_id SERIAL PRIMARY KEY,
    teacher_name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    school_district INTEGER,
    school_address TEXT NOT NULL,
    zipcode INTEGER,
    state_name TEXT NOT NULL,
    class_subject TEXT NOT NULL,
    teaching_grade TEXT NOT NULL,
    teacher_avatar TEXT
);


DROP TABLE IF EXISTS students;

CREATE TABLE students(
    student_id SERIAL PRIMARY KEY,
    student_name  TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    student_email TEXT NOT NULL,
    grade TEXT NOT  NULL,
    academic_year TEXT NOT NULL,
    reading_level TEXT NOT NULL,
    student_avatar TEXT,
    teachers_id INTEGER REFERENCES teachers(teacher_id) ON UPDATE CASCADE
    ON DELETE CASCADE
);


DROP TABLE IF EXISTS logs;

CREATE TABLE logs(
    log_id SERIAL PRIMARY KEY,
    date_read timestamp DEFAULT CURRENT_TIMESTAMP,
    reading_inference TEXT NOT NULL,
    book_title TEXT NOT NULL,
    reading_minutes INTEGER NOT NULL,
    pages_read INTEGER NOT NULL,
    books_id INTEGER REFERENCES books(book_id)  ON UPDATE CASCADE ON DELETE CASCADE,
    students_id INTEGER REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY,
    teacher_comments TEXT NOT NULL,
    logs_id INTEGER REFERENCES logs(log_id) ON UPDATE CASCADE ON DELETE CASCADE,
    teachers_id INTEGER REFERENCES teachers(teacher_id)
      ON UPDATE CASCADE ON DELETE CASCADE
    );




DROP TABLE IF EXISTS users; 

CREATE TABLE users(
    users_id SERIAL PRIMARY KEY,
    users_name TEXT NOT NULL,
    -- not sure if we will need the field below
    users_role TEXT NOT NULL,
    users_avatar TEXT,
    users_email TEXT NOT NULL,
    user_password TEXT NOT NULL
);




CREATE TABLE firebase(
    firebase_id SERIAL PRIMARY KEY,
    firebase_email TEXT NOT NULL,
    id INT REFERENCES users(users_id)

)

