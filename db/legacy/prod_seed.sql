

\c reading_log

INSERT INTO books (book_title, book_author, isbn_number, publication, book_picture, grade, reading_level) VALUES 
('Night Owl', 'Kim .C. Lee', '978-0-578-71269-7', 'Kimberly Lee', 'https://images-us.bookshop.org/ingram/9780578712697.jpg?height=500&v=v2', 'K', 'C'),
('Cookie"s Week', 'Cindy Ward', '9780399243267', 'Putnam Juvenile', 'https://m.media-amazon.com/images/I/514iKUH5J2L._SY464_BO1,204,203,200_.jpg', '1', 'F'),
('Daddy Hugs', 'Karen Katz', '9781416941200', 'Putnam Juvenile', 'https://m.media-amazon.com/images/I/51JOziLrMfL._SX420_BO1,204,203,200_.jpg', 'K', 'C'),
('Cry for the moon', 'William Woodall', '9780981964126', 'Jeremiah Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348115035i/6338125.jpg', '4', 'CR'),
('Huckleberry Finn', 'Mark Twain', '9780142437179', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546096879i/2956.jpg', '4', 'CR'),
('Harry Potter and the Sorcerer"s Stone', 'J.K. Rowling', '1338878921', 'Scholastics', 'https://m.media-amazon.com/images/W/MEDIAX_792452-T2/images/I/81iqZ2HHD-L._SY522_.jpg', '5', 'CR'),
('Fahrenheit 451', 'Ray Bradbury', '9781451673319', 'Simon & Schuster', 'https://m.media-amazon.com/images/W/MEDIAX_792452-T2/images/I/61z7RDG3OIL._SY522_.jpg', '5', 'CR'),
('How to Kill a Mockingbird', 'Harper Lee', '0446310786', 'Grand Central Publishing', 'https://m.media-amazon.com/images/W/MEDIAX_792452-T2/images/I/71FxgtFKcQL._SY522_.jpg', '5', 'CR'),
('The Hobbit', 'John Ronald Reuel Tolkien', '054792822X', 'Houghton Mifflin', 'https://m.media-amazon.com/images/W/MEDIAX_792452-T2/images/I/710+HcoP38L._SY522_.jpg', '4', 'CR');


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



INSERT INTO users(user_name,user_role,user_avatar,user_email,user_password) VALUES
('Thomas Edward','parent', 'https://api.dicebear.com/5.x/personas/svg?seed=Leo','thomas@gmail.com', 'celia08'),
('Christine Duncan', 'parent','https://api.dicebear.com/5.x/personas/svg?seed=Loki', 'christine@msn.com','jade14'),
('Norma Lioudis', 'parent', 'https://api.dicebear.com/5.x/personas/svg?seed=Lucky','norma@a0l.com', 'barry10'),
('Ms.Fundy', 'teacher','https://api.dicebear.com/5.x/personas/svg?seed=Zoey', 'msfundy@gmail.com', 'fundyedu'),
('Ms.Perez', 'teacher','https://api.dicebear.com/5.x/personas/svg?seed=Aneka', 'msperez@gmail.com', 'perezedu'),
('Mr.Edmundson', 'teacher', 'https://api.dicebear.com/5.x/personas/svg?seed=Jasper','mredmundson@gmail.com', 'edmundsonedu'),
('Ms.Blackmond', 'teacher','https://api.dicebear.com/5.x/personas/svg?seed=Sophie', 'msblackmond@gmail.com', 'blackmondedu');


INSERT INTO subscriptions (fullName, email) VALUES
    ('Lupita','lupita@gmail.com'),
    ('Sven','sven@gmail.com'),
    ('Sam','sam@hotmail.com');
    

INSERT INTO personal_dictionary (word, grade, partsofSpeech, phonetic,   definitions, example,synonyms,antonyms,users_id) VALUES
    ('perfect', '1','noun','https://api.dictionaryapi.dev/media/pronunciations/en/perfect-1-us.mp3',ARRAY['the achievement of finishing a stage or task with no mistakes.'],ARRAY['Practice makes perfect.'],ARRAY['mature','bisexual','hermaphroditic','accurate','flawless','expert','proficient','faultless','infallible'],ARRAY['imperfect','flawed','fallible','faultful','faulty'],3),
    ('challenge','K','noun','https://api.dictionaryapi.dev/media/pronunciations/en/challenge-us.mp3"',ARRAY['A confrontation; a dare.'],ARRAY['We challenged the boys next door to a game of football'],ARRAY['becall','call out'],ARRAY[]::TEXT[],1),
    ('rude', '1','adjective','https://api.dictionaryapi.dev/media/pronunciations/en/rude-us.mp3',ARRAY['Bad-mannered.'],ARRAY['Karen broke up with Fred because he was often rude to her.'],ARRAY['ill-mannered','uncouth','adult','blue','primitive'],ARRAY[]::TEXT[],2);





INSERT INTO notes(note_title, textnotes, users_id) VALUES
    ('useQueryHook with react-query','https://medium.com/@aizaz2117/fetch-data-in-react-js-in-modern-way-f9fe3c8c27f2',1),
    ('Difference between async and promise','The only difference is the execution context between promise and async/await.',2),
    ('How to Deploy Your Vite React App to GitHub Pages (With and Without React Router)','https://medium.com/dev-genius/how-to-deploy-your-vite-react-app-to-github-pages-with-and-without-react-router-b060d912b10e',1);






--     INSERT INTO personal_dictionary (word,grade,wordData , users_id)
-- VALUES ((
--     'challenge','1',
    
-- {
-- "word": "challenge",
-- "phonetic": "/ˈtʃæl.əndʒ/",
-- "phonetics": [
-- {
-- "text": "/ˈtʃæl.əndʒ/",
-- "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/challenge-us.mp3",
-- "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=60627962",
-- "license": {
-- "name": "BY-SA 4.0",
-- "url": "https://creativecommons.org/licenses/by-sa/4.0"
-- }
-- }
-- ],
-- "meanings": [
-- {
-- "partOfSpeech": "noun",
-- "definitions": [
-- {
-- "definition": "A confrontation; a dare.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "A difficult task, especially one that the person making the attempt finds more enjoyable because of that difficulty.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "A procedure or action.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "The opening and crying of hounds at first finding the scent of their game.",
-- "synonyms": [],
-- "antonyms": []
-- }
-- ],
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "partOfSpeech": "verb",
-- "definitions": [
-- {
-- "definition": "To invite (someone) to take part in a competition.",
-- "synonyms": [],
-- "antonyms": [],
-- "example": "We challenged the boys next door to a game of football."
-- },
-- {
-- "definition": "To dare (someone).",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "To dispute (something).",
-- "synonyms": [],
-- "antonyms": [],
-- "example": "to challenge the accuracy of a statement or of a quotation"
-- },
-- {
-- "definition": "To make a formal objection to a juror.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "To claim as due; to demand as a right.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "To censure; to blame.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "To question or demand the countersign from (one who attempts to pass the lines).",
-- "synonyms": [],
-- "antonyms": [],
-- "example": "The sentinel challenged us with \"Who goes there?\""
-- },
-- {
-- "definition": "To object to the reception of the vote of, e.g. on the ground that the person is not qualified as a voter.",
-- "synonyms": [],
-- "antonyms": []
-- },
-- {
-- "definition": "To take (a final exam) in order to get credit for a course without taking it.",
-- "synonyms": [],
-- "antonyms": []
-- }
-- ],
-- "synonyms": [
-- "becall",
-- "call out"
-- ],
-- "antonyms": []
-- }
-- ],
-- "license": {
-- "name": "CC BY-SA 3.0",
-- "url": "https://creativecommons.org/licenses/by-sa/3.0"
-- },
-- "sourceUrls": [
-- "https://en.wiktionary.org/wiki/challenge"
-- ]
-- }
-- ]),
--     ('happy','K',
--     {
--             "word": "happy",
--             "phonetics": [
--                 {
--                     "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/happy-au.mp3",
--                     "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=75797241",
--                     "license": {
--                         "name": "BY-SA 4.0",
--                         "url": "https://creativecommons.org/licenses/by-sa/4.0"
--                     }
--                 },
--                 {
--                     "text": "/ˈhæpiː/",
--                     "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/happy-uk.mp3",
--                     "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=9021973",
--                     "license": {
--                         "name": "BY 3.0 US",
--                         "url": "https://creativecommons.org/licenses/by/3.0/us"
--                     }
--                 },
--                 {
--                     "text": "/ˈhæpi/",
--                     "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/happy-us.mp3",
--                     "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=545617",
--                     "license": {
--                         "name": "BY-SA 3.0",
--                         "url": "https://creativecommons.org/licenses/by-sa/3.0"
--                     }
--                 }
--             ],
--             "meanings": [
--                 {
--                     "partOfSpeech": "noun",
--                     "definitions": [
--                         {
--                             "definition": "A happy event, thing, person, etc.",
--                             "synonyms": [],
--                             "antonyms": []
--                         }
--                     ],
--                     "synonyms": [],
--                     "antonyms": []
--                 },
--                 {
--                     "partOfSpeech": "noun",
--                     "definitions": [
--                         {
--                             "definition": "Preceded by the: happy people as a group.",
--                             "synonyms": [],
--                             "antonyms": []
--                         }
--                     ],
--                     "synonyms": [],
--                     "antonyms": []
--                 },
--                 {
--                     "partOfSpeech": "verb",
--                     "definitions": [
--                         {
--                             "definition": "Often followed by up: to become happy; to brighten up, to cheer up.",
--                             "synonyms": [],
--                             "antonyms": []
--                         },
--                         {
--                             "definition": "Often followed by up: to make happy; to brighten, to cheer, to enliven.",
--                             "synonyms": [],
--                             "antonyms": []
--                         }
--                     ],
--                     "synonyms": [
--                         "happify"
--                     ],
--                     "antonyms": []
--                 },
--                 {
--                     "partOfSpeech": "adjective",
--                     "definitions": [
--                         {
--                             "definition": "Having a feeling arising from a consciousness of well-being or of enjoyment; enjoying good of any kind, such as comfort, peace, or tranquillity; blissful, contented, joyous.",
--                             "synonyms": [],
--                             "antonyms": [],
--                             "example": "Music makes me feel happy."
--                         },
--                         {
--                             "definition": "Experiencing the effect of favourable fortune; favored by fortune or luck; fortunate, lucky, propitious.",
--                             "synonyms": [],
--                             "antonyms": []
--                         },
--                         {
--                             "definition": "Content, satisfied (with or to do something); having no objection (to something).",
--                             "synonyms": [],
--                             "antonyms": [],
--                             "example": "Are you happy to pay me back by the end of the week?"
--                         },
--                         {
--                             "definition": "(Of acts, speech, etc.) Appropriate, apt, felicitous.",
--                             "synonyms": [],
--                             "antonyms": [],
--                             "example": "a happy coincidence"
--                         },
--                         {
--                             "definition": "(in combination) Favoring or inclined to use.",
--                             "synonyms": [],
--                             "antonyms": [],
--                             "example": "slaphappy, trigger-happy"
--                         },
--                         {
--                             "definition": "(of people, often followed by \"at\" or \"in\") Dexterous, ready, skilful.",
--                             "synonyms": [],
--                             "antonyms": []
--                         }
--                     ],
--                     "synonyms": [
--                         "cheerful",
--                         "content",
--                         "delighted",
--                         "elated",
--                         "exultant",
--                         "glad",
--                         "joyful",
--                         "jubilant",
--                         "merry",
--                         "orgasmic",
--                         "fortunate",
--                         "lucky",
--                         "propitious"
--                     ],
--                     "antonyms": [
--                         "inappropriate",
--                         "inapt",
--                         "unfelicitous",
--                         "disenchanted",
--                         "dissatisfied",
--                         "blue",
--                         "depressed",
--                         "down",
--                         "miserable",
--                         "moody",
--                         "morose",
--                         "sad",
--                         "unhappy",
--                         "unfortunate",
--                         "unlucky",
--                         "unpropitious"
--                     ]
--                 }
--             ],
--             "license": {
--                 "name": "CC BY-SA 3.0",
--                 "url": "https://creativecommons.org/licenses/by-sa/3.0"
--             },
--             "sourceUrls": [
--                 "https://en.wiktionary.org/wiki/happy"
--             ]
--         },1),
--     ]'::JSONB
-- );