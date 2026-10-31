const express = require('express');
const subscription = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const { sendDbError } = require('../utils/dbErrors');

const {
  getAllSubscriptions,
  getASubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../queries/subscriptions');

// Create a subscription: public, so visitors can subscribe without an account
subscription.post('/', async (req, res) => {
  const newSubscription = req.body;
  if (!newSubscription.fullName || !newSubscription.email) {
    return res.status(400).json({
      success: false,
      message: 'Both fullName and email are required fields.',
    });
  }
  try {
    const addSubscription = await createSubscription(newSubscription);
    res.status(200).json({ success: true, payload: addSubscription });
  } catch (error) {
    sendDbError(res, error, 'Subscription cannot be added');
  }
});

// Every subscriber's email: admins only
subscription.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    res.status(200).json({ success: true, payload: await getAllSubscriptions() });
  } catch (error) {
    sendDbError(res, error, 'Could not load subscriptions');
  }
});

// Get a subscription by email
subscription.get('/subscribe/:email', authenticate, async (req, res) => {
  try {
    const subscriptionFound = await getASubscription(req.params.email);
    if (!subscriptionFound) {
      return res.status(404).json({ success: false, message: 'Cannot find the subscription with the given email' });
    }
    res.status(200).json({ success: true, payload: subscriptionFound });
  } catch (error) {
    sendDbError(res, error, 'Could not load subscription');
  }
});

// Update the subscription whose current email is :updatedEmail
// Body: { email?, fullname?, is_verified? } (fields left out keep their values)
subscription.put('/update/:updatedEmail', authenticate, async (req, res) => {
  try {
    const updatedSubscription = await updateSubscription(req.body, req.params.updatedEmail);
    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: 'Cannot find the subscription with the given email' });
    }
    res.status(200).json({ success: true, payload: updatedSubscription });
  } catch (error) {
    sendDbError(res, error, 'Subscription email update failed');
  }
});

// Unsubscribe: public, so the link in an email works without logging in
subscription.delete('/unsubscribe/:email', async (req, res) => {
  try {
    const deletedSubscription = await deleteSubscription(req.params.email);
    if (!deletedSubscription) {
      return res.status(404).json({ success: false, message: 'Cannot find the subscription with the given email' });
    }
    res.status(200).json({ success: true, payload: deletedSubscription });
  } catch (error) {
    sendDbError(res, error, 'Sorry! Subscription could not be cancelled at this moment');
  }
});

module.exports = subscription;
