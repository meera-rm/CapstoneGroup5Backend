-- Legacy tables from the original ScholarSheep backend
-- These support the existing frontend pages (Books, Teachers, Students, Comments, Notes, etc.)

-- ===== BOOKS (original) =====
CREATE TABLE IF NOT EXISTS books (
  book_id SERIAL PRIMARY KEY,
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  isbn_number TEXT,
  publication TEXT,
  book_picture TEXT,
  grade TEXT,
  reading_level TEXT
);

-- ===== LOGS =====
CREATE TABLE IF NOT EXISTS logs (
  log_id SERIAL PRIMARY KEY,
  date_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reading_inference TEXT,
  book_title TEXT,
  reading_minutes INTEGER DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  books_id INTEGER REFERENCES books(book_id) ON UPDATE CASCADE ON DELETE CASCADE,
  students_id INTEGER REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ===== COMMENTS =====
CREATE TABLE IF NOT EXISTS comments (
  comment_id SERIAL PRIMARY KEY,
  teacher_comments TEXT NOT NULL,
  logs_id INTEGER REFERENCES logs(log_id) ON UPDATE CASCADE ON DELETE CASCADE,
  teachers_id INTEGER REFERENCES teachers(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ===== NOTES =====
CREATE TABLE IF NOT EXISTS notes (
  note_id SERIAL PRIMARY KEY,
  note_title TEXT,
  textnotes TEXT,
  users_id INTEGER REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== EMAIL SUBSCRIPTIONS =====
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id SERIAL PRIMARY KEY,
  firstname TEXT,
  email TEXT NOT NULL UNIQUE
);

-- ===== PERSONAL DICTIONARY =====
CREATE TABLE IF NOT EXISTS personal_dictionary (
  dictionary_id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  word TEXT NOT NULL,
  grade TEXT,
  partsofSpeech TEXT,
  phonetic TEXT,
  definitions TEXT,
  example TEXT,
  synonyms TEXT[],
  antonyms TEXT[],
  users_id INTEGER REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ===== SEED BOOKS =====
-- Seed only when the table is empty, so re-running migrations never duplicates rows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM books) THEN
    INSERT INTO books (book_title, book_author, isbn_number, publication, book_picture, grade, reading_level) VALUES
      ('Night Owl', 'Kim C. Lee', '978-0-578-71269-7', 'Kimberly Lee', 'https://images-us.bookshop.org/ingram/9780578712697.jpg?height=500&v=v2', 'K', 'C'),
      ('Cookies Week', 'Cindy Ward', '9780399243267', 'Putnam Juvenile', 'https://m.media-amazon.com/images/I/514iKUH5J2L._SY464_BO1,204,203,200_.jpg', '1', 'F'),
      ('Daddy Hugs', 'Karen Katz', '9781416941200', 'Putnam Juvenile', 'https://m.media-amazon.com/images/I/51JOziLrMfL._SX420_BO1,204,203,200_.jpg', 'K', 'C'),
      ('Charlotte''s Web', 'E.B. White', '9780064400558', 'HarperCollins', 'https://covers.openlibrary.org/b/isbn/9780064400558-M.jpg', '3', 'R'),
      ('Matilda', 'Roald Dahl', '9780142410370', 'Puffin Books', 'https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg', '3', 'S'),
      ('Diary of a Wimpy Kid', 'Jeff Kinney', '9780810993136', 'Amulet Books', 'https://covers.openlibrary.org/b/isbn/9780810993136-M.jpg', '4', 'T'),
      ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '9780590353427', 'Scholastic', 'https://covers.openlibrary.org/b/isbn/9780590353427-M.jpg', '5', 'V'),
      ('The Lightning Thief', 'Rick Riordan', '9780786838653', 'Disney Hyperion', 'https://covers.openlibrary.org/b/isbn/9780786838653-M.jpg', '5', 'W'),
      ('Wonder', 'R.J. Palacio', '9780375869020', 'Knopf Books', 'https://covers.openlibrary.org/b/isbn/9780375869020-M.jpg', '4', 'V'),
      ('The One and Only Ivan', 'Katherine Applegate', '9780061992278', 'HarperCollins', 'https://covers.openlibrary.org/b/isbn/9780061992278-M.jpg', '3', 'S'),
      ('Dog Man', 'Dav Pilkey', '9780545581608', 'Scholastic', 'https://covers.openlibrary.org/b/isbn/9780545581608-M.jpg', '2', 'O'),
      ('The Bad Guys', 'Aaron Blabey', '9780545912402', 'Scholastic', 'https://covers.openlibrary.org/b/isbn/9780545912402-M.jpg', '2', 'P');
  END IF;
END $$;

-- ===== SEED TEACHERS =====
-- Seed only when the table is empty, so re-running migrations never duplicates rows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teachers) THEN
    INSERT INTO teachers (teacher_name, school_name, school_district, school_address, zipcode, state_name, class_subject, teaching_grade, teacher_avatar) VALUES
      ('Ms. Fundy', 'P.S. 152', 2, '725 East 23rd St', 11210, 'NY', 'Reading', '1', 'https://api.dicebear.com/5.x/personas/svg?seed=Sophie'),
      ('Ms. Perez', 'P.S. 152', 2, '725 East 23rd St', 11210, 'NY', 'Reading', 'K', 'https://api.dicebear.com/5.x/personas/svg?seed=Maggie'),
      ('Mr. Edmundson', 'P.S. 315', 4, '2310 Glenwood Rd', 11210, 'NY', 'Reading', '3', 'https://api.dicebear.com/5.x/personas/svg?seed=Luna'),
      ('Ms. Blackmond', 'P.S. 075', 13, '735 West End Ave', 10025, 'NY', 'Reading', '2', 'https://api.dicebear.com/5.x/personas/svg?seed=Loki');
  END IF;
END $$;

-- ===== SEED STUDENTS =====
-- Seed only when the table is empty, so re-running migrations never duplicates rows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM students) THEN
    INSERT INTO students (student_name, parent_email, academic_year, grade, student_image, user_id) VALUES
      ('Celia Edward', 'thomas@gmail.com', '2025-2026', '1', 'https://api.dicebear.com/5.x/pixel-art/svg?seed=Zoey', NULL),
      ('Jade Duncan', 'christine@msn.com', '2025-2026', '1', 'https://api.dicebear.com/5.x/pixel-art/svg?seed=Lucy', NULL),
      ('Barry Lioudis', 'norma@aol.com', '2025-2026', '1', 'https://api.dicebear.com/5.x/pixel-art/svg?seed=Zoe', NULL);
  END IF;
