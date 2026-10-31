
-- 002_google_login.sql — run once on your existing users table so Google sign-in works.
 
-- Where we store Google's permanent user id ("sub")
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
 
-- Google-only users have no password
ALTER TABLE users ALTER COLUMN user_password DROP NOT NULL;
 
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_has_login_method;
-- Every user still needs at least one way to log in
ALTER TABLE users
  ADD CONSTRAINT users_has_login_method
  CHECK (user_password IS NOT NULL OR google_id IS NOT NULL);
 
-- Treat Meera@X.com and meera@x.com as the same email
-- (fails if you already have duplicate emails that differ only by case — clean those up first)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(user_email));
 