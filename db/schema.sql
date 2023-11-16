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
    user_id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL UNIQUE,
    user_role TEXT NOT NULL,
    user_avatar TEXT NOT NULL,
    user_email TEXT NOT NULL UNIQUE,
    user_password TEXT NOT NULL
);


DROP TABLE IF EXISTS  email_subscriptions;
CREATE TABLE email_subscriptions (
    id SERIAL PRIMARY KEY, 
    firstname text,
    email text NOT NULL UNIQUE
);


DROP TABLE IF EXISTS firebase ;
CREATE TABLE firebase(
    firebase_id SERIAL PRIMARY KEY,
    firebase_email TEXT NOT NULL,
    id INT REFERENCES users(users_id)

)

DROP TABLE IF EXISTS  personal_dictionary;
CREATE TABLE personal_dictionary (
    dictionary_id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    word TEXT NOT NULL,
    grade TEXT NOT NULL,
    partsofSpeech TEXT NOT NULL,
    definitions TEXT NOT NULL,
    example TEXT ,
    synonyms TEXT [],
    antonyms TEXT [],
    users_id INTEGER REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE 
    CASCADE
);