END $$;

-- ===== SEED SUBSCRIPTIONS =====
INSERT INTO email_subscriptions (firstname, email) VALUES
  ('Thomas', 'thomas@gmail.com'),
  ('Christine', 'christine@msn.com'),
  ('Norma', 'norma@aol.com')
ON CONFLICT DO NOTHING;

-- ===== SEED DICTIONARY / FLASHCARD WORDS =====
-- Seed only when the table is empty, so re-running migrations never duplicates rows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM personal_dictionary) THEN
    INSERT INTO personal_dictionary (word, grade, partsofSpeech, phonetic, definitions, example, synonyms, antonyms) VALUES
      ('adventure', 'K', 'noun', '/ədˈven(t)SHər/', 'an exciting experience or journey', 'Going to the park was a great adventure.', '{journey,quest,expedition}', '{boredom,routine}'),
      ('brave', '1', 'adjective', '/brāv/', 'ready to face danger or pain; showing courage', 'The brave girl rescued the kitten from the tree.', '{courageous,bold,fearless}', '{cowardly,timid,afraid}'),
      ('curious', '1', 'adjective', '/ˈkyo͝orēəs/', 'eager to know or learn something', 'The curious cat explored every corner of the house.', '{inquisitive,eager,interested}', '{indifferent,uninterested}'),
      ('discover', '2', 'verb', '/dəˈskəvər/', 'to find something for the first time', 'Scientists discover new species every year.', '{find,uncover,detect}', '{miss,overlook,lose}'),
      ('enormous', '2', 'adjective', '/əˈnôrməs/', 'very large in size or amount', 'The enormous whale swam past our boat.', '{huge,massive,gigantic}', '{tiny,small,miniature}'),
      ('fiction', '3', 'noun', '/ˈfikSH(ə)n/', 'stories that describe imaginary events and people', 'Harry Potter is a popular work of fiction.', '{fantasy,story,tale}', '{nonfiction,fact,reality}'),
      ('generous', '3', 'adjective', '/ˈjen(ə)rəs/', 'willing to give more than is expected', 'She was generous and shared her lunch with everyone.', '{giving,kind,charitable}', '{selfish,greedy,stingy}'),
      ('habitat', '3', 'noun', '/ˈhabəˌtat/', 'the natural home of an animal or plant', 'The rainforest is the habitat of many colorful birds.', '{environment,home,territory}', '{}'),
      ('illustrate', '4', 'verb', '/ˈiləˌstrāt/', 'to explain or make something clear by using pictures or examples', 'The artist will illustrate the childrens book.', '{draw,depict,demonstrate}', '{confuse,obscure}'),
      ('journey', '4', 'noun', '/ˈjərnē/', 'an act of traveling from one place to another', 'The journey to grandmas house took three hours.', '{trip,voyage,expedition}', '{stay,stop}'),
      ('knowledge', '4', 'noun', '/ˈnälij/', 'facts and information learned through experience or education', 'Reading books increases your knowledge.', '{wisdom,understanding,learning}', '{ignorance,stupidity}'),
      ('legend', '5', 'noun', '/ˈlejənd/', 'a traditional story sometimes regarded as historical', 'The legend of King Arthur is known worldwide.', '{myth,tale,fable}', '{fact,history,truth}'),
      ('magnificent', '5', 'adjective', '/maɡˈnifəsənt/', 'extremely beautiful or impressive', 'The sunset over the ocean was magnificent.', '{splendid,grand,stunning}', '{ugly,ordinary,plain}'),
      ('narrative', '5', 'noun', '/ˈnerədiv/', 'a spoken or written account of connected events; a story', 'The student wrote a narrative about summer vacation.', '{story,account,tale}', '{}'),
      ('observe', '4', 'verb', '/əbˈzərv/', 'to watch carefully', 'We observe the stars through a telescope.', '{watch,notice,examine}', '{ignore,overlook,neglect}'),
      ('persevere', '5', 'verb', '/ˌpərsəˈvir/', 'to continue trying even when things are difficult', 'She persevered and finally learned to ride a bike.', '{persist,endure,continue}', '{quit,surrender,give up}');
  END IF;
