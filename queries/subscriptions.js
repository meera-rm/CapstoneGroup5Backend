const db = require('../db/dbConfig.js');

const getAllSubscriptions = async () => {
  try {
    const allSubscriptions = await db.any('SELECT * FROM subscriptions');
    console.log('all=', allSubscriptions);
    return allSubscriptions;
  } catch (error) {
    return error;
  }
};

const getASubscription = async (email) => {
  try {
    const subscription = await db.one(
      'SELECT * FROM subscriptions WHERE email=$1',
      email
    );
    return subscription;
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `Cannot find the subscription with the given id"`,
    });
    // return error;
  }
};
// ON CONFLICT (email) DO NOTHING
const createSubscription = async (subscription) => {
  const { fullName, email, is_subscribed, is_verified } = subscription;
  try {
    return await db.one(
      'INSERT INTO subscriptions (fullName, email, is_subscribed, is_verified) VALUES ($1, $2, $3, $4) RETURNING *',
      [fullName, email, is_subscribed, is_verified]
    );
  } catch (error) {
    console.log(error.message);
    throw error; // Throw the error so it can be caught in the calling function
  }
};

const updateSubscription = async (subscription, subscriptionId) => {
  let { email, fullname, is_verified } = subscription;

  try {
    // Check if the current email exists in the database
    const existingSubscription = await db.oneOrNone(
      'SELECT * FROM subscriptions WHERE subscription_id = $1 '
    );
    console.log(existingSubscription);

    if (!existingSubscription) {
      throw new Error('Subscription not found');
    }
    
    // Update the email address for the subscription
    const updatedSubscription = await db.one(
      'UPDATE subscriptions SET email = $1 ,fullname = $2, is_verified= $3 WHERE subscription_id = $4 RETURNING *',
    
    );
    return updatedSubscription;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const deleteSubscription = async (email) => {
  try {
    return await db.one(
      'DELETE FROM subscriptions WHERE email=$1 RETURNING *',
      email
    );
  } catch (error) {
    console.log(error.message || error);
    return error;
  }
};

module.exports = {
  getAllSubscriptions,
  getASubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
