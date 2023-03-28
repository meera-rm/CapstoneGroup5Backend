

\c reading_log


INSERT INTO books(book_title,book_author,isbn_number,publication,book_picture,grade,reading_level) VALUES 
('Night Owl',' Kim .C. Lee','978-0-578-71269-7','Kimberly Lee','https://images-us.bookshop.org/ingram/9780578712697.jpg?height=500&v=v2','K','C'),
('Cookie"s Week','Cindy Ward','9780399243267','Putnam Juvenile','https://m.media-amazon.com/images/I/514iKUH5J2L._SY464_BO1,204,203,200_.jpg','1','F'),
('Daddy Hugs','Karen Katz','9781416941200','Putnam Juvenile','https://m.media-amazon.com/images/I/51JOziLrMfL._SX420_BO1,204,203,200_.jpg','K','C');


INSERT INTO teachers(teacher_name,school_name,school_district,school_address,zipcode,state_name,class_subject,teaching_grade,teacher_avatar) VALUES
('Ms.Fundy', 'P.S. 152', '2', '725 East 23rd St',11210, 'NY','Reading','1','https://api.dicebear.com/5.x/personas/svg?seed=Sophie'),
('Ms Perez', 'P.S. 152', '2', '725 East 23rd St', 11210, 'NY','Reading','K','https://api.dicebear.com/5.x/personas/svg?seed=Sasha'),
('Mr.Edmundson','P.S. 315','4', '2310 Glenwood Rd', 11210, 'NY','Reading','3','https://api.dicebear.com/5.x/personas/svg?seed=Luna'),
('Ms.Blackmond', 'P.S. 075', '13', '735 West End Ave', 10025, 'NY','Reading','2','https://api.dicebear.com/5.x/personas/svg?seed=Aneka');


INSERT INTO students(student_name,parent_name,parent_email,student_email,grade,academic_year,reading_level,student_avatar,teachers_id) VALUES
    ('Celia Edward','Thomas Edward','thomas@gmail.com','celia_edward@nycschools.org','1','2022-2023','G','https://api.dicebear.com/5.x/pixel-art/svg?seed=Zoey',1),
    ('Jade Duncan','Christine Duncan','christine@msn.com','jade_duncan@nycschools.org','1','2022-2023','H','https://api.dicebear.com/5.x/pixel-art/svg?seed=Lucy',1),
    ('Barry Lioudis','Norma Lioudis','norma@a0l.com','barry_lioudis@nycschools.org','1','2022-2023','I', 'https://api.dicebear.com/5.x/pixel-art/svg?seed=Zoe',1);

INSERT INTO logs(reading_inference,book_title,reading_minutes,pages_read,books_id,students_id)VALUES
('I loved that the owl was so brave','Night Owl',30,20,2,1),
('I can remember days of the week now','Cookie"s Week',45,30,1,1),
('We all love Daddy Hug','Daddy Hugs',50,45,3,3);

INSERT INTO comments(teacher_comments,logs_id,teachers_id)VALUES
('Great Understanding of the Book',1,1),
('Great Job learning days of week',2,1),
('How does the character feel?',3,2);


INSERT INTO users(users_name,users_role,users_email,user_password) VALUES
('Thomas Edward','parent', 'thomas@gmail.com', 'celia08'),
('Christine Duncan', 'parent', 'christine@msn.com','jade14'),
('Norma Lioudis', 'parent', 'norma@a0l.com', 'barry10'),
('Ms.Fundy', 'teacher', 'msfundy@gmail.com', 'fundyedu'),
('Ms.Perez', 'teacher', 'msperez@gmail.com', 'perezedu'),
('Mr.Edmundson', 'teacher', 'mredmundson@gmail.com', 'edmundsonedu'),
('Ms.Blackmond', 'teacher', 'msblackmond@gmail.com', 'blackmondedu');