END $$;


-- ===== BOOKS CATALOG =====
CREATE TABLE IF NOT EXISTS books_catalog (
  catalog_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT NOT NULL UNIQUE,
  cover_url TEXT,
  page_count INTEGER,
  genre TEXT,
  reading_level TEXT,
  open_library_id TEXT,
  publish_year INTEGER
);

-- ===== SEED BOOKS CATALOG (real ISBNs, cover/page data from OpenLibrary) =====
INSERT INTO books_catalog (title, author, isbn, cover_url, page_count, genre, reading_level, open_library_id, publish_year) VALUES
('Night Owl', 'Kim C. Lee', '9780578712697', 'https://covers.openlibrary.org/b/isbn/9780578712697-M.jpg', 28, 'Picture Book', 'Early Reader', '/books/OL32190356M', 2020),
('Cookies Week', 'Cindy Ward', '9780399243267', 'https://covers.openlibrary.org/b/isbn/9780399243267-M.jpg', NULL, 'Picture Book', 'Early Reader', NULL, NULL),
('Daddy Hugs', 'Karen Katz', '9781416941200', 'https://covers.openlibrary.org/b/isbn/9781416941200-M.jpg', 32, 'Board Book', 'Early Reader', '/books/OL8458919M', 2007),
('Charlotte''s Web', 'E.B. White', '9780064400558', 'https://covers.openlibrary.org/b/isbn/9780064400558-M.jpg', 184, 'Fiction', 'Middle Grade', '/books/OL61062640M', 1952),
('Matilda', 'Roald Dahl', '9780142410370', 'https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg', 240, 'Fiction', 'Middle Grade', '/books/OL9737402M', 2007),
('Diary of a Wimpy Kid', 'Jeff Kinney', '9780810993136', 'https://covers.openlibrary.org/b/isbn/9780810993136-M.jpg', 226, 'Fiction', 'Middle Grade', '/books/OL36660032M', 2007),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '9780590353427', 'https://covers.openlibrary.org/b/isbn/9780590353427-M.jpg', NULL, 'Fantasy', 'Middle Grade', '/books/OL61088892M', 1999),
('The Lightning Thief', 'Rick Riordan', '9780786838653', 'https://covers.openlibrary.org/b/isbn/9780786838653-M.jpg', 416, 'Fantasy', 'Middle Grade', '/books/OL42476783M', 2006),
('Wonder', 'R.J. Palacio', '9780375869020', 'https://covers.openlibrary.org/b/isbn/9780375869020-M.jpg', 315, 'Fiction', 'Middle Grade', '/books/OL25025136M', 2012),
('The One and Only Ivan', 'Katherine Applegate', '9780061992278', 'https://covers.openlibrary.org/b/isbn/9780061992278-M.jpg', 336, 'Fiction', 'Middle Grade', '/books/OL27319786M', 2015),
('Dog Man', 'Dav Pilkey', '9780545581608', 'https://covers.openlibrary.org/b/isbn/9780545581608-M.jpg', NULL, 'Graphic Novel', 'Early Reader', '/books/OL27916229M', 2016),
('The Bad Guys', 'Aaron Blabey', '9780545912402', 'https://covers.openlibrary.org/b/isbn/9780545912402-M.jpg', NULL, 'Graphic Novel', 'Early Reader', '/books/OL26212056M', 2017)
ON CONFLICT (isbn) DO NOTHING;
