const db = require('../db/dbConfig.js');

// Query functions never send responses (there is no `res` here).
// They return data, return null when nothing matches, or throw on a database error.

// Get all: a list
const getAllSubscriptions = () => db.any('SELECT * FROM subscriptions');

// Get one by email: the subscription, or null
const getASubscription = (email) =>
  db.oneOrNone('SELECT * FROM subscriptions WHERE email=$1', email);

// Create: always exactly one new row
const createSubscription = (subscription) => {
  const { fullName, email, is_subscribed, is_verified } = subscription;
  return db.one(
    'INSERT INTO subscriptions (fullName, email, is_subscribed, is_verified) VALUES ($1, $2, $3, $4) RETURNING *',
    [fullName, email, is_subscribed, is_verified]
  );
};

// Update the subscription that currently has `currentEmail`.
// Returns the updated subscription, or null if no subscription has that email.
// Fields left out of the request keep their current values.
const updateSubscription = (subscription, currentEmail) => {
  const { email, fullname, is_verified } = subscription;
  return db.oneOrNone(
    `UPDATE subscriptions
       SET email = COALESCE($1, email),
           fullname = COALESCE($2, fullname),
           is_verified = COALESCE($3, is_verified)
     WHERE email = $4
     RETURNING *`,
    [email, fullname, is_verified, currentEmail]
  );
};

// Delete by email: the deleted subscription, or null
const deleteSubscription = (email) =>
  db.oneOrNone('DELETE FROM subscriptions WHERE email=$1 RETURNING *', email);

module.exports = {
  getAllSubscriptions,
  getASubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
