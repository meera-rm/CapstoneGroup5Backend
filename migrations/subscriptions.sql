-- Subscriptions table used by queries/subscriptions.js and /api/subscriptions.
-- Same columns as the original production schema (db/legacy/prod_schema.sql), so a
-- database that already has this table is left unchanged.
CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  subscribed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_subscribed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Copy subscribers from the older email_subscriptions table (safe to run more than once)
INSERT INTO subscriptions (fullName, email)
SELECT COALESCE(firstname, ''), email FROM email_subscriptions
ON CONFLICT (email) DO NOTHING;
