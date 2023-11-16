const e = require('express');
var express = require('express');
var router = express.Router();

const db = require('../db/dbConfig');
const {
  getAllSubscriptions,
  getASubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../queries/subscriptions');

// CRUD Operations
router.post('/', async (req, res) => {
  const newSubscription = req.body;
  const { fullName, email } = newSubscription;
   console.log(newSubscription)
  if (!fullName || !email) {
    return res.status(400).json({ error: 'Firstname and email are required.' });
  }
  // const subscribed_date = moment().format('YYYY-MM-DD HH:mm:ss');
  try {
    const addSubscription = await createSubscription(newSubscription);
    if (addSubscription) {
      res.status(200).json({ success: true, payload: addSubscription[0] });
    }
  } catch (error) {
    // console.log('Caught in error');
    console.log(error.message);
    res.status(404).json({ success: false, message: 'Book cannot be added' });
  }
});

//     const query =
//       'INSERT INTO subscriptions (firstname, email,is_subscribed, is_verified, subscribed_on) VALUES ($1, $2 $3, $4, $5)) RETURNING *'
//       ,[firstname, email, is_subscribed,is_verified, subscribed_on];
// ;

//     const values = [firstname, email];
//     const result = await db.query(query, values);
//     res.status(201).json(result.rows[0]);
// } catch (error) {
//   res.status(500).json({ error: 'Failed to subscribe' });
// }
//   const newSubscription =req.body;

//const emailSubscription = createSubscription(newSubscription)
//     if (emailSubscription) {
//       // return a success message/object
//       res.status(200).json({
//         status: 'success',
//         message: 'You have been successfully subscribed!',
//           success: true,
//         payload: addBook[0],
//       });
//     }
//   } catch (error) {
//     // send json response with message regarding error
//     res.status(500).json({ status: 'error', message: error });
//   }

//INDEX SUBSCRIPTION
router.get('/', async (req, res) => {
  console.log(req.body);
  try {
    const allSubscriptions = await getAllSubscriptions();

    res.status(200).json({ success: true, payload: allSubscriptions });
  } catch (error) {
    res.status(404).json({ sucess: false, message: 'no Books found' });
  }
});

//single
router.get('/subscribe/:email', async (req, res) => {
  const { email } = req.params;
  try {
    
    const subscriptionFound = await getASubscription(email);
    res.status(200).json({ success: true, payload: subscriptionFound });
  } catch (error) {
    res
      .status(404)
      .json({
        success: false,
        message: 'Cannot find the subscription with the given email',
      });
  }
});

//PUT /subscriptions
router.put('/verify/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { is_subscribed, is_verified } = req.body;
    const updatedSubscription = await updateSubscription(req.body, email);
    res.status(200).json({ success: true, payload: updatedSubscription });
    // const query =
    // 'UPDATE email_subscriptions SET is_verified = true WHERE id = $1 RETURNING *';
    //   'UPDATE subscriptions SET is_subscribed = $1, is_verified = $2 WHERE email = $3 RETURNING *';
    //   //, [is_subscribed, is_verified, email]
    //   // const values = [id];
    // const values = [email];
    // const result = await db.query(query, values);
    // res.status(200).json(result.rows[0]);
  } catch (error) {
    // res.status(500).json({ error: 'Failed to update subscription' });
    res
      .status(404)
      .json({ success: false, message: 'Subscription info cannot be updated' });
  }
});

//DELETE Subscription
router.delete('/unsubscribe:email', async (req, res) => {
  try {
    const { email } = req.params;
    const deletedSubscription = await deleteSubscription(email);
    res.status(200).json({ success: true, payload: deletedSubscription });
    // const query = 'DELETE FROM subscriptions WHERE email = $1';
    // const values = [id];
    // await db.query(query, values);
    // res.status(204).send();
  } catch (error) {
    // res.status(500).json({ error: 'Failed to unsubscribe' });
    res
      .status(404)
      .json({
        success: false,
        message: 'Sorry ! Subscription could not be cancelled at this moment',
      });
  }
});

module.exports = router;
