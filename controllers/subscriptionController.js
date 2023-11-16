const express = require('express');
const subscription = express.Router();

const db = require('../db/dbConfig');

const {
  getAllSubscriptions,
  getASubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../queries/subscriptions');

//create a subscription

subscription.post('/', async (req, res) => {
  const newSubscription = req.body;

  //Check if both 'firstname' and 'email' are provided in the request body
  if (!newSubscription.fullName || !newSubscription.email) {
    return res.status(400).json({
      success: false,
      message: 'Both fullName and email are required fields.',
    });
  }

  try {
    const addSubscription = await createSubscription(newSubscription);
    res.status(200).json({
      success: true,
      payload: addSubscription,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Subscription cannot be added',
    });
  }
});

//INDEX SUBSCRIPTION
subscription.get('/', async (req, res) => {
  console.log(req.body);
  try {
    const allSubscriptions = await getAllSubscriptions();

    res.status(200).json({ success: true, payload: allSubscriptions });
  } catch (error) {
    res.status(404).json({ sucess: false, message: 'no Subscriptions found' });
  }
});
//get a subscription
subscription.get('/subscribe/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const subscriptionFound = await getASubscription(email);
    res.status(200).json({ success: true, payload: subscriptionFound });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Cannot find the subscription with the given email',
    });
  }
});

//PUT /subscriptions

subscription.put('/update/:updatedEmail', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    // Check if the new email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'New email address is required.',
      });
    }

    // Update the subscription email address
    const updatedSubscription = await updateSubscription(
      req.body,
      subscriptionId
    );

    res.status(200).json({
      success: true,
      payload: updatedSubscription,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Subscription email update failed',
    });
  }
});

//DELETE Subscription
subscription.delete('/unsubscribe/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const deletedSubscription = await deleteSubscription(email);
    res.status(200).json({ success: true, payload: deletedSubscription });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Sorry ! Subscription could not be cancelled at this moment',
    });
  }
});

module.exports = subscription;
